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

models_to_test = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"]
test_images = ["crop_rabbit.png", "crop_red.png", "exact_multi.png"]

selected_model = None
for m in models_to_test:
    try:
        print(f"Testing model: {m}...")
        img = Image.open("crop_rabbit.png")
        prompt = "Transcribe the handwritten text in this image exactly as written. Return ONLY the transcribed text, nothing else."
        res = client.models.generate_content(model=m, contents=[prompt, img])
        print(f"SUCCESS with {m}! Result: '{res.text.strip()}'")
        selected_model = m
        break
    except Exception as e:
        print(f"  {m} error: {e}")

if selected_model:
    print(f"\nEvaluating remaining test images with {selected_model}:")
    for img_name in ["crop_red.png", "exact_multi.png"]:
        img = Image.open(img_name)
        prompt = "Transcribe the handwritten text in this image exactly as written. Return ONLY the transcribed text, nothing else."
        res = client.models.generate_content(model=selected_model, contents=[prompt, img])
        print(f"[{img_name}] -> '{res.text.strip()}'")
