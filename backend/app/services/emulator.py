"""
Static register propagation — no CPU execution required.

Walks Capstone-disassembled instructions and tracks register values
where the operation is deterministic (MOV imm, XOR reg/reg, etc.).
Unknown values are represented as "0x?".
"""
from __future__ import annotations
from dataclasses import dataclass, field

from app.services.disassembler import RawInsn

UNKNOWN = "0x?"

# Linux x86-64 syscall table (number → name, category)
SYSCALL_TABLE: dict[int, tuple[str, str]] = {
    0:  ("read",        "filesystem"),
    1:  ("write",       "filesystem"),
    2:  ("open",        "filesystem"),
    3:  ("close",       "filesystem"),
    4:  ("stat",        "filesystem"),
    5:  ("fstat",       "filesystem"),
    9:  ("mmap",        "memory"),
    10: ("mprotect",    "memory"),
    11: ("munmap",      "memory"),
    16: ("ioctl",       "process"),
    22: ("pipe",        "process"),
    32: ("dup",         "process"),
    39: ("getpid",      "process"),
    56: ("clone",       "process"),
    57: ("fork",        "process"),
    59: ("execve",      "process"),
    60: ("exit",        "process"),
    62: ("kill",        "process"),
    102: ("getuid",     "privilege"),
    105: ("setuid",     "privilege"),
    107: ("getgid",     "privilege"),
    108: ("setgid",     "privilege"),
    110: ("getppid",    "process"),
    157: ("prctl",      "privilege"),
    231: ("exit_group", "process"),
}

# 64-bit register name → canonical key
REG_ALIASES: dict[str, str] = {
    "rax": "rax", "eax": "rax", "ax": "rax", "al": "rax", "ah": "rax",
    "rbx": "rbx", "ebx": "rbx", "bx": "rbx", "bl": "rbx",
    "rcx": "rcx", "ecx": "rcx", "cx": "rcx", "cl": "rcx",
    "rdx": "rdx", "edx": "rdx", "dx": "rdx", "dl": "rdx",
    "rsi": "rsi", "esi": "rsi", "si": "rsi", "sil": "rsi",
    "rdi": "rdi", "edi": "rdi", "di": "rdi", "dil": "rdi",
    "rsp": "rsp", "esp": "rsp",
    "rbp": "rbp", "ebp": "rbp",
    "rip": "rip",
}

MNEMONIC_CATEGORY: dict[str, str] = {
    "mov": "data_move", "movabs": "data_move", "movzx": "data_move",
    "movsx": "data_move", "lea": "data_move", "xchg": "data_move",
    "push": "data_move", "pop": "data_move",
    "add": "arithmetic", "sub": "arithmetic", "mul": "arithmetic",
    "imul": "arithmetic", "div": "arithmetic", "idiv": "arithmetic",
    "inc": "arithmetic", "dec": "arithmetic", "neg": "arithmetic",
    "and": "arithmetic", "or": "arithmetic", "xor": "arithmetic",
    "not": "arithmetic", "shl": "arithmetic", "shr": "arithmetic",
    "sar": "arithmetic",
    "jmp": "control_flow", "je": "control_flow", "jne": "control_flow",
    "jz": "control_flow", "jnz": "control_flow", "jl": "control_flow",
    "jg": "control_flow", "jle": "control_flow", "jge": "control_flow",
    "ja": "control_flow", "jb": "control_flow", "call": "control_flow",
    "ret": "control_flow", "loop": "control_flow", "cmp": "control_flow",
    "test": "control_flow", "hlt": "control_flow", "nop": "control_flow",
    "syscall": "syscall", "int": "syscall",
    "lods": "memory", "stos": "memory", "movs": "memory",
    "aes": "crypto", "aesenc": "crypto", "aesdec": "crypto",
    "sha256rnds2": "crypto",
}


@dataclass
class RegState:
    regs: dict[str, str] = field(default_factory=lambda: {
        "rax": UNKNOWN, "rbx": UNKNOWN, "rcx": UNKNOWN, "rdx": UNKNOWN,
        "rsi": UNKNOWN, "rdi": UNKNOWN, "rsp": "0x7fffffffe000",
        "rbp": UNKNOWN, "rip": UNKNOWN, "rflags": "0x202",
    })

    def snapshot(self) -> dict[str, str]:
        return dict(self.regs)

    def set(self, reg: str, val: str) -> None:
        key = REG_ALIASES.get(reg)
        if key:
            self.regs[key] = val

    def get(self, reg: str) -> str:
        key = REG_ALIASES.get(reg)
        return self.regs.get(key or reg, UNKNOWN)


def _parse_imm(s: str) -> str | None:
    s = s.strip()
    try:
        if s.startswith("0x") or s.startswith("-0x"):
            return hex(int(s, 16))
        val = int(s)
        return hex(val)
    except ValueError:
        return None


def _classify_memory(insn: RawInsn) -> tuple[str | None, int, str] | None:
    """Returns (address_hint, size, type) if instruction touches memory."""
    ops = insn.op_str
    if "[" not in ops:
        return None
    if "," in ops:
        left, _ = ops.split(",", 1)
        access_type = "write" if "[" in left else "read"
    else:
        access_type = "read"
    size = 8
    if "byte" in ops:
        size = 1
    elif "word" in ops:
        size = 2
    elif "dword" in ops:
        size = 4
    elif "qword" in ops:
        size = 8
    return (None, size, access_type)


def propagate(insns: list[RawInsn]) -> list[dict]:
    """
    Walk instructions, propagate register values, return per-step dicts
    with keys: registers, isSyscall, syscallName, syscallNumber,
               syscallCategory, memoryAccess, category, annotation.
    """
    state = RegState()
    steps = []

    for insn in insns:
        mn = insn.mnemonic.lower()
        ops = insn.op_str.strip()
        state.regs["rip"] = hex(insn.address)

        # ── register propagation ──────────────────────────────────────────────
        if mn in ("mov", "movabs") and "," in ops and "[" not in ops:
            dst, src = [x.strip() for x in ops.split(",", 1)]
            imm = _parse_imm(src)
            if imm:
                state.set(dst, imm)
            elif src in REG_ALIASES:
                state.set(dst, state.get(src))

        elif mn == "xor" and "," in ops:
            dst, src = [x.strip() for x in ops.split(",", 1)]
            if dst == src:
                state.set(dst, "0x0")

        elif mn == "lea" and "," in ops:
            dst, _ = [x.strip() for x in ops.split(",", 1)]
            state.set(dst, UNKNOWN)

        elif mn == "push" and "[" not in ops:
            val = state.get(ops) if ops in REG_ALIASES else (_parse_imm(ops) or UNKNOWN)
            try:
                rsp_val = int(state.regs["rsp"], 16) - 8
                state.regs["rsp"] = hex(rsp_val)
            except ValueError:
                pass

        elif mn == "pop" and "[" not in ops:
            state.set(ops, UNKNOWN)
            try:
                rsp_val = int(state.regs["rsp"], 16) + 8
                state.regs["rsp"] = hex(rsp_val)
            except ValueError:
                pass

        # ── syscall detection ─────────────────────────────────────────────────
        is_syscall = mn == "syscall" or (mn == "int" and ops == "0x80")
        syscall_name: str | None = None
        syscall_number: int | None = None
        syscall_category: str | None = None

        if is_syscall:
            rax = state.regs.get("rax", UNKNOWN)
            try:
                num = int(rax, 16)
                syscall_number = num
                if num in SYSCALL_TABLE:
                    syscall_name, syscall_category = SYSCALL_TABLE[num]
            except ValueError:
                pass

        # ── category ──────────────────────────────────────────────────────────
        category = MNEMONIC_CATEGORY.get(mn, "data_move")

        # ── memory access hint ────────────────────────────────────────────────
        mem = _classify_memory(insn)

        # ── annotation ───────────────────────────────────────────────────────
        annotation = _annotate(mn, ops, state, syscall_name)

        steps.append({
            "registers": state.snapshot(),
            "isSyscall": is_syscall,
            "syscallName": syscall_name,
            "syscallNumber": syscall_number,
            "syscallCategory": syscall_category,
            "memoryAccess": mem,
            "category": category,
            "annotation": annotation,
        })

    return steps


def _annotate(mn: str, ops: str, state: RegState, syscall_name: str | None) -> str:
    if syscall_name:
        rdi = state.get("rdi")
        rsi = state.get("rsi")
        rdx = state.get("rdx")
        return f"syscall {syscall_name}(rdi={rdi}, rsi={rsi}, rdx={rdx})"

    if mn in ("mov", "movabs") and "," in ops:
        dst, src = [x.strip() for x in ops.split(",", 1)]
        imm = _parse_imm(src)
        if imm:
            return f"Load immediate {imm} into {dst}"
        return f"Copy {src} → {dst}"

    if mn == "xor" and "," in ops:
        dst, src = [x.strip() for x in ops.split(",", 1)]
        if dst == src:
            return f"Zero out {dst} (XOR self = 0, avoids null bytes in shellcode)"
        return f"Bitwise XOR {dst} with {src}"

    if mn == "push":
        return f"Push {ops} onto stack; RSP -= 8"

    if mn == "pop":
        return f"Pop top of stack into {ops}; RSP += 8"

    if mn == "lea":
        return f"Load effective address of {ops.split(',',1)[-1].strip()} into {ops.split(',')[0].strip()}"

    if mn in ("jmp", "je", "jne", "jz", "jnz", "jl", "jg", "jle", "jge"):
        return f"Conditional branch to {ops}"

    if mn == "call":
        return f"Call subroutine at {ops}"

    if mn == "ret":
        return "Return from subroutine"

    if mn == "hlt":
        return "Halt CPU execution"

    if mn == "nop":
        return "No operation — padding or NOP sled"

    if mn == "cmp":
        return f"Compare {ops} and set RFLAGS"

    if mn == "test":
        return f"Bitwise AND {ops} to set RFLAGS (result discarded)"

    if mn in ("add", "sub", "inc", "dec"):
        return f"{mn.upper()} operation on {ops}"

    return f"{mn} {ops}"
