FROM python:3.11-slim

WORKDIR /app

COPY backend/pyproject.toml .
RUN pip install -e .

COPY backend/app/ app/

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
