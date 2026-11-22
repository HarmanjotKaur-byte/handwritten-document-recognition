import os
from google import genai
from PIL import Image

# Read key from backend/.env
env_file = os.path.join(os.path.dirname(__file__), "backend", ".env")
api_key = None
if os.path.exists(env_file):
    with open(env_file, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.strip().split("=", 1)[1].strip()

print("Using API key:", api_key[:8] + "..." if api_key else "None")

client = genai.Client(api_key=api_key)

test_images = ["crop_rabbit.png", "crop_red.png", "exact_multi.png"]

for img_path in test_images:
    if os.path.exists(img_path):
        img = Image.open(img_path)
        prompt = "Transcribe the handwritten text exactly as written. Return ONLY the transcribed text, nothing else."
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=[prompt, img]
        )
        print(f"\n[{img_path}] Result: '{response.text.strip()}'")
