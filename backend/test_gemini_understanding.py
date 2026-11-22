import os
import sys

backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.services.understanding_service import DocumentUnderstandingService

sample_irish = """May the saddest day of your future be no
Worse than the happie day of your past.
And may the most you wish for be the least
That you get.
-Irish blessing"""

print("--- 1. Testing Gemini Document Classification ---")
cat_res = DocumentUnderstandingService.classify_text(sample_irish)
print("Classification:", cat_res)

print("\n--- 2. Testing Gemini Summarize ---")
sum_res = DocumentUnderstandingService.summarize(sample_irish)
print("Summary:", sum_res)

print("\n--- 3. Testing Gemini Key Points ---")
kp_res = DocumentUnderstandingService.extract_key_points(sample_irish)
print("Key points:", kp_res)

print("\n--- 4. Testing Recommended Questions ---")
q_res = DocumentUnderstandingService.get_recommended_questions(sample_irish)
print("Recommended questions:", q_res)

if q_res:
    ans_res = DocumentUnderstandingService.answer_question(sample_irish, q_res[0])
    print(f"\n--- 5. Answer to '{q_res[0]}' ---")
    print("Answer:", ans_res)

print("\nTESTS COMPLETE!")
