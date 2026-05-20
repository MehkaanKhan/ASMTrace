"""
Validates all 4 mock data fixtures against the SampleProgram JSON schema.
Run after authoring src/data/samples/*.json to catch type mismatches early.

Usage:
    python tools/validate_mock_data.py
    python tools/validate_mock_data.py --file src/data/samples/hello_world.json
"""
import json
import sys
import os
import argparse
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("ERROR: jsonschema not installed. Run: pip install jsonschema")
    sys.exit(1)

ROOT = Path(__file__).parent.parent
SAMPLES_DIR = ROOT / "frontend" / "src" / "data" / "samples"

REGISTER_STATE = {
    "type": "object",
    "required": ["rax", "rbx", "rcx", "rdx", "rsi", "rdi", "rsp", "rbp", "rip", "rflags"],
    "properties": {k: {"type": "string"} for k in ["rax","rbx","rcx","rdx","rsi","rdi","rsp","rbp","rip","rflags"]},
    "additionalProperties": False,
}

INSTRUCTION_CATEGORY = {"enum": ["data_move","arithmetic","control_flow","syscall","memory","crypto"]}
BEHAVIOR_CATEGORY = {"enum": ["filesystem","network","memory","privilege","process","crypto"]}

INSTRUCTION_STEP = {
    "type": "object",
    "required": ["index","address","bytes","mnemonic","operands","category","isSyscall","registers"],
    "properties": {
        "index": {"type": "integer", "minimum": 0},
        "address": {"type": "string", "pattern": "^0x[0-9a-fA-F]+$"},
        "bytes": {"type": "string"},
        "mnemonic": {"type": "string", "minLength": 1},
        "operands": {"type": "string"},
        "category": INSTRUCTION_CATEGORY,
        "isSyscall": {"type": "boolean"},
        "syscallName": {"type": "string"},
        "registers": REGISTER_STATE,
        "memoryAccess": {
            "type": "object",
            "required": ["address","size","type"],
            "properties": {
                "address": {"type": "string"},
                "size": {"type": "integer"},
                "type": {"enum": ["read","write"]},
                "value": {"type": "string"},
            },
        },
        "annotation": {"type": "string", "minLength": 1},
    },
}

SYSCALL_EVENT = {
    "type": "object",
    "required": ["index","name","number","args","returnValue","category"],
    "properties": {
        "index": {"type": "integer", "minimum": 0},
        "name": {"type": "string", "minLength": 1},
        "number": {"type": "integer", "minimum": 0},
        "args": {"type": "array", "items": {"type": "string"}},
        "returnValue": {"type": "string"},
        "category": BEHAVIOR_CATEGORY,
    },
}

TRACE_DATA = {
    "type": "object",
    "required": ["programName","architecture","totalInstructions","steps","syscalls"],
    "properties": {
        "programName": {"type": "string", "minLength": 1},
        "architecture": {"enum": ["x86_64"]},
        "totalInstructions": {"type": "integer", "minimum": 1},
        "steps": {"type": "array", "items": INSTRUCTION_STEP, "minItems": 1},
        "syscalls": {"type": "array", "items": SYSCALL_EVENT},
    },
}

BEHAVIOR_ENTRY = {
    "type": "object",
    "required": ["category","name","description","risk_score","mitre_id","mitre_name","syscalls"],
    "properties": {
        "category": BEHAVIOR_CATEGORY,
        "name": {"type": "string", "minLength": 1},
        "description": {"type": "string", "minLength": 1},
        "risk_score": {"type": "integer", "minimum": 0, "maximum": 100},
        "mitre_id": {"type": "string"},
        "mitre_name": {"type": "string"},
        "syscalls": {"type": "array", "items": {"type": "string"}},
    },
}

CONCEPT = {
    "type": "object",
    "required": ["term","definition","course_topic"],
    "properties": {
        "term": {"type": "string", "minLength": 1},
        "definition": {"type": "string", "minLength": 1},
        "course_topic": {"type": "string", "minLength": 1},
    },
}

AI_REPORT = {
    "type": "object",
    "required": ["verdict","confidence","narrative","behaviors","concepts"],
    "properties": {
        "verdict": {"enum": ["SAFE","SUSPICIOUS","DANGEROUS"]},
        "confidence": {"type": "integer", "minimum": 0, "maximum": 100},
        "narrative": {"type": "string", "minLength": 1},
        "behaviors": {"type": "array", "items": BEHAVIOR_ENTRY, "minItems": 1},
        "concepts": {"type": "array", "items": CONCEPT, "minItems": 1},
    },
}

SAMPLE_PROGRAM = {
    "type": "object",
    "required": ["id","displayName","description","architecture","riskLevel","tags","trace","report"],
    "properties": {
        "id": {"type": "string", "enum": ["hello_world","keylogger","shellcode","rootkit"]},
        "displayName": {"type": "string", "minLength": 1},
        "description": {"type": "string", "minLength": 1},
        "architecture": {"enum": ["x86_64"]},
        "riskLevel": {"enum": ["SAFE","SUSPICIOUS","DANGEROUS"]},
        "tags": {"type": "array", "items": {"type": "string"}, "minItems": 1},
        "trace": TRACE_DATA,
        "report": AI_REPORT,
    },
}

EXPECTED_VERDICTS = {
    "hello_world": "SAFE",
    "keylogger": "SUSPICIOUS",
    "shellcode": "DANGEROUS",
    "rootkit": "DANGEROUS",
}

EXPECTED_MIN_STEPS = {
    "hello_world": 5,
    "keylogger": 40,
    "shellcode": 20,
    "rootkit": 50,
}


def validate_file(path: Path) -> list[str]:
    errors = []
    sample_id = path.stem

    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return [f"Invalid JSON: {e}"]

    try:
        jsonschema.validate(data, SAMPLE_PROGRAM)
    except jsonschema.ValidationError as e:
        errors.append(f"Schema error at {'.'.join(str(p) for p in e.absolute_path)}: {e.message}")
        return errors  # Schema errors are foundational — stop here

    # Additional semantic checks
    if sample_id in EXPECTED_VERDICTS:
        if data["report"]["verdict"] != EXPECTED_VERDICTS[sample_id]:
            errors.append(f"Expected verdict {EXPECTED_VERDICTS[sample_id]}, got {data['report']['verdict']}")

    if sample_id in EXPECTED_MIN_STEPS:
        actual = len(data["trace"]["steps"])
        minimum = EXPECTED_MIN_STEPS[sample_id]
        if actual < minimum:
            errors.append(f"Expected at least {minimum} instruction steps, got {actual}")

    # Every step must have annotation
    for i, step in enumerate(data["trace"]["steps"]):
        if not step.get("annotation"):
            errors.append(f"steps[{i}] missing annotation (address {step.get('address', '?')})")

    # Syscall indices must reference valid step indices
    max_idx = len(data["trace"]["steps"]) - 1
    for sc in data["trace"]["syscalls"]:
        if sc["index"] > max_idx:
            errors.append(f"syscall '{sc['name']}' references step {sc['index']} but trace only has {max_idx + 1} steps")

    # totalInstructions must match actual step count
    if data["trace"]["totalInstructions"] != len(data["trace"]["steps"]):
        errors.append(
            f"totalInstructions={data['trace']['totalInstructions']} but steps has {len(data['trace']['steps'])} entries"
        )

    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate ASMTrace mock data fixtures")
    parser.add_argument("--file", help="Validate a single file instead of all samples")
    args = parser.parse_args()

    if args.file:
        files = [Path(args.file)]
    else:
        if not SAMPLES_DIR.exists():
            print(f"ERROR: samples directory not found: {SAMPLES_DIR}")
            print("Run tools/scaffold_frontend.py first.")
            sys.exit(1)
        files = sorted(SAMPLES_DIR.glob("*.json"))
        if not files:
            print(f"No JSON files found in {SAMPLES_DIR}")
            sys.exit(1)

    all_passed = True
    for path in files:
        errors = validate_file(path)
        if errors:
            all_passed = False
            print(f"FAIL  {path.name}")
            for err in errors:
                print(f"      - {err}")
        else:
            print(f"PASS  {path.name}")

    print()
    if all_passed:
        print("All fixtures valid.")
        sys.exit(0)
    else:
        print("Fix errors above before proceeding.")
        sys.exit(1)


if __name__ == "__main__":
    main()
