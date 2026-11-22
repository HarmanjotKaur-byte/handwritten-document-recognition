"""
Evaluates Google Cloud Vision API DOCUMENT_TEXT_DETECTION across the test suite:
- Calculates Character Error Rate (CER)
- Calculates Word Error Rate (WER)
- Calculates Exact Match Accuracy
- Measures latency & failure counts
- Outputs evaluation_results.csv and sample_predictions.csv
"""

import os
import sys
import json
import time
import editdistance
from pathlib import Path
import pandas as pd

from google_vision_test import GoogleVisionExperiment

GROUND_TRUTH_PATH = Path("test_dataset/ground_truth.json")
EVAL_RESULTS_CSV = Path("evaluation_results.csv")
SAMPLE_PREDS_CSV = Path("sample_predictions.csv")


def calculate_cer(reference: str, hypothesis: str) -> float:
    if not reference:
        return 0.0 if not hypothesis else 1.0
    return editdistance.eval(reference, hypothesis) / len(reference)


def calculate_wer(reference: str, hypothesis: str) -> float:
    ref_words = reference.split()
    hyp_words = hypothesis.split()
    if not ref_words:
        return 0.0 if not hyp_words else 1.0
    return editdistance.eval(ref_words, hyp_words) / len(ref_words)


def run_evaluation_suite():
    print("=" * 65)
    print("Google Cloud Vision API Evaluation Suite")
    print("=" * 65)

    exp = GoogleVisionExperiment()

    with open(GROUND_TRUTH_PATH, "r", encoding="utf-8") as f:
        samples = json.load(f)

    # Add extra test cases if present
    additional_cases = [
        {"id": "user_rabbit", "file": "crop_rabbit.png", "ground_truth": "rabbit", "category": "user_green_highlighter"},
        {"id": "user_red", "file": "crop_red.png", "ground_truth": "red", "category": "user_colored_pen"},
        {"id": "user_multi", "file": "exact_multi.png", "ground_truth": "father method all does color", "category": "user_table_cells"}
    ]
    for c in additional_cases:
        if Path(c["file"]).exists():
            samples.append(c)

    results = []
    latencies = []
    failures = 0

    print(f"Running evaluation on {len(samples)} handwriting test cases...\n")

    for item in samples:
        file_path = Path("test_dataset") / item["file"]
        if not file_path.exists():
            file_path = Path(item["file"])

        if not file_path.exists():
            print(f"Skipping missing file: {item['file']}")
            continue

        gt = item["ground_truth"]
        try:
            res = exp.recognize_image(str(file_path))
            pred = res["full_text"]
            lat = res["latency_ms"]
            conf = res["confidence"]
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
                "confidence": conf,
                "latency_ms": lat,
                "cer": round(cer, 4),
                "wer": round(wer, 4),
                "exact_match": exact,
                "status": "SUCCESS"
            })
            print(f"[{item['id']}] CER: {cer:.2%}, WER: {wer:.2%}, Exact: {int(exact)}, Latency: {lat:.1f}ms")
        except Exception as e:
            failures += 1
            results.append({
                "id": item["id"],
                "file": item["file"],
                "category": item.get("category", "handwriting"),
                "ground_truth": gt,
                "prediction": "",
                "confidence": 0.0,
                "latency_ms": 0.0,
                "cer": 1.0,
                "wer": 1.0,
                "exact_match": 0.0,
                "status": f"FAILED: {str(e)}"
            })
            print(f"[{item['id']}] FAILED: {e}")

    df = pd.DataFrame(results)
    df.to_csv(SAMPLE_PREDS_CSV, index=False)

    valid_df = df[df["status"] == "SUCCESS"]
    avg_cer = valid_df["cer"].mean() if not valid_df.empty else 1.0
    avg_wer = valid_df["wer"].mean() if not valid_df.empty else 1.0
    exact_acc = valid_df["exact_match"].mean() if not valid_df.empty else 0.0
    avg_latency = float(sum(latencies) / len(latencies)) if latencies else 0.0

    eval_summary = pd.DataFrame([{
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
    print("EVALUATION SUMMARY")
    print("=" * 65)
    print(f"Total Samples Evaluated: {len(samples)}")
    print(f"Successful Requests:     {len(valid_df)}")
    print(f"Failed Requests:         {failures}")
    print(f"Mean CER:                {avg_cer:.2%}")
    print(f"Mean WER:                {avg_wer:.2%}")
    print(f"Exact Match Accuracy:    {exact_acc:.2%}")
    print(f"Average API Latency:     {avg_latency:.1f} ms")
    print(f"Saved: {EVAL_RESULTS_CSV} and {SAMPLE_PREDS_CSV}")


if __name__ == "__main__":
    run_evaluation_suite()
