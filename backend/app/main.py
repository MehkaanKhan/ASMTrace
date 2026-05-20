from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import analysis, samples, reports, auth, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="ASMTrace API", version="0.1.0", lifespan=lifespan)

# Always allow localhost dev + GitHub Pages; add extras from env
_origins = [
    "http://localhost:5173",
    "https://mehkaankhan.github.io",
]
if settings.allowed_origins:
    _origins += [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
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
