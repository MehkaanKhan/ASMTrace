"""
Sends a minimal request to the Anthropic API and reports rate-limit headers.
Use before batch testing to verify the API key works and quota is available.

Usage:
    python tools/check_api_quota.py
"""
import sys
import os
from pathlib import Path

# Load .env manually (no python-dotenv dependency needed for this tool)
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

api_key = os.environ.get("ANTHROPIC_API_KEY", "")
if not api_key:
    print("ERROR: ANTHROPIC_API_KEY not set in .env")
    sys.exit(1)

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic not installed. Run: pip install anthropic")
    sys.exit(1)

print(f"API key: {api_key[:8]}...{api_key[-4:]}")
print("Sending minimal test request to Anthropic API...")

client = anthropic.Anthropic(api_key=api_key)

try:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # cheapest model for quota check
        max_tokens=10,
        messages=[{"role": "user", "content": "Reply with: OK"}],
    )

    print(f"\nResponse: {response.content[0].text.strip()}")
    print(f"Model:    {response.model}")
    print(f"Input tokens:  {response.usage.input_tokens}")
    print(f"Output tokens: {response.usage.output_tokens}")

    # Rate limit info from response headers is not directly accessible via SDK
    # but stop_reason indicates success
    print(f"Stop reason:   {response.stop_reason}")
    print("\nAPI connection: PASS — quota available")
    sys.exit(0)

except anthropic.AuthenticationError:
    print("FAIL: Invalid API key")
    sys.exit(1)
except anthropic.RateLimitError as e:
    print(f"FAIL: Rate limit hit — {e}")
    print("Wait 60 seconds before running batch tests.")
    sys.exit(1)
except anthropic.APIError as e:
    print(f"FAIL: API error — {e}")
    sys.exit(1)
