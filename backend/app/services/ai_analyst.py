"""
Groq AI analyst — streams AIReport JSON using llama-3.3-70b-versatile.
Free tier: 14,400 requests/day, 500,000 tokens/day — no credit card needed.
Sign up at console.groq.com to get a free API key.
"""
from __future__ import annotations
import collections
import json
import time
from typing import AsyncIterator

import httpx

from app.config import settings
from app.schemas.trace import TraceData
from app.schemas.report import AIReport

_REQUEST_TIMES: collections.deque[float] = collections.deque()
RATE_LIMIT_MAX = 25
RATE_LIMIT_WINDOW = 60.0

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """\
You are a specialized x86-64 assembly code analyst for a university Computer Organization and Assembly Language course.

Analyze the provided execution trace and respond with ONLY a valid JSON object matching this exact schema — no markdown, no explanation, no extra text:

{
  "verdict": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
  "confidence": <integer 0-100>,
  "narrative": "<markdown string, 2-4 paragraphs>",
  "behaviors": [
    {
      "category": "filesystem"|"network"|"memory"|"privilege"|"process"|"crypto",
      "name": "<short name>",
      "description": "<one sentence>",
      "risk_score": <integer 0-100>,
      "mitre_id": "<T####.###>",
      "mitre_name": "<technique name>",
      "syscalls": ["<syscall1>", ...]
    }
  ],
  "concepts": [
    {
      "term": "<assembly/OS term>",
      "definition": "<clear definition for a CS student>",
      "course_topic": "<course topic this relates to>"
    }
  ]
}

Verdict rules:
- SAFE: no dangerous syscalls, no privilege escalation, no shell spawning — max behavior risk_score <= 30
- SUSPICIOUS: potentially harmful patterns but not confirmed exploitation — any risk_score 31-69
- DANGEROUS: confirmed exploitation indicators (execve shell, setuid(0), kernel write, mprotect+exec) — any risk_score >= 70

The narrative must be written for CS students learning assembly. Explain what the code does and why it is or isn't concerning.
Include 3-5 behaviors and 3-5 concepts drawn from the trace.
"""


def _check_rate_limit() -> tuple[bool, float]:
    now = time.time()
    while _REQUEST_TIMES and now - _REQUEST_TIMES[0] > RATE_LIMIT_WINDOW:
        _REQUEST_TIMES.popleft()
    if len(_REQUEST_TIMES) >= RATE_LIMIT_MAX:
        retry_after = RATE_LIMIT_WINDOW - (now - _REQUEST_TIMES[0])
        return False, retry_after
    _REQUEST_TIMES.append(now)
    return True, 0.0


def _build_user_message(trace: TraceData) -> str:
    syscall_names = [sc.name for sc in trace.syscalls]
    syscall_sequence = [
        {"index": sc.index, "name": sc.name, "args": sc.args, "category": sc.category}
        for sc in trace.syscalls
    ]

    steps = trace.steps
    summary_steps = steps[:50]
    if len(steps) > 70:
        summary_steps = steps[:50] + steps[-20:]

    insn_summary = [
        {
            "i": s.index,
            "addr": s.address,
            "op": f"{s.mnemonic} {s.operands}".strip(),
            "cat": s.category,
            "note": s.annotation,
        }
        for s in summary_steps
    ]

    memory_events = [
        {
            "i": s.index,
            "op": f"{s.mnemonic} {s.operands}".strip(),
            "access": {
                "addr": s.memoryAccess.address,
                "size": s.memoryAccess.size,
                "type": s.memoryAccess.type,
            } if s.memoryAccess else None,
        }
        for s in steps
        if s.memoryAccess or s.isSyscall
    ]

    final_regs = steps[-1].registers.model_dump() if steps else {}

    return f"""Architecture: x86_64
Program: {trace.programName}
Total instructions: {trace.totalInstructions}
Unique syscalls: {json.dumps(syscall_names)}
Syscall sequence: {json.dumps(syscall_sequence)}
Instruction summary (first 50 + last 20): {json.dumps(insn_summary)}
Memory/syscall events: {json.dumps(memory_events)}
Final register state: {json.dumps(final_regs)}
"""


async def stream_report(trace: TraceData) -> AsyncIterator[str]:
    """
    Yields SSE-formatted chunks: 'data: <text>\\n\\n'
    Final chunk is 'data: [DONE]\\n\\n' or 'data: [ERROR] <msg>\\n\\n'.
    """
    allowed, retry_after = _check_rate_limit()
    if not allowed:
        yield f"data: [ERROR] Rate limit exceeded. Retry in {retry_after:.0f}s\n\n"
        return

    if not settings.groq_api_key:
        yield "data: [ERROR] GROQ_API_KEY not configured — get a free key at console.groq.com\n\n"
        return

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_message(trace)},
        ],
        "max_tokens": 2048,
        "stream": True,
    }

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", GROQ_API_URL, json=payload, headers=headers) as resp:
                if resp.status_code != 200:
                    body = await resp.aread()
                    yield f"data: [ERROR] Groq API error {resp.status_code}: {body.decode()}\n\n"
                    return

                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        text = chunk["choices"][0]["delta"].get("content", "")
                        if text:
                            yield f"data: {text.replace(chr(10), chr(92) + 'n')}\n\n"
                    except (json.JSONDecodeError, KeyError):
                        continue

        yield "data: [DONE]\n\n"

    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"


def validate_report(json_text: str) -> AIReport:
    """Parse and validate the model's JSON output. Raises ValueError on bad output."""
    text = json_text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        text = text.rsplit("```", 1)[0].strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}") from e
    return AIReport.model_validate(data)
