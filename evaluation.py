import os
import sys
import time
import json
import csv
from pathlib import Path
from typing import List, Dict, Any, Tuple

# Set legacy Keras compatibility
os.environ['TF_USE_LEGACY_KERAS'] = '1'

import cv2
import numpy as np
import editdistance

# Add SimpleHTR src to path
SRC_DIR = Path(r"D:\Downloads\SimpleHTR-master\SimpleHTR-master\src")
sys.path.insert(0, str(SRC_DIR))

from model import Model, DecoderType
from preprocessor import Preprocessor
from dataloader_iam import Batch


def calculate_wer(reference: str, hypothesis: str) -> float:
    """Computes Word Error Rate using Levenshtein distance on token list."""
    ref_words = reference.strip().split()
    hyp_words = hypothesis.strip().split()
    if not ref_words:
        return 0.0 if not hyp_words else 1.0
    dist = editdistance.eval(ref_words, hyp_words)
    return dist / len(ref_words)


def calculate_cer(reference: str, hypothesis: str) -> float:
    """Computes Character Error Rate using Levenshtein distance on character string."""
    ref_chars = reference.strip()
    hyp_chars = hypothesis.strip()
    if not ref_chars:
        return 0.0 if not hyp_chars else 1.0
    dist = editdistance.eval(ref_chars, hyp_chars)
    return dist / len(ref_chars)


def run_evaluation():
    dataset_dir = Path(r"D:\Downloads\SimpleHTR-master\test_dataset")
    gt_file = dataset_dir / "ground_truth.json"
    
    with open(gt_file, "r", encoding="utf-8") as f:
        samples: List[Dict[str, Any]] = json.load(f)

    # Load character vocabulary
    char_list_file = Path(r"D:\Downloads\SimpleHTR-master\SimpleHTR-master\model\charList.txt")
    with open(char_list_file, "r", encoding="utf-8") as f:
        char_list = list(f.read())

    print(f"Loaded {len(char_list)} characters from vocabulary.")
    print("Initializing SimpleHTR Model from snapshot-13...")
    
    # Change working dir to src so relative paths within Model match
    orig_cwd = os.getcwd()
    os.chdir(str(SRC_DIR))
    
    try:
        model = Model(char_list, DecoderType.BestPath, must_restore=True)
    finally:
        os.chdir(orig_cwd)

    print("Model loaded successfully into memory. Beginning evaluation...\n")

    results = []
    total_inference_time = 0.0
    total_chars_ref = 0
    total_char_edits = 0
    total_words_ref = 0
    total_word_edits = 0
    exact_matches = 0
    failed_predictions = 0

    preprocessor = Preprocessor((128, 32), dynamic_width=True, padding=16)

    for idx, s in enumerate(samples, 1):
        img_path = dataset_dir / s["file"]
        ref_text = s["ground_truth"]
        category = s["category"]

        img = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
        if img is None:
            print(f"Error loading {img_path}")
            failed_predictions += 1
            continue

        orig_h, orig_w = img.shape[:2]

        # Warm / timed inference
        t0 = time.perf_counter()
        processed_img = preprocessor.process_img(img)
        batch = Batch([processed_img], None, 1)
        recognized_list, prob_list = model.infer_batch(batch, calc_probability=True)
        t1 = time.perf_counter()
        
        latency_ms = (t1 - t0) * 1000.0
        total_inference_time += latency_ms

        pred_text = recognized_list[0] if recognized_list else ""
        confidence = float(prob_list[0]) if prob_list else 0.0

        if not pred_text.strip():
            failed_predictions += 1

        cer = calculate_cer(ref_text, pred_text)
        wer = calculate_wer(ref_text, pred_text)
        is_exact = (ref_text.strip() == pred_text.strip())
        if is_exact:
            exact_matches += 1

        # Global aggregate sums
        ref_words = ref_text.strip().split()
        hyp_words = pred_text.strip().split()
        total_words_ref += len(ref_words)
        total_word_edits += editdistance.eval(ref_words, hyp_words)

        total_chars_ref += len(ref_text.strip())
        total_char_edits += editdistance.eval(ref_text.strip(), pred_text.strip())

        item_result = {
            "sample_id": s["id"],
            "filename": s["file"],
            "category": category,
            "dimensions": f"{orig_w}x{orig_h}",
            "reference": ref_text,
            "hypothesis": pred_text,
            "confidence": round(confidence, 4),
            "cer": round(cer, 4),
            "wer": round(wer, 4),
            "exact_match": is_exact,
            "latency_ms": round(latency_ms, 2)
        }
        results.append(item_result)

        print(f"[{idx}/{len(samples)}] {s['file']} ({category})")
        print(f"  Ref:  '{ref_text}'")
        print(f"  Pred: '{pred_text}'")
        print(f"  Conf: {confidence:.2%} | CER: {cer:.2%} | WER: {wer:.2%} | Time: {latency_ms:.1f}ms\n")

    # Global Metrics Calculation
    avg_cer = (total_char_edits / total_chars_ref) if total_chars_ref > 0 else 0.0
    avg_wer = (total_word_edits / total_words_ref) if total_words_ref > 0 else 0.0
    exact_acc = (exact_matches / len(samples)) * 100.0 if samples else 0.0
    avg_latency = (total_inference_time / len(samples)) if samples else 0.0

    print("=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Total Test Samples Evaluated: {len(samples)}")
    print(f"Failed / Empty Predictions:   {failed_predictions}")
    print(f"Exact-Match Accuracy:         {exact_acc:.2f}% ({exact_matches}/{len(samples)})")
    print(f"Macro Character Error Rate:   {avg_cer:.2%}")
    print(f"Macro Word Error Rate:        {avg_wer:.2%}")
    print(f"Average Inference Latency:    {avg_latency:.2f} ms")
    print("=" * 60)

    # Save detailed CSV files
    out_dir = Path(r"D:\Downloads\SimpleHTR-master")
    baseline_csv = out_dir / "baseline_results.csv"
    with open(baseline_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Samples", len(samples)])
        writer.writerow(["Exact Matches", exact_matches])
        writer.writerow(["Exact Match Accuracy (%)", round(exact_acc, 2)])
        writer.writerow(["Global CER (%)", round(avg_cer * 100, 2)])
        writer.writerow(["Global WER (%)", round(avg_wer * 100, 2)])
        writer.writerow(["Average Latency (ms)", round(avg_latency, 2)])
        writer.writerow(["Failed / Empty Predictions", failed_predictions])

    sample_csv = out_dir / "sample_predictions.csv"
    with open(sample_csv, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["sample_id", "filename", "category", "dimensions", "confidence", "cer", "wer", "exact_match", "latency_ms", "reference", "hypothesis"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    print(f"\nDeliverables written:")
    print(f" - {baseline_csv}")
    print(f" - {sample_csv}")


if __name__ == "__main__":
    run_evaluation()
