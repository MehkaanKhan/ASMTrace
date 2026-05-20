# Phase 4: Course Features & Polish

## Objective
Add authentication, PostgreSQL persistence, professor dashboard, student submission portal, quiz mode, PDF export, and production deployment. By end of Week 9, ASMTrace is deployed and ready for classroom use.

## Inputs
- Phase 3 AI integration complete
- Docker Desktop running
- PostgreSQL image available (pulled automatically by Docker Compose)
- This workflow

## Steps

### Step 1 — PostgreSQL schema and migrations
Add to `docker-compose.yml`:
```yaml
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes: ["pgdata:/var/lib/postgresql/data"]
    ports: ["5432:5432"]

volumes:
  pgdata:
```

Add to `.env`:
```
POSTGRES_USER=asmtrace
POSTGRES_PASSWORD=<generate 24-char random string>
POSTGRES_DB=asmtrace
DATABASE_URL=postgresql+asyncpg://asmtrace:<password>@db:5432/asmtrace
```

Author SQLAlchemy models:
- `backend/app/models/base.py` — declarative base, UUID primary key mixin
- `backend/app/models/user.py` — id, email, hashed_password, role (student|professor), created_at
- `backend/app/models/analysis.py` — id, user_id (FK), trace_json, report_json, verdict, created_at, program_name

Initialize Alembic:
```bash
docker compose run --rm api alembic init alembic
docker compose run --rm api alembic revision --autogenerate -m "initial schema"
docker compose run --rm api alembic upgrade head
```

### Step 2 — JWT authentication
Add to `.env`:
```
SECRET_KEY=<generate 32+ random bytes, base64-encoded>
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

Add to `pyproject.toml`: `python-jose[cryptography]>=3.3.0`, `passlib[bcrypt]>=1.7.4`

File: `backend/app/routers/auth.py`
```
POST /auth/register  — email + password → creates user, returns access_token
POST /auth/login     — email + password → returns access_token
GET  /auth/me        — returns current user profile
```

File: `backend/app/dependencies.py` — add `get_current_user` dependency that validates JWT from Authorization header.

Protect `POST /analyze` with `get_current_user` dependency. Store trace + report linked to user_id.

### Step 3 — Student submission portal
Update `POST /analyze` to save TraceData + AIReport to the `analyses` table after report generation.

New endpoints in `backend/app/routers/analysis.py`:
```
GET /submissions           — returns current user's analysis history (paginated)
GET /submissions/{id}      — returns full TraceData + AIReport for one submission
```

Frontend: Add `/history` route rendering a table of past submissions with verdict badges.

### Step 4 — Professor dashboard
Add `role` field to JWT claims. Professor role check in `get_current_user`.

New endpoint: `GET /professor/submissions` — returns all users' submissions, filterable by verdict/date/student.

Frontend: Add `/dashboard` route (professor only) with:
- Summary stats (total analyses, breakdown by verdict)
- Table of all student submissions with student email, program name, verdict, timestamp
- Click to view full report

### Step 5 — Quiz mode
After a report is generated, generate 3–5 multiple-choice questions from `report.concepts` using Claude:

Prompt: `"Given this list of concepts from an assembly analysis: {concepts}, generate 3 multiple-choice questions to test student understanding. Return JSON array: [{question, options: [A,B,C,D], correct: 'A'}]"`

File: `backend/app/services/quiz_generator.py`

Frontend: Add quiz button to LearnPanel. On click: fetch questions → render one at a time with A/B/C/D buttons → show score at end.

### Step 6 — PDF export (professional)
Add Node.js sidecar to `docker-compose.yml`:
```yaml
  pdf:
    image: node:20-alpine
    command: node /app/pdf_server.js
    ports: ["3001:3001"]
    volumes: ["./backend/pdf_server:/app"]
```

File: `backend/pdf_server/pdf_server.js` — Express server that accepts `POST /render` with HTML body, uses Puppeteer to render to PDF, returns binary.

File: `backend/app/services/pdf_exporter.py` — calls `http://pdf:3001/render` with rendered report HTML, returns PDF bytes.

Endpoint: `GET /report/{id}/pdf` — generates PDF, returns with `Content-Disposition: attachment`.

Frontend: Update `ExportButton.tsx` to offer two options: "Print (Browser)" and "Download PDF (Professional)".

### Step 7 — UI/UX polish
- Add loading skeleton screens for TracePanel while backend processes
- Add error toast notifications (replace alert() with styled toasts)
- Add keyboard shortcuts: Space = play/pause, ArrowRight = step forward, ArrowLeft = step back
- Add dark/light mode toggle (Tailwind dark: classes)
- Ensure WCAG AA contrast ratios (check with browser accessibility tools)
- Add responsive breakpoints for tablet (768px)

### Step 8 — Performance optimization
- Virtualize the InstructionRow list (react-window or @tanstack/virtual) — prevents DOM overload with 100k+ step traces
- Cache analysis results: if same binary hash submitted twice, return cached report
- Add `Cache-Control` headers to `GET /trace/{id}` and `GET /report/{id}` (immutable, 1 year)
- Add compression middleware to FastAPI (`GZipMiddleware`)

### Step 9 — Security audit
Before production deployment:
1. Run `safety check` on Python deps — fix any known CVEs
2. Run `npm audit` on frontend deps — fix high/critical
3. Verify no real syscalls execute during emulation (Unicorn is sandboxed by design, but add assertion)
4. Verify file upload sanitization: `Path(filename).name`, extension whitelist (.bin, .elf, .o)
5. Verify JWT expiry enforced
6. Verify SQL injection impossible (SQLAlchemy ORM with parameterized queries — no raw SQL)
7. Verify CORS only allows localhost:5173 in development, production domain in prod

### Step 10 — Production deployment
Production `docker-compose.prod.yml`:
```yaml
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/conf.d/default.conf", "./certs:/etc/nginx/certs"]
    depends_on: [api, frontend]

  api:
    build: ./backend
    environment: [NODE_ENV=production]
    env_file: .env.prod
    depends_on: [db]

  frontend:
    build:
      context: ./frontend
      args: [VITE_API_BASE_URL=https://your-domain.com]

  db:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
```

`nginx.conf`: Proxy `/api/` to FastAPI, serve React build from `/`.

Deployment checklist:
- [ ] `tsc --noEmit` passes
- [ ] `pytest backend/tests/` passes (80%+ coverage)
- [ ] `docker compose -f docker-compose.prod.yml up --build` starts cleanly
- [ ] All 4 sample programs analyzed successfully in production build
- [ ] PDF export works
- [ ] Student registration + login works
- [ ] Professor dashboard accessible to professor role only
- [ ] Quiz mode generates and grades questions correctly

### Step 11 — Documentation
- `docs/api_schema.md` — OpenAPI endpoint reference (copy from `/docs` JSON)
- `docs/installation.md` — step-by-step setup from scratch
- `docs/user_guide.md` — student-facing: how to upload, read the trace, interpret the report
- `docs/professor_guide.md` — how to access dashboard, review submissions
- `docs/architecture.md` — 5-layer pipeline diagram + component descriptions

## Expected Outputs
- Production Docker Compose with nginx + PostgreSQL
- JWT auth with student/professor roles
- Student submission history persisted in PostgreSQL
- Professor dashboard with all student submissions
- Quiz mode with scored questions per analysis
- Professional PDF export
- Full documentation suite

## Edge Cases
- **Database migration on production update**: always run `alembic upgrade head` in entrypoint before FastAPI starts — add to Dockerfile CMD
- **Professor accessing student data**: row-level filtering in `GET /professor/submissions` — never return raw passwords or JWT tokens
- **Puppeteer in Docker Alpine**: must install Chromium separately (`apk add chromium`) — set `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`
- **Large PDF generation timeout**: set 60s timeout on Puppeteer renderring — return 503 with "PDF generation timed out, try browser print"
- **Concurrent analysis requests**: FastAPI async handles this, but Unicorn emulation is CPU-bound — consider a process pool (`concurrent.futures.ProcessPoolExecutor`) for the emulation step in production
