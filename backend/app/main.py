from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import analysis, samples, reports, auth, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="ASMTrace API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router,  prefix="/analyze",   tags=["analysis"])
app.include_router(samples.router,   prefix="/samples",   tags=["samples"])
app.include_router(reports.router,   prefix="/report",    tags=["reports"])
app.include_router(auth.router,      prefix="/auth",      tags=["auth"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])


@app.get("/health")
async def health():
    return {"status": "ok"}
