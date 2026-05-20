"""
Validates a Claude API JSON response against the AIReport schema.
Run after prompt engineering to catch schema drift before wiring to the frontend.

Usage:
    python tools/validate_ai_response.py --file path/to/response.json
    cat response.json | python tools/validate_ai_response.py --stdin
"""
import json
import sys
import argparse
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("ERROR: jsonschema not installed. Run: pip install jsonschema")
    sys.exit(1)

BEHAVIOR_CATEGORY = {"enum": ["filesystem", "network", "memory", "privilege", "process", "crypto"]}

AI_REPORT_SCHEMA = {
    "type": "object",
    "required": ["verdict", "confidence", "narrative", "behaviors", "concepts"],
    "additionalProperties": False,
    "properties": {
        "verdict": {"enum": ["SAFE", "SUSPICIOUS", "DANGEROUS"]},
        "confidence": {"type": "integer", "minimum": 0, "maximum": 100},
        "narrative": {"type": "string", "minLength": 10},
        "behaviors": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["category", "name", "description", "risk_score", "mitre_id", "mitre_name", "syscalls"],
                "additionalProperties": False,
                "properties": {
                    "category": BEHAVIOR_CATEGORY,
                    "name": {"type": "string", "minLength": 1},
                    "description": {"type": "string", "minLength": 1},
                    "risk_score": {"type": "integer", "minimum": 0, "maximum": 100},
                    "mitre_id": {"type": "string"},
                    "mitre_name": {"type": "string"},
                    "syscalls": {"type": "array", "items": {"type": "string"}},
                },
            },
        },
        "concepts": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "required": ["term", "definition", "course_topic"],
                "additionalProperties": False,
                "properties": {
                    "term": {"type": "string", "minLength": 1},
                    "definition": {"type": "string", "minLength": 10},
                    "course_topic": {"type": "string", "minLength": 1},
                },
            },
        },
    },
}


def validate(raw: str) -> tuple[bool, list[str]]:
    errors = []

    # Strip prose before/after JSON (common Claude slip)
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        return False, ["No JSON object found in response"]
    raw_json = raw[start:end]

    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as e:
        return False, [f"JSON parse error: {e}"]

    validator = jsonschema.Draft7Validator(AI_REPORT_SCHEMA)
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path)):
        path = ".".join(str(p) for p in err.absolute_path) or "(root)"
        errors.append(f"{path}: {err.message}")

    # Semantic checks
    if "verdict" in data and "behaviors" in data:
        max_risk = max((b.get("risk_score", 0) for b in data["behaviors"]), default=0)
        verdict = data["verdict"]
        if verdict == "SAFE" and max_risk > 30:
            errors.append(f"Verdict SAFE but max risk_score is {max_risk} (expected ≤ 30)")
        if verdict == "DANGEROUS" and max_risk < 50:
            errors.append(f"Verdict DANGEROUS but max risk_score is {max_risk} (expected ≥ 50)")

    return len(errors) == 0, errors


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate Claude AIReport JSON response")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--file", help="Path to JSON response file")
    group.add_argument("--stdin", action="store_true", help="Read from stdin")
    args = parser.parse_args()

    if args.stdin:
        raw = sys.stdin.read()
        label = "stdin"
    else:
        path = Path(args.file)
        if not path.exists():
            print(f"ERROR: file not found: {path}")
            sys.exit(1)
        raw = path.read_text(encoding="utf-8")
        label = path.name

    passed, errors = validate(raw)

    if passed:
        print(f"PASS  {label} — valid AIReport schema")
        sys.exit(0)
    else:
        print(f"FAIL  {label}")
        for err in errors:
            print(f"      - {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
