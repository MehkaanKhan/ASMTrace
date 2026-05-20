from __future__ import annotations
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.analysis import Analysis
from app.models.user import User
from app.services.trace_collector import collect
from app.store import _traces

router = APIRouter()

SAMPLES_DIR = Path(__file__).parent.parent.parent / "samples"
SAMPLE_IDS = {"hello_world", "keylogger", "shellcode", "rootkit"}


@router.post("")
async def analyze(
    file: UploadFile | None = File(default=None),
    sample_id: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    if sample_id and file:
        raise HTTPException(400, "Provide either file or sample_id, not both")

    if sample_id:
        if sample_id not in SAMPLE_IDS:
            raise HTTPException(404, f"Unknown sample_id: {sample_id}")
        sample_path = SAMPLES_DIR / f"{sample_id}.bin"
        if not sample_path.exists():
            raise HTTPException(404, f"Sample binary not found: {sample_id}.bin")
        binary = sample_path.read_bytes()
        name = sample_id

    elif file:
        safe_name = Path(file.filename or "upload").name
        binary = await file.read()
        if len(binary) > 10 * 1024 * 1024:
            raise HTTPException(413, "File too large (max 10 MB)")
        name = safe_name

    else:
        raise HTTPException(400, "Provide file or sample_id")

    trace = collect(binary, name)
    trace_id = str(uuid.uuid4())
    _traces[trace_id] = trace

    db_row = Analysis(
        trace_id=trace_id,
        program_name=name,
        user_id=current_user.id if current_user else None,
    )
    db.add(db_row)
    await db.commit()

    return {"trace_id": trace_id, "total_instructions": trace.totalInstructions}


@router.get("/{trace_id}")
async def get_trace(trace_id: str):
    trace = _traces.get(trace_id)
    if not trace:
        raise HTTPException(404, "Trace not found")
    return trace
