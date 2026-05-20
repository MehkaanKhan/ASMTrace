from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel


class RegisterState(BaseModel):
    rax: str; rbx: str; rcx: str; rdx: str
    rsi: str; rdi: str; rsp: str; rbp: str
    rip: str; rflags: str


InstructionCategory = Literal[
    "data_move", "arithmetic", "control_flow", "syscall", "memory", "crypto"
]
BehaviorCategory = Literal[
    "filesystem", "network", "memory", "privilege", "process", "crypto"
]


class MemoryAccess(BaseModel):
    address: str
    size: int
    type: Literal["read", "write"]
    value: Optional[str] = None


class InstructionStep(BaseModel):
    index: int
    address: str
    bytes: str
    mnemonic: str
    operands: str
    category: InstructionCategory
    isSyscall: bool
    syscallName: Optional[str] = None
    registers: RegisterState
    memoryAccess: Optional[MemoryAccess] = None
    annotation: str


class SyscallEvent(BaseModel):
    index: int
    name: str
    number: int
    args: list[str]
    returnValue: str
    category: BehaviorCategory


class TraceData(BaseModel):
    programName: str
    architecture: Literal["x86_64"]
    totalInstructions: int
    steps: list[InstructionStep]
    syscalls: list[SyscallEvent]
