# Phase 3: Live AI Integration

## Objective
Integrate the Anthropic API (claude-sonnet-4-6) to generate real behavioral analysis reports from execution traces. Reports stream to the frontend in real time. By end of Week 7, uploading any binary produces a live Claude-generated analysis report with verdict, narrative, MITRE mapping, and concept explanations.

## Inputs
- Phase 2 backend complete and running
- `ANTHROPIC_API_KEY` set in `.env`
- `tools/validate_ai_response.py` available
- `tools/check_api_quota.py` available
- This workflow

## Preflight Checks
```bash
python tools/check_api_quota.py
```
Must return rate-limit headers without error. If it fails, verify `ANTHROPIC_API_KEY` in `.env`.

## Steps

### Step 1 — Install Anthropic SDK
Add to `backend/pyproject.toml`:
```
anthropic>=0.30.0
```
Rebuild Docker image: `docker compose build api`

### Step 2 — Design the prompt template
File: `backend/app/services/ai_analyst.py`

**System prompt** (constant string, never changes between requests):
```
You are ASMTrace, an expert assembly language analyst and educator for university computer architecture students.

Analyze execution traces and produce educational behavioral reports. Your audience is undergraduate CS students learning x86-64 assembly and OS interfaces.

CRITICAL: Respond with ONLY valid JSON matching this exact schema. No text before or after the JSON object.

Schema:
{
  "verdict": "SAFE|SUSPICIOUS|DANGEROUS",
  "confidence": <integer 0-100>,
  "narrative": "<markdown string, 2-4 paragraphs>",
  "behaviors": [
    {
      "category": "filesystem|network|memory|privilege|process|crypto",
      "name": "<short behavior name>",
      "description": "<1-2 sentence technical description>",
      "risk_score": <integer 0-100>,
      "mitre_id": "<T-number or empty string>",
      "mitre_name": "<technique name or empty string>",
      "syscalls": ["<syscall name>", ...]
    }
  ],
  "concepts": [
    {
      "term": "<technical term>",
      "definition": "<2-3 sentence educational definition>",
      "course_topic": "<course module name>"
    }
  ]
}

Verdict rules:
- SAFE: All behaviors expected for declared program type. No suspicious syscall sequences.
- SUSPICIOUS: One+ behaviors deviate from expected patterns but could be legitimate.
- DANGEROUS: Clear malicious pattern: shellcode injection, privilege escalation, keylogging, rootkit activity, C2 patterns.
```

**User message builder** (assembled per request from TraceData):
```python
def build_user_message(trace: TraceData) -> str:
    syscall_names = list({s.name for s in trace.syscalls})
    syscall_seq = [{"step": s.index, "name": s.name, "args": s.args, "ret": s.returnValue} 
                   for s in trace.syscalls]
    # Include first 50 + last 20 instructions to stay within context limits
    summary_steps = trace.steps[:50] + trace.steps[-20:] if len(trace.steps) > 70 else trace.steps
    mem_events = [s.memoryAccess for s in trace.steps if s.memoryAccess]
    final_regs = trace.steps[-1].registers if trace.steps else {}

    return f"""Architecture: {trace.architecture}
Total instructions executed: {trace.totalInstructions}
Unique syscalls observed: {', '.join(syscall_names)}

Syscall sequence:
{json.dumps(syscall_seq, indent=2)}

Instruction summary (first 50 + last 20):
{json.dumps([s.model_dump() for s in summary_steps], indent=2)}

Memory access patterns:
{json.dumps(mem_events, indent=2)}

Final register state:
{json.dumps(final_regs, indent=2)}

Identify all behaviors, assign MITRE techniques, calculate risk scores, explain each concept for students."""
```

### Step 3 — Implement the Claude API client
```python
import anthropic
import json
import collections
import time

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

# Rate limiting: max 50 requests per 60 seconds
_request_times: collections.deque = collections.deque()

def _check_rate_limit():
    now = time.time()
    _request_times.append(now)
    # Remove entries older than 60 seconds
    while _request_times and _request_times[0] < now - 60:
        _request_times.popleft()
    if len(_request_times) > 50:
        raise RateLimitError(retry_after=60 - (now - _request_times[0]))

async def analyze_trace(trace: TraceData) -> AIReport:
    _check_rate_limit()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": build_user_message(trace)}]
    )
    raw = message.content[0].text
    return parse_and_validate(raw)
```

### Step 4 — Response validation
```python
import jsonschema

AI_REPORT_SCHEMA = {
    "type": "object",
    "required": ["verdict", "confidence", "narrative", "behaviors", "concepts"],
    "properties": {
        "verdict": {"enum": ["SAFE", "SUSPICIOUS", "DANGEROUS"]},
        "confidence": {"type": "integer", "minimum": 0, "maximum": 100},
        "narrative": {"type": "string", "minLength": 1},
        "behaviors": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["category", "name", "description", "risk_score", "mitre_id", "mitre_name", "syscalls"],
                "properties": {
                    "category": {"enum": ["filesystem","network","memory","privilege","process","crypto"]},
                    "risk_score": {"type": "integer", "minimum": 0, "maximum": 100}
                }
            }
        },
        "concepts": {
            "type": "array",
            "items": {"type": "object", "required": ["term", "definition", "course_topic"]}
        }
    }
}

def parse_and_validate(raw: str) -> AIReport:
    try:
        data = json.loads(raw)
        jsonschema.validate(data, AI_REPORT_SCHEMA)
        return AIReport(**data)
    except json.JSONDecodeError as e:
        raise AIResponseError(f"Claude returned invalid JSON: {e}")
    except jsonschema.ValidationError as e:
        raise AIResponseError(f"Claude response schema mismatch: {e.message}")
```

Run `python tools/validate_ai_response.py` against sample Claude outputs before wiring to the router.

### Step 5 — Streaming endpoint
File: `backend/app/routers/reports.py`

```python
from fastapi.responses import StreamingResponse

@router.get("/report/{trace_id}")
async def stream_report(trace_id: str):
    trace = load_trace(trace_id)  # reads from .tmp/{trace_id}.json

    async def generate():
        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": build_user_message(trace)}]
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'chunk': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
```

### Step 6 — Frontend streaming hook
File: `frontend/src/hooks/useStreamingReport.ts`

```typescript
export function useStreamingReport(traceId: string | null) {
  const [rawJson, setRawJson] = useState('');
  const [report, setReport] = useState<AIReport | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!traceId) return;
    setStreaming(true);
    setRawJson('');
    const es = new EventSource(`/api/report/${traceId}`);
    es.onmessage = (e) => {
      if (e.data === '[DONE]') {
        es.close();
        setStreaming(false);
        return;
      }
      const { chunk } = JSON.parse(e.data);
      setRawJson(prev => {
        const next = prev + chunk;
        try { setReport(JSON.parse(next)); } catch {}  // parse when complete
        return next;
      });
    };
    es.onerror = () => { setError('Stream failed'); es.close(); setStreaming(false); };
    return () => es.close();
  }, [traceId]);

  return { report, streaming, error };
}
```

Update `ReportPanel.tsx` to use `useStreamingReport` instead of reading from the store directly. Show narrative building up character-by-character while streaming (display whatever partial JSON can be rendered as narrative text).

### Step 7 — Rate limit error handling
Update `frontend/src/api/analysis.ts` to handle 429 responses:
```typescript
if (error.response?.status === 429) {
  const retryAfter = error.response.headers['retry-after'] ?? 60;
  uiStore.setError(`Rate limit reached. Retry in ${retryAfter}s.`);
}
```

### Step 8 — Full integration test
1. Start backend + frontend: `docker compose up`
2. Upload hello_world binary
3. Navigate to ReportPanel — narrative must stream in real time
4. Verify final report has verdict, behaviors with MITRE IDs, and concepts
5. Run `python tools/validate_ai_response.py` on saved response from .tmp/
6. Upload shellcode binary — verify DANGEROUS verdict
7. Test rate limit: send 5 requests rapidly — 6th must return 429 with retry-after

## Expected Outputs
- `GET /report/{id}` returns SSE stream of Claude analysis
- Frontend ReportPanel streams narrative in real time
- All 4 sample programs produce valid AIReport JSON
- Rate limiting enforced at 50 req/60s
- Malformed Claude responses return structured error (not 500)

## Edge Cases
- **Claude returns prose before JSON**: strip everything before first `{` with `raw[raw.index('{'):]`
- **Streaming timeout**: set `read_timeout=120` on the Anthropic client — reports can take 30–45s
- **Empty behaviors array**: valid but warn in logs — means Claude found no distinct behaviors
- **Very long trace (>100k instructions)**: truncate instruction summary to first 100 + last 50 before sending to Claude — the 50+20 rule in `build_user_message` handles this
- **Quota exhaustion**: catch `anthropic.RateLimitError` from SDK (distinct from our custom rate limiter) and return 503 with "API quota exhausted"
