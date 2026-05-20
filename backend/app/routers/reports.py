import json
from typing import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.analysis import Analysis
from app.services.ai_analyst import stream_report, validate_report
from app.store import _traces

router = APIRouter()


async def _stream_and_persist(trace_id: str, db: AsyncSession) -> AsyncIterator[str]:
    trace = _traces.get(trace_id)
    if trace is None:
        yield "data: [ERROR] Trace not found\n\n"
        return

    accumulated = ""
    async for chunk in stream_report(trace):
        yield chunk
        # Accumulate the JSON text from non-control SSE lines
        if chunk.startswith("data: ") and not chunk.startswith("data: ["):
            accumulated += chunk[6:].rstrip("\n").replace("\\n", "\n")
        elif chunk.strip() == "data: [DONE]":
            try:
                report = validate_report(accumulated)
                result = await db.execute(
                    select(Analysis).where(Analysis.trace_id == trace_id)
                )
                row = result.scalar_one_or_none()
                if row:
                    row.verdict = report.verdict
                    row.confidence = report.confidence
                    row.report_json = json.dumps(report.model_dump())
                    await db.commit()
            except Exception:
                pass  # best-effort persistence — never break the stream


@router.get("/{trace_id}")
async def get_report(trace_id: str, db: AsyncSession = Depends(get_db)):
    if trace_id not in _traces:
        raise HTTPException(404, "Trace not found")
    return StreamingResponse(
        _stream_and_persist(trace_id, db),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
