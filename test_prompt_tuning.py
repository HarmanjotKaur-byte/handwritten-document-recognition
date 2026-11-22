import os
from google import genai
from PIL import Image

env_file = os.path.join(os.path.dirname(__file__), "backend", ".env")
api_key = None
if os.path.exists(env_file):
    with open(env_file, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.strip().split("=", 1)[1].strip()

client = genai.Client(api_key=api_key)

img = Image.open("exact_multi.png")
prompt = (
    "Transcribe all handwritten words in this image accurately from left to right. "
    "Be careful to transcribe every word completely. Return ONLY the transcribed text."
)

for m in ["gemini-3.5-flash-lite", "gemini-3.5-flash"]:
    try:
        res = client.models.generate_content(model=m, contents=[prompt, img])
        print(f"[{m}] result: '{res.text.strip()}'")
    except Exception as e:
        print(f"[{m}] error: {e}")
