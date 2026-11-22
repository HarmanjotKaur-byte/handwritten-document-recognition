"""
Unit tests for Post-OCR endpoints, document classification, understanding, export, and storage.
"""
import sys
import unittest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestPostOCRServices(unittest.TestCase):

    def test_classify_invoice(self):
        text = "INVOICE #4023\nBill to: Acme Corp\nTotal Amount Due: $450.00\nQty: 2\nDue date: 2026-12-01"
        res = client.post("/api/documents/classify", json={"text": text})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["category"], "Invoice / Bill")
        self.assertTrue(data["is_confident"])
        self.assertGreaterEqual(data["confidence"], 0.6)

    def test_classify_notes(self):
        text = "Chapter 4 Notes: Important formulas\nRemember to review definitions of thermodynamics."
        res = client.post("/api/documents/classify", json={"text": text})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn(data["category"], ["Notes", "Study Material"])

    def test_classify_empty_or_unknown(self):
        res = client.post("/api/documents/classify", json={"text": "hello"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["category"], "Other / Unknown")
        self.assertFalse(data["is_confident"])

    def test_improve_text_fixes_typos_and_spacing(self):
        text = "teh rabbit is runing ,andd jump .recieve the parcel."
        res = client.post("/api/documents/improve", json={"text": text})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("the rabbit", data["improved_text"].lower())
        self.assertIn("receive", data["improved_text"].lower())
        self.assertFalse(" ,andd" in data["improved_text"])

    def test_summarize_document(self):
        text = "This document outlines the project goals for HDRS. The primary objective is accurate handwriting recognition. Second paragraph explains performance metrics."
        res = client.post("/api/documents/summarize", json={"text": text})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data["short_summary"]) > 0)
        self.assertTrue(len(data["main_ideas"]) > 0)

    def test_extract_key_points(self):
        text = "Meeting on 2026-11-22. Total budget is $500. Action item: must submit the report before deadline."
        res = client.post("/api/documents/key-points", json={"text": text})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("2026-11-22", data["dates"])
        self.assertTrue(any("$500" in amt for amt in data["quantities_and_amounts"]))
        self.assertTrue(len(data["action_items"]) > 0)

    def test_ask_question_grounded(self):
        text = "The event will start at 10 AM on 2026-12-05 in New York."
        # Date question
        res_date = client.post("/api/documents/ask", json={"text": text, "question": "What is the date?"})
        self.assertEqual(res_date.status_code, 200)
        self.assertTrue(res_date.json()["is_grounded"])
        self.assertIn("2026-12-05", res_date.json()["answer"])

        # Unrelated question
        res_unk = client.post("/api/documents/ask", json={"text": text, "question": "What is the price of the car?"})
        self.assertEqual(res_unk.status_code, 200)
        self.assertFalse(res_unk.json()["is_grounded"])
        self.assertIn("does not provide enough information", res_unk.json()["answer"])

    def test_export_endpoints(self):
        payload = {
            "doc_name": "TestDoc",
            "original_text": "Original handwritten sentence.",
            "improved_text": "Improved handwritten sentence.",
            "version": "both",
            "format": "txt"
        }
        res_txt = client.post("/api/documents/export", json=payload)
        self.assertEqual(res_txt.status_code, 200)
        self.assertIn(b"ORIGINAL OCR OUTPUT", res_txt.content)
        self.assertIn(b"IMPROVED TEXT", res_txt.content)

        payload["format"] = "docx"
        res_docx = client.post("/api/documents/export", json=payload)
        self.assertEqual(res_docx.status_code, 200)
        self.assertTrue(len(res_docx.content) > 100)

        payload["format"] = "pdf"
        res_pdf = client.post("/api/documents/export", json=payload)
        self.assertEqual(res_pdf.status_code, 200)
        self.assertTrue(len(res_pdf.content) > 100)

    def test_document_crud_strict_separation(self):
        doc_data = {
            "id": "test_doc_001",
            "name": "Math Notes",
            "category": "Notes",
            "tags": ["math", "calculus"],
            "original_ocr_text": "Derivative of x^2 is 2x.",
            "improved_text": "Derivative of x^2 is 2x."
        }
        # 1. Create
        res_create = client.post("/api/documents", json=doc_data)
        self.assertEqual(res_create.status_code, 200)
        created = res_create.json()["document"]
        self.assertEqual(created["original_ocr_text"], "Derivative of x^2 is 2x.")

        # 2. Update improved text
        res_update = client.put("/api/documents/test_doc_001", json={"improved_text": "The derivative of x^2 equals 2x."})
        self.assertEqual(res_update.status_code, 200)
        updated = res_update.json()["document"]
        self.assertEqual(updated["improved_text"], "The derivative of x^2 equals 2x.")
        # CRITICAL TEST: Original OCR text MUST NOT BE OVERWRITTEN!
        self.assertEqual(updated["original_ocr_text"], "Derivative of x^2 is 2x.")

        # 3. List
        res_list = client.get("/api/documents?category=Notes")
        self.assertEqual(res_list.status_code, 200)
        self.assertTrue(any(d["id"] == "test_doc_001" for d in res_list.json()["documents"]))

        # 4. Delete
        res_del = client.delete("/api/documents/test_doc_001")
        self.assertEqual(res_del.status_code, 200)


if __name__ == "__main__":
    unittest.main()
