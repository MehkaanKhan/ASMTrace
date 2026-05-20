"""In-memory trace store shared across routers (replaced by DB in Phase 4)."""
from app.schemas.trace import TraceData

_traces: dict[str, TraceData] = {}
