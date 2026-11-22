"""
Google Cloud Vision API Handwriting Recognition Test Script
Implements DOCUMENT_TEXT_DETECTION with comprehensive structural hierarchy extraction:
- Full recognized text
- Pages, Blocks, Paragraphs
- Words, Symbols, Bounding Boxes, and Confidences
- Free-tier rate limiting and budget enforcement (900 calls/month)
"""

import os
import sys
import time
import json
from pathlib import Path
from typing import Dict, Any, List, Optional

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))
from app.services.vision_tracker import VisionBudgetTracker

from google.cloud import vision


class GoogleVisionExperiment:
    def __init__(self, credentials_path: Optional[str] = None):
        if credentials_path:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
            
        self.tracker = VisionBudgetTracker(limit=900)
        self.client = None
        self._init_client()

    def _init_client(self):
        cred_env = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if not cred_env:
            # Check standard backend path
            standard_path = Path("backend/gcp-credentials.json").resolve()
            if standard_path.exists():
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(standard_path)
                cred_env = str(standard_path)

        if not cred_env or not Path(cred_env).exists():
            raise FileNotFoundError(
                "Google Cloud service account credentials not found!\n"
                "Please configure GOOGLE_APPLICATION_CREDENTIALS environment variable or place "
                "gcp-credentials.json in the backend/ directory as described in GOOGLE_CLOUD_SETUP.md."
            )

        self.client = vision.ImageAnnotatorClient()

    def recognize_image(self, image_path: str) -> Dict[str, Any]:
        """
        Sends local image to Google Cloud Vision API using DOCUMENT_TEXT_DETECTION.
        Extracts full hierarchy and confidence metrics.
        """
        # 1. Budget enforcement guardrail
        if not self.tracker.can_consume():
            status = self.tracker.get_status()
            raise RuntimeError(
                f"Application Free Tier budget limit reached ({status['used_units']}/{status['monthly_limit']} units used this month). "
                f"Request rejected to prevent unexpected Google Cloud billing."
            )

        with open(image_path, "rb") as f:
            content = f.read()

        image = vision.Image(content=content)
        
        # Optimize request for dense / handwritten document text
        image_context = vision.ImageContext(language_hints=["en", "en-t-i0-handwrit"])

        t0 = time.perf_counter()
        response = self.client.document_text_detection(image=image, image_context=image_context)
        latency_ms = (time.perf_counter() - t0) * 1000.0

        if response.error.message:
            raise RuntimeError(f"Google Cloud Vision API Error: {response.error.message}")

        # Record genuine API consumption
        self.tracker.record_usage(1)

        # 2. Extract Document Hierarchy
        annotation = response.full_text_annotation
        full_text = annotation.text if annotation else ""

        pages_data = []
        words_data = []
        confidences = []

        if annotation and annotation.pages:
            for p_idx, page in enumerate(annotation.pages):
                page_info = {
                    "page_index": p_idx,
                    "width": page.width,
                    "height": page.height,
                    "blocks": []
                }
                for b_idx, block in enumerate(page.blocks):
                    block_info = {
                        "block_index": b_idx,
                        "block_type": str(block.block_type),
                        "confidence": block.confidence,
                        "paragraphs": []
                    }
                    if block.confidence:
                        confidences.append(block.confidence)

                    for par_idx, par in enumerate(block.paragraphs):
                        par_info = {
                            "paragraph_index": par_idx,
                            "confidence": par.confidence,
                            "words": []
                        }
                        if par.confidence:
                            confidences.append(par.confidence)

                        for w_idx, word in enumerate(par.words):
                            word_text = "".join([s.text for s in word.symbols])
                            word_conf = word.confidence
                            if word_conf:
                                confidences.append(word_conf)

                            # Extract bounding polygon vertices
                            vertices = [{"x": v.x, "y": v.y} for v in word.bounding_box.vertices]

                            word_dict = {
                                "text": word_text,
                                "confidence": round(word_conf, 4) if word_conf else 0.0,
                                "bounding_box": vertices
                            }
                            par_info["words"].append(word_dict)
                            words_data.append(word_dict)

                        block_info["paragraphs"].append(par_info)
                    page_info["blocks"].append(block_info)
                pages_data.append(page_info)

        avg_conf = float(sum(confidences) / len(confidences)) if confidences else 0.0

        return {
            "image_path": str(image_path),
            "full_text": full_text.strip(),
            "confidence": round(avg_conf, 4),
            "latency_ms": round(latency_ms, 2),
            "total_words": len(words_data),
            "words": words_data,
            "hierarchy": {
                "pages": pages_data
            },
            "budget_status": self.tracker.get_status()
        }


if __name__ == "__main__":
    print("=" * 60)
    print("Google Cloud Vision API Handwriting Experiment Runner")
    print("=" * 60)

    try:
        exp = GoogleVisionExperiment()
        print("Vision client initialized successfully.")
        status = exp.tracker.get_status()
        print(f"Usage Budget Status: {status['used_units']}/{status['monthly_limit']} units used this month.")
        
        # Test sample if passed via arguments
        if len(sys.argv) > 1:
            target_img = sys.argv[1]
            print(f"\nProcessing test image: {target_img}")
            res = exp.recognize_image(target_img)
            print("\n--- RECOGNITION RESULT ---")
            print(f"Full Text:    {res['full_text']}")
            print(f"Confidence:   {res['confidence']:.2%}")
            print(f"Latency:      {res['latency_ms']} ms")
            print(f"Total Words:  {res['total_words']}")
    except Exception as e:
        print(f"\n[Notice] {e}")
