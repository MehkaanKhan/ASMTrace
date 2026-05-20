"""
Creates the full backend/ directory tree with config files.
Run once from the ASMTrace root before docker compose build.

Usage:
    python tools/scaffold_backend.py
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
BACKEND = ROOT / "backend"


def write(rel: str, content: str) -> None:
    path = BACKEND / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  created {rel}")


def mkdir(rel: str) -> None:
    (BACKEND / rel).mkdir(parents=True, exist_ok=True)
    print(f"  mkdir   {rel}")


def main() -> None:
    if BACKEND.exists():
        print(f"backend/ already exists at {BACKEND}")
        print("Delete it first if you want a clean scaffold.")
        sys.exit(1)

    print(f"Scaffolding backend at {BACKEND} ...")

    # ── pyproject.toml ────────────────────────────────────────────────────────
    write("pyproject.toml", """\
[project]
name = "asmtrace-backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.111.0",
    "uvicorn[standard]>=0.30.0",
    "python-multipart>=0.0.9",
    "pydantic>=2.7.0",
    "pydantic-settings>=2.3.0",
    "capstone==5.0.1",
    "unicorn==2.0.1.post1",
    "anthropic>=0.30.0",
    "jsonschema>=4.22.0",
    "sqlalchemy[asyncio]>=2.0.30",
    "asyncpg>=0.29.0",
    "alembic>=1.13.1",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "httpx>=0.27.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.2.0",
    "pytest-asyncio>=0.23.7",
    "httpx>=0.27.0",
]

[tool.pytest.ini_options]
asyncio_mode = "auto"
""")

    # ── Dockerfile ────────────────────────────────────────────────────────────
    write("Dockerfile", """\
FROM python:3.11-slim

WORKDIR /app

# System deps for Unicorn + Capstone
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc g++ make libffi-dev \\
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
""")

    # ── .env.example ─────────────────────────────────────────────────────────
    write(".env.example", """\
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql+asyncpg://asmtrace:password@db:5432/asmtrace
SECRET_KEY=changeme_generate_32_random_bytes
ACCESS_TOKEN_EXPIRE_MINUTES=480
POSTGRES_USER=asmtrace
POSTGRES_PASSWORD=changeme
POSTGRES_DB=asmtrace
""")

    # ── docker-compose.yml (in project root) ──────────────────────────────────
    dc_path = ROOT / "docker-compose.yml"
    dc_path.write_text("""\
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./.tmp:/tmp/asmtrace
    env_file: .env
    depends_on:
      db:
        condition: service_healthy

  frontend:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev -- --host"
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-asmtrace}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: ${POSTGRES_DB:-asmtrace}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER:-asmtrace}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
""", encoding="utf-8")
    print(f"  created ../docker-compose.yml")

    # ── nginx.conf (in project root) ──────────────────────────────────────────
    nginx_path = ROOT / "nginx.conf"
    nginx_path.write_text("""\
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
""", encoding="utf-8")
    print(f"  created ../nginx.conf")

    # ── App source skeleton ───────────────────────────────────────────────────
    for d in [
        "app/routers", "app/services", "app/models", "app/schemas",
        "tests", "samples",
    ]:
        mkdir(d)

    stubs = {
        "app/__init__.py": "",
        "app/routers/__init__.py": "",
        "app/services/__init__.py": "",
        "app/models/__init__.py": "",
        "app/schemas/__init__.py": "",

        "app/config.py": '''\
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./asmtrace.db"
    secret_key: str = "changeme"
    access_token_expire_minutes: int = 480


settings = Settings()
''',
        "app/main.py": '''\
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analysis, samples

app = FastAPI(title="ASMTrace API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/analyze", tags=["analysis"])
app.include_router(samples.router, prefix="/samples", tags=["samples"])


@app.get("/health")
async def health():
    return {"status": "ok"}
''',
        "app/dependencies.py": "# TODO: DB session, auth injection (Phase 2/4)\n",

        "app/routers/analysis.py": '''\
from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def analyze():
    # TODO: implement in Phase 2
    return {"message": "Phase 2 coming soon"}
''',
        "app/routers/samples.py": '''\
from fastapi import APIRouter

router = APIRouter()

SAMPLE_METADATA = [
    {"id": "hello_world", "displayName": "Hello World", "riskLevel": "SAFE",
     "description": "Simple write + exit syscalls.", "tags": ["beginner", "syscall"]},
    {"id": "keylogger", "displayName": "Keylogger", "riskLevel": "SUSPICIOUS",
     "description": "Reads /dev/input, writes to hidden file.", "tags": ["input", "filesystem"]},
    {"id": "shellcode", "displayName": "Shellcode", "riskLevel": "DANGEROUS",
     "description": "Executes /bin/sh via execve.", "tags": ["exploitation", "shell"]},
    {"id": "rootkit", "displayName": "Rootkit", "riskLevel": "DANGEROUS",
     "description": "Probes /proc/modules and escalates privileges.", "tags": ["privilege", "kernel"]},
]


@router.get("")
async def list_samples():
    return SAMPLE_METADATA
''',
        "app/schemas/trace.py": "# TODO: implement Pydantic v2 models (Phase 2)\n",
        "app/schemas/report.py": "# TODO: implement Pydantic v2 models (Phase 2)\n",
        "app/schemas/auth.py": "# TODO: implement JWT schemas (Phase 4)\n",
        "app/services/disassembler.py": "# TODO: implement Capstone wrapper (Phase 2)\n",
        "app/services/emulator.py": "# TODO: implement Unicorn wrapper (Phase 2)\n",
        "app/services/trace_collector.py": "# TODO: implement trace collector (Phase 2)\n",
        "app/services/ai_analyst.py": "# TODO: implement Claude API client (Phase 3)\n",
        "app/services/pdf_exporter.py": "# TODO: implement PDF export (Phase 4)\n",
        "app/models/base.py": "# TODO: implement SQLAlchemy base (Phase 4)\n",
        "app/models/analysis.py": "# TODO: implement Analysis model (Phase 4)\n",
        "app/models/user.py": "# TODO: implement User model (Phase 4)\n",
        "tests/__init__.py": "",
        "tests/test_disassembler.py": "# TODO: implement Capstone tests (Phase 2)\n",
        "tests/test_emulator.py": "# TODO: implement Unicorn tests (Phase 2)\n",
        "tests/test_ai_analyst.py": "# TODO: implement Claude API tests (Phase 3)\n",
    }

    for rel, content in stubs.items():
        write(rel, content)

    print("\nScaffold complete.")
    print("Next: docker compose build api")
    print("Then: docker compose run --rm api python tools/test_unicorn_env.py")


if __name__ == "__main__":
    main()
