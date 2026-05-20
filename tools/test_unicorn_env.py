"""
Smoke-tests the Unicorn Engine + Capstone installation inside Docker.
Emulates a minimal x86-64 program: MOV RAX, 1 followed by a HLT instruction.
Prints CPU state after emulation.

Run inside the Docker container:
    docker compose run --rm api python tools/test_unicorn_env.py

WARNING: Running this on Windows (outside Docker) may trigger DEP/executable
memory protection. A warning is printed and the test is aborted.
"""
import sys

if sys.platform == "win32":
    print("WARNING: This script must be run inside the Docker container (Linux).")
    print("Unicorn Engine's UC_PROT_EXEC memory mapping conflicts with Windows DEP.")
    print("Run: docker compose run --rm api python tools/test_unicorn_env.py")
    sys.exit(1)

# Test Unicorn import
try:
    import unicorn
    import unicorn.x86_const
    print(f"Unicorn version: {'.'.join(str(v) for v in unicorn.unicorn_version())}")
except ImportError as e:
    print(f"FAIL: unicorn import error: {e}")
    print("Rebuild the Docker image: docker compose build api")
    sys.exit(1)

# Test Capstone import
try:
    import capstone
    print(f"Capstone version: {'.'.join(str(v) for v in capstone.cs_version())}")
except ImportError as e:
    print(f"FAIL: capstone import error: {e}")
    sys.exit(1)

# Minimal x86-64 program:
#   mov rax, 1    ; 48 C7 C0 01 00 00 00
#   hlt           ; F4
X86_CODE = bytes([
    0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00,  # mov rax, 1
    0xF4,                                        # hlt
])

CODE_ADDR = 0x1000
CODE_SIZE = 0x1000

print("\nRunning Unicorn emulation: MOV RAX, 1; HLT")

try:
    uc = unicorn.Uc(unicorn.UC_ARCH_X86, unicorn.UC_MODE_64)
    uc.mem_map(CODE_ADDR, CODE_SIZE)
    uc.mem_write(CODE_ADDR, X86_CODE)

    executed: list[int] = []

    def hook_code(uc, address, size, user_data):
        executed.append(address)

    uc.hook_add(unicorn.UC_HOOK_CODE, hook_code)

    try:
        uc.emu_start(CODE_ADDR, CODE_ADDR + len(X86_CODE), timeout=5_000_000, count=100)
    except unicorn.UcError as e:
        if e.errno != unicorn.UC_ERR_EXCEPTION:  # HLT causes UC_ERR_EXCEPTION — expected
            raise

    rax = uc.reg_read(unicorn.x86_const.UC_X86_REG_RAX)
    rip = uc.reg_read(unicorn.x86_const.UC_X86_REG_RIP)

    print(f"  Instructions executed: {len(executed)}")
    print(f"  RAX = {hex(rax)}")
    print(f"  RIP = {hex(rip)}")

    assert rax == 1, f"Expected RAX=1, got {hex(rax)}"
    assert len(executed) >= 1, "No instructions executed"
    print("\nUnicorn emulation: PASS")

except unicorn.UcError as e:
    print(f"FAIL: Unicorn emulation error: {e}")
    sys.exit(1)

# Capstone disassembly of the same code
print("\nRunning Capstone disassembly:")
try:
    md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
    for insn in md.disasm(X86_CODE, CODE_ADDR):
        print(f"  {hex(insn.address)}: {insn.mnemonic} {insn.op_str}")
    print("Capstone disassembly: PASS")
except capstone.CsError as e:
    print(f"FAIL: Capstone error: {e}")
    sys.exit(1)

print("\nAll environment checks passed. Ready for Phase 2 development.")
