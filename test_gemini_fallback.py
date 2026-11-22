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

# Try models with fallback: gemini-2.0-flash, gemini-2.0-flash-lite, gemini-1.5-flash
models_to_try = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"]
test_images = ["crop_rabbit.png", "crop_red.png", "exact_multi.png"]

working_model = None

for m in models_to_try:
    try:
        print(f"Testing model: {m}...")
        img = Image.open("crop_rabbit.png")
        prompt = "Transcribe the handwritten text exactly as written. Return ONLY the transcribed text."
        res = client.models.generate_content(model=m, contents=[prompt, img])
        print(f"-> SUCCESS with {m}! Result: '{res.text.strip()}'")
        working_model = m
        break
    except Exception as e:
        print(f"-> {m} failed: {e}")

if working_model:
    print(f"\nEvaluating remaining images using {working_model}:")
    for img_path in ["crop_red.png", "exact_multi.png"]:
        if os.path.exists(img_path):
            img = Image.open(img_path)
            res = client.models.generate_content(
                model=working_model,
                contents=["Transcribe the handwritten text exactly as written. Return ONLY the transcribed text.", img]
            )
            print(f"[{img_path}] -> '{res.text.strip()}'")
