from __future__ import annotations
from pathlib import Path

from app.services.disassembler import disassemble
from app.services.emulator import propagate, SYSCALL_TABLE
from app.schemas.trace import (
    TraceData, InstructionStep, RegisterState,
    SyscallEvent, MemoryAccess,
)

# ELF magic + minimal PE detection
_ELF_MAGIC = b"\x7fELF"
_PE_MAGIC = b"MZ"


def _detect_code_offset(data: bytes) -> tuple[int, int]:
    """Return (offset, base_addr) into data where x86-64 code starts."""
    if data[:4] == _ELF_MAGIC and len(data) >= 64:
        # ELF64: e_entry at offset 24 (8 bytes), e_phoff at 32
        import struct
        e_entry = struct.unpack_from("<Q", data, 24)[0]
        e_phoff = struct.unpack_from("<Q", data, 32)[0]
        e_phnum = struct.unpack_from("<H", data, 56)[0]
        ph_entry_size = struct.unpack_from("<H", data, 54)[0]
        # find LOAD segment containing entry point
        for i in range(e_phnum):
            off = e_phoff + i * ph_entry_size
            p_type = struct.unpack_from("<I", data, off)[0]
            if p_type == 1:  # PT_LOAD
                p_offset = struct.unpack_from("<Q", data, off + 8)[0]
                p_vaddr = struct.unpack_from("<Q", data, off + 16)[0]
                p_filesz = struct.unpack_from("<Q", data, off + 32)[0]
                if p_vaddr <= e_entry < p_vaddr + p_filesz:
                    code_off = p_offset + (e_entry - p_vaddr)
                    return code_off, e_entry
        return 0, 0x400000
    # Fallback: treat the whole blob as raw shellcode
    return 0, 0x400000


def collect(binary: bytes, program_name: str) -> TraceData:
    offset, base_addr = _detect_code_offset(binary)
    code = binary[offset:]

    raw_insns = disassemble(code, base_addr)
    step_metas = propagate(raw_insns)

    steps: list[InstructionStep] = []
    syscalls: list[SyscallEvent] = []
    syscall_idx = 0

    for i, (raw, meta) in enumerate(zip(raw_insns, step_metas)):
        regs_dict = meta["registers"]
        reg_state = RegisterState(
            rax=regs_dict["rax"], rbx=regs_dict["rbx"],
            rcx=regs_dict["rcx"], rdx=regs_dict["rdx"],
            rsi=regs_dict["rsi"], rdi=regs_dict["rdi"],
            rsp=regs_dict["rsp"], rbp=regs_dict["rbp"],
            rip=regs_dict["rip"], rflags=regs_dict["rflags"],
        )

        mem_raw = meta["memoryAccess"]
        mem = None
        if mem_raw:
            _, size, access_type = mem_raw
            mem = MemoryAccess(
                address=regs_dict["rsp"] if "push" in raw.mnemonic.lower() else "0x?",
                size=size,
                type=access_type,
            )

        step = InstructionStep(
            index=i,
            address=hex(raw.address),
            bytes=" ".join(f"{b:02x}" for b in raw.bytes),
            mnemonic=raw.mnemonic,
            operands=raw.op_str,
            category=meta["category"],
            isSyscall=meta["isSyscall"],
            syscallName=meta["syscallName"],
            registers=reg_state,
            memoryAccess=mem,
            annotation=meta["annotation"],
        )
        steps.append(step)

        if meta["isSyscall"] and meta["syscallName"]:
            num = meta["syscallNumber"] or 0
            _, sc_cat = SYSCALL_TABLE.get(num, ("unknown", "process"))
            syscalls.append(SyscallEvent(
                index=syscall_idx,
                name=meta["syscallName"],
                number=num,
                args=[
                    regs_dict["rdi"], regs_dict["rsi"],
                    regs_dict["rdx"], regs_dict["rcx"],
                ],
                returnValue="0x?",
                category=sc_cat,
            ))
            syscall_idx += 1

    return TraceData(
        programName=program_name,
        architecture="x86_64",
        totalInstructions=len(steps),
        steps=steps,
        syscalls=syscalls,
    )
