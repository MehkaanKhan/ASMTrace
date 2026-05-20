from __future__ import annotations
from dataclasses import dataclass
import capstone

MAX_INSTRUCTIONS = 200


@dataclass
class RawInsn:
    address: int
    bytes: bytes
    mnemonic: str
    op_str: str


def disassemble(code: bytes, base_addr: int = 0x400000) -> list[RawInsn]:
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
    md.detail = False

    results: list[RawInsn] = []
    for insn in md.disasm(code, base_addr):
        results.append(RawInsn(
            address=insn.address,
            bytes=insn.bytes,
            mnemonic=insn.mnemonic,
            op_str=insn.op_str,
        ))
        if len(results) >= MAX_INSTRUCTIONS:
            break

    return results
