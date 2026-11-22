import os
from google import genai

env_file = os.path.join(os.path.dirname(__file__), "backend", ".env")
api_key = None
if os.path.exists(env_file):
    with open(env_file, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.strip().split("=", 1)[1].strip()

client = genai.Client(api_key=api_key)

print("Listing available models for your API key:")
try:
    models = client.models.list()
    for m in models:
        print(f"  {m.name}")
except Exception as e:
    print(f"List models failed: {e}")
