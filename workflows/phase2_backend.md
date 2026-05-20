# Phase 2: Backend & Real Tracing

## Objective
Implement the FastAPI backend with Capstone disassembly and Unicorn emulation. By the end of Week 5, real binary files can be uploaded and analyzed, producing a TraceData JSON response that the frontend displays live.

## Inputs
- Docker Desktop with WSL2 backend installed and running
- `tools/scaffold_backend.py` available
- `tools/test_unicorn_env.py` available
- Phase 1 frontend complete
- This workflow

## Preflight Checks (MUST pass before writing any code)
```bash
wsl --status           # WSL2 must be installed and running
docker version         # Docker daemon must be reachable
docker compose version # v2 compose plugin required
```
If either fails, resolve before proceeding — all Unicorn work runs in Docker only.

## Steps

### Step 1 — Scaffold backend project
```bash
python tools/scaffold_backend.py
```
This creates `backend/` tree, `pyproject.toml` with pinned deps, `Dockerfile`, and `docker-compose.yml`.

### Step 2 — Verify Docker environment
```bash
docker compose build api
docker compose run --rm api python tools/test_unicorn_env.py
```
Expected output: Unicorn version, successful MOV RAX, 1 emulation, CPU state dump. If this fails, fix the Docker environment before proceeding — do not attempt Unicorn development outside Docker.

### Step 3 — FastAPI application skeleton
Author these files in order (each depends on the previous):
1. `backend/app/config.py` — Pydantic Settings reading from .env
2. `backend/app/dependencies.py` — DB session stub (Phase 4), request ID injection
3. `backend/app/main.py` — FastAPI factory, CORS middleware (allow localhost:5173), lifespan context manager
4. `backend/app/schemas/trace.py` — Pydantic v2 models matching frontend `src/types/trace.ts` exactly
5. `backend/app/schemas/report.py` — Pydantic v2 models matching frontend `src/types/report.ts`
6. `backend/app/routers/samples.py` — `GET /samples` returning hardcoded list of 4 sample metadata objects

Verify: `docker compose up api` starts without error, `GET http://localhost:8000/samples` returns JSON.

### Step 4 — Capstone disassembler service
File: `backend/app/services/disassembler.py`

```python
import capstone

def disassemble(binary: bytes, base_address: int = 0x400000) -> list[dict]:
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
    md.detail = True
    instructions = []
    for i, insn in enumerate(md.disasm(binary, base_address)):
        instructions.append({
            "index": i,
            "address": hex(insn.address),
            "bytes": insn.bytes.hex(" "),
            "mnemonic": insn.mnemonic,
            "operands": insn.op_str,
            "category": classify_instruction(insn),
        })
    return instructions
```

Implement `classify_instruction(insn)` mapping Capstone instruction groups to InstructionCategory values.

Test with `backend/tests/test_disassembler.py` using hand-crafted byte sequences.

### Step 5 — Unicorn emulator service
File: `backend/app/services/emulator.py`

Key constraints (MUST enforce):
```python
uc.emu_start(start_addr, stop_addr, timeout=10_000_000, count=100_000)
```
- 10,000,000 microseconds = 10 seconds wall clock maximum
- 100,000 instruction maximum — prevents infinite loops

Architecture:
1. Initialize UC_ARCH_X86 + UC_MODE_64 engine
2. Map stack memory at 0x7ffd00000000 (2MB)
3. Map code memory at 0x400000 (binary size, rounded up to 4KB)
4. Write binary to code region
5. Hook UC_HOOK_CODE — capture each instruction (address, size, current registers)
6. Hook UC_HOOK_MEM_READ/WRITE — capture memory events
7. Hook UC_HOOK_INSN for UC_X86_INS_SYSCALL — intercept every syscall
8. Call `uc.emu_start(...)` with limits
9. Collect all hook events into ordered list

Syscall hook must:
- Read RAX (syscall number) + RDI/RSI/RDX/R10/R8/R9 (args)
- Map syscall number to Linux x86-64 ABI name (maintain a dict of the top 50 syscalls)
- Classify syscall into BehaviorCategory
- Simulate safe return values (write → return arg2 size, exit → stop emulation cleanly)

Test with `backend/tests/test_emulator.py` using compiled hello_world ELF.

### Step 6 — Trace collector service
File: `backend/app/services/trace_collector.py`

Takes the raw hook events from the emulator and produces a structured `TraceData` dict:
- Merge instruction events with their register snapshots
- Annotate syscall instructions with syscall name
- Deduplicate and sort by instruction index
- Serialize to the schema from `schemas/trace.py`

### Step 7 — Analysis endpoint
File: `backend/app/routers/analysis.py`

```
POST /analyze
  Body: multipart/form-data — file: UploadFile (binary) OR sample_id: str
  Response: { "trace_id": "<uuid>", "trace": <TraceData> }
```

Implementation:
1. If `sample_id` provided: load binary from `backend/samples/{sample_id}.bin`
2. If file uploaded: validate extension (.asm compiled or .bin), strip path: `Path(file.filename).name`
3. Call `disassembler.disassemble(binary)`
4. Call `emulator.run(binary)` — catch `EmulationError` and return 422
5. Call `trace_collector.collect(disasm_result, emulation_events)`
6. Store trace in `.tmp/{trace_id}.json`
7. Return trace_id + full TraceData

```
GET /trace/{trace_id}
  Response: TraceData
```

### Step 8 — Docker Compose configuration
```yaml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app", "./.tmp:/tmp/asmtrace"]
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [api]
```

Do NOT mount `backend/samples/` from the Windows host — store sample binaries inside the Docker image to avoid Windows Defender triggering on shellcode samples.

### Step 9 — Frontend integration
Update `frontend/src/api/analysis.ts`:
- Implement `POST /analyze` with `FormData` for file upload
- Implement `GET /trace/{id}`

Update `frontend/src/components/panels/UploadPanel.tsx`:
- Activate the dropzone file input
- On submit: call `analyzeFile()` → store result in analysisStore → navigate to trace panel

Keep all mock data — rendered as fallback when backend is unavailable (show "Using demo data" banner).

### Step 10 — Integration test
1. `docker compose up --build`
2. Open frontend at localhost:5173
3. Upload a real compiled ELF (hello_world compiled with `nasm -f elf64`)
4. Verify TracePanel shows real disassembled instructions
5. Verify syscalls appear with correct names
6. Verify register state updates per step

## Expected Outputs
- `backend/` — FastAPI app running in Docker
- `docker-compose.yml` — starts both services with one command
- `POST /analyze` returns real TraceData for uploaded binaries
- Frontend displays real trace data from backend
- All 4 sample binaries pre-loaded inside Docker image

## Edge Cases
- **Binary too large**: reject files > 1MB with 413 error
- **Non-ELF input**: Capstone will still attempt disassembly; emulator will fail; return 422 with message "Binary format not supported"
- **Emulation timeout**: `unicorn.UcError` with `UC_ERR_TIMEOUT` — return partial trace with warning flag
- **Windows Defender**: if shellcode samples trigger Defender during Docker build, add `backend/samples/` to Defender exclusions or store samples as base64-encoded strings in a Python file
- **Syscall not in dict**: log unknown syscall number, return name as `"sys_unknown_{number}"`
