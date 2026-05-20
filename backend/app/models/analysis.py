from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.models.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True)
    trace_id = Column(String(36), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    program_name = Column(String(255), nullable=False)
    verdict = Column(String(20), nullable=True)   # SAFE / SUSPICIOUS / DANGEROUS
    confidence = Column(Integer, nullable=True)
    report_json = Column(Text, nullable=True)      # full AIReport as JSON string
    created_at = Column(DateTime, server_default=func.now())
