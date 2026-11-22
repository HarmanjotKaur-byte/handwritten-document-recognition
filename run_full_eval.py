"""
Runs a comprehensive evaluation of Gemini Flash Vision on the handwriting test suite.
"""

import os
import json
import time
import editdistance
from pathlib import Path
from google import genai
from PIL import Image
import pandas as pd

# Load API key
env_file = Path("backend/.env")
api_key = None
if env_file.exists():
    with open(env_file, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.strip().split("=", 1)[1].strip()

client = genai.Client(api_key=api_key)
MODEL_NAME = "gemini-3.5-flash-lite"

GROUND_TRUTH_PATH = Path("test_dataset/ground_truth.json")
EVAL_RESULTS_CSV = Path("evaluation_results.csv")
SAMPLE_PREDS_CSV = Path("sample_predictions.csv")


def calculate_cer(reference: str, hypothesis: str) -> float:
    if not reference:
        return 0.0 if not hypothesis else 1.0
    return editdistance.eval(reference.lower(), hypothesis.lower()) / len(reference)


def calculate_wer(reference: str, hypothesis: str) -> float:
    ref_words = reference.lower().split()
    hyp_words = hypothesis.lower().split()
    if not ref_words:
        return 0.0 if not hyp_words else 1.0
    return editdistance.eval(ref_words, hyp_words) / len(ref_words)


def main():
    print("=" * 65)
    print(f"Gemini Flash Vision ({MODEL_NAME}) Handwriting Evaluation Suite")
    print("=" * 65)

    with open(GROUND_TRUTH_PATH, "r", encoding="utf-8") as f:
        samples = json.load(f)

    # Add user test cases
    user_samples = [
        {"id": "user_rabbit", "file": "crop_rabbit.png", "ground_truth": "rabbit", "category": "user_green_highlighter"},
        {"id": "user_red", "file": "crop_red.png", "ground_truth": "red", "category": "user_red_ink"},
        {"id": "user_multi", "file": "exact_multi.png", "ground_truth": "father method all does color", "category": "user_table_strip"}
    ]
    for us in user_samples:
        if Path(us["file"]).exists():
            samples.append(us)

    results = []
    latencies = []
    failures = 0

    print(f"Total evaluation samples: {len(samples)}\n")

    prompt = (
        "Transcribe all handwritten text in this image accurately and completely. "
        "Do not omit any characters or words. Return ONLY the transcribed text, nothing else."
    )

    for item in samples:
        f_path = Path("test_dataset") / item["file"]
        if not f_path.exists():
            f_path = Path(item["file"])

        if not f_path.exists():
            continue

        gt = item["ground_truth"]
        t0 = time.perf_counter()
        try:
            pil_img = Image.open(f_path)
            res = client.models.generate_content(model=MODEL_NAME, contents=[prompt, pil_img])
            pred = res.text.strip().replace("\n", " ")
            lat = (time.perf_counter() - t0) * 1000.0
            latencies.append(lat)

            cer = calculate_cer(gt, pred)
            wer = calculate_wer(gt, pred)
            exact = 1.0 if gt.strip().lower() == pred.strip().lower() else 0.0

            results.append({
                "id": item["id"],
                "file": item["file"],
                "category": item.get("category", "handwriting"),
                "ground_truth": gt,
                "prediction": pred,
                "latency_ms": round(lat, 2),
                "cer": round(cer, 4),
                "wer": round(wer, 4),
                "exact_match": exact,
                "status": "SUCCESS"
            })
            print(f"[{item['id']:<20}] Pred: '{pred}' | CER: {cer:.1%}, WER: {wer:.1%}, Exact: {int(exact)}, Latency: {lat:.0f}ms")
            # Brief rate limit safety pause
            time.sleep(0.5)
        except Exception as e:
            failures += 1
            results.append({
                "id": item["id"],
                "file": item["file"],
                "category": item.get("category", "handwriting"),
                "ground_truth": gt,
                "prediction": "",
                "latency_ms": 0.0,
                "cer": 1.0,
                "wer": 1.0,
                "exact_match": 0.0,
                "status": f"FAILED: {e}"
            })
            print(f"[{item['id']:<20}] FAILED: {e}")

    df = pd.DataFrame(results)
    df.to_csv(SAMPLE_PREDS_CSV, index=False)

    valid_df = df[df["status"] == "SUCCESS"]
    avg_cer = valid_df["cer"].mean() if not valid_df.empty else 1.0
    avg_wer = valid_df["wer"].mean() if not valid_df.empty else 1.0
    exact_acc = valid_df["exact_match"].mean() if not valid_df.empty else 0.0
    avg_latency = float(sum(latencies) / len(latencies)) if latencies else 0.0

    eval_summary = pd.DataFrame([{
        "engine": f"Google Gemini Flash Vision ({MODEL_NAME})",
        "total_samples": len(samples),
        "successful_requests": len(valid_df),
        "failed_requests": failures,
        "mean_cer": round(avg_cer, 4),
        "mean_wer": round(avg_wer, 4),
        "exact_match_accuracy": round(exact_acc, 4),
        "average_latency_ms": round(avg_latency, 2)
    }])
    eval_summary.to_csv(EVAL_RESULTS_CSV, index=False)

    print("\n" + "=" * 65)
    print("FINAL EVALUATION METRICS")
    print("=" * 65)
    print(f"Engine:                  Google Gemini Flash Vision ({MODEL_NAME})")
    print(f"Evaluated Samples:       {len(samples)}")
    print(f"Successful Requests:     {len(valid_df)}")
    print(f"Failed Requests:         {failures}")
    print(f"Mean CER:                {avg_cer:.2%}")
    print(f"Mean WER:                {avg_wer:.2%}")
    print(f"Exact Match Accuracy:    {exact_acc:.2%}")
    print(f"Average API Latency:     {avg_latency:.1f} ms")
    print(f"Saved: {EVAL_RESULTS_CSV} and {SAMPLE_PREDS_CSV}")


if __name__ == "__main__":
    main()
