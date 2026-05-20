from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_professor
from app.models.analysis import Analysis
from app.models.user import User

router = APIRouter()


@router.get("")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_professor),
):
    result = await db.execute(select(Analysis).order_by(Analysis.created_at.desc()))
    rows = result.scalars().all()
    return [
        {
            "id": row.id,
            "trace_id": row.trace_id,
            "program_name": row.program_name,
            "verdict": row.verdict,
            "confidence": row.confidence,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]
