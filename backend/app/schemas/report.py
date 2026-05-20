from __future__ import annotations
from typing import Literal
from pydantic import BaseModel

from app.schemas.trace import BehaviorCategory

Verdict = Literal["SAFE", "SUSPICIOUS", "DANGEROUS"]


class BehaviorEntry(BaseModel):
    category: BehaviorCategory
    name: str
    description: str
    risk_score: int
    mitre_id: str
    mitre_name: str
    syscalls: list[str]


class Concept(BaseModel):
    term: str
    definition: str
    course_topic: str


class AIReport(BaseModel):
    verdict: Verdict
    confidence: int
    narrative: str
    behaviors: list[BehaviorEntry]
    concepts: list[Concept]
