import os
import sys

# Ensure backend root is in sys.path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.services.classification_service import DocumentClassificationService
from app.services.understanding_service import DocumentUnderstandingService
from app.services.export_service import DocumentExportService
from app.services.document_storage import DocumentStorageService

print("--- 1. Testing DocumentClassificationService ---")
res1 = DocumentClassificationService.classify_text("INVOICE #102\nTotal amount due: $150.00\nDue date: 2026-12-01")
print("Invoice classification:", res1)
assert res1["category"] == "Invoice / Bill"
assert res1["is_confident"] is True

print("\n--- 2. Testing DocumentUnderstandingService (Improve Text) ---")
res2 = DocumentUnderstandingService.improve_text("teh cat ,andd teh dog .recieve this")
print("Improved text:", res2["improved_text"])
assert "the cat" in res2["improved_text"].lower()
assert "receive" in res2["improved_text"].lower()

print("\n--- 3. Testing DocumentUnderstandingService (Summarize) ---")
res3 = DocumentUnderstandingService.summarize("First sentence of the note. Second sentence provides context. Third sentence concludes.")
print("Summary:", res3["short_summary"])
assert len(res3["main_ideas"]) >= 1

print("\n--- 4. Testing DocumentUnderstandingService (Key Points) ---")
res4 = DocumentUnderstandingService.extract_key_points("Meeting on 2026-11-22 with budget of $500. Action item: must finish code.")
print("Key points:", res4)
assert "2026-11-22" in res4["dates"]
assert len(res4["action_items"]) > 0

print("\n--- 5. Testing DocumentUnderstandingService (Q&A) ---")
res5 = DocumentUnderstandingService.answer_question("The office is located in Seattle. Meeting is at 3pm.", "Where is the office?")
print("Q&A answer:", res5)
assert "seattle" in res5["answer"].lower()
assert res5["is_grounded"] is True

res5_unk = DocumentUnderstandingService.answer_question("The office is located in Seattle.", "What is the owner's phone number?")
print("Q&A unknown answer:", res5_unk)
assert res5_unk["is_grounded"] is False

print("\n--- 6. Testing DocumentExportService ---")
txt_bytes = DocumentExportService.export_txt("DocA", "Original line", "Improved line", version="both")
assert b"ORIGINAL OCR OUTPUT" in txt_bytes
assert b"IMPROVED TEXT" in txt_bytes

docx_bytes = DocumentExportService.export_docx("DocA", "Original line", "Improved line", version="both")
assert len(docx_bytes) > 100

pdf_bytes = DocumentExportService.export_pdf("DocA", "Original line", "Improved line", version="both")
assert len(pdf_bytes) > 100
print("Exports generated successfully (TXT, DOCX, PDF).")

print("\n--- 7. Testing DocumentStorageService (Strict Separation) ---")
store = DocumentStorageService.get_instance()
doc = store.create_document({
    "id": "doc_test_split",
    "name": "Strict Test",
    "original_ocr_text": "Original raw OCR output text.",
    "improved_text": "Original raw OCR output text."
})
print("Created doc original:", doc["original_ocr_text"])

# Update improved text
updated = store.update_document("doc_test_split", {
    "improved_text": "User edited improved text version."
})
print("Updated doc improved:", updated["improved_text"])
print("Updated doc original (must be unchanged):", updated["original_ocr_text"])
assert updated["original_ocr_text"] == "Original raw OCR output text."
assert updated["improved_text"] == "User edited improved text version."

# Cleanup
store.delete_document("doc_test_split")

print("\nALL POST-OCR SERVICES VERIFIED 100%!")
