"""
Document Export Service.
Generates:
- TXT
- DOCX (via python-docx)
- PDF (via reportlab)
- Structured JSON
Allows exporting Original OCR text, Improved text, or Both versions side by side.
"""
import io
import json
from typing import Dict, Any, Optional
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


class DocumentExportService:

    @staticmethod
    def export_txt(doc_name: str, original_text: str, improved_text: str, version: str = "improved") -> bytes:
        """
        Exports plain text (.txt).
        version: 'original' | 'improved' | 'both'
        """
        buffer = io.StringIO()
        buffer.write(f"=== {doc_name} ===\n\n")

        if version == "original":
            buffer.write("[ORIGINAL OCR OUTPUT]\n")
            buffer.write(original_text or "(No text detected)")
        elif version == "improved":
            buffer.write("[IMPROVED TEXT]\n")
            buffer.write(improved_text or original_text or "(No text detected)")
        else:  # both
            buffer.write("--- ORIGINAL OCR OUTPUT ---\n")
            buffer.write(original_text or "(No text detected)")
            buffer.write("\n\n--- IMPROVED TEXT ---\n")
            buffer.write(improved_text or "(No edits)")

        buffer.write("\n\n[Exported by Handwritten Document Recognition System]")
        return buffer.getvalue().encode("utf-8")

    @staticmethod
    def export_docx(doc_name: str, original_text: str, improved_text: str, version: str = "improved") -> bytes:
        """
        Generates formatted Microsoft Word (.docx) document.
        """
        doc = Document()

        # Title
        title_p = doc.add_paragraph()
        run = title_p.add_run(doc_name)
        run.bold = True
        run.font.size = Pt(20)
        run.font.color.rgb = RGBColor(15, 23, 42)

        subtitle_p = doc.add_paragraph()
        sub_run = subtitle_p.add_run("Handwritten Document Recognition System Export")
        sub_run.font.size = Pt(9)
        sub_run.font.color.rgb = RGBColor(100, 116, 139)

        doc.add_paragraph("-" * 50)

        if version in ["original", "both"]:
            h = doc.add_heading("Original OCR Output", level=2)
            h.style.font.color.rgb = RGBColor(37, 99, 235)
            for p in (original_text or "(Blank)").split("\n"):
                if p.strip():
                    doc.add_paragraph(p)
                else:
                    doc.add_paragraph()

        if version in ["improved", "both"]:
            if version == "both":
                doc.add_paragraph("-" * 50)
            h = doc.add_heading("Improved & Edited Text", level=2)
            h.style.font.color.rgb = RGBColor(16, 185, 129)
            target = improved_text or original_text or "(Blank)"
            for p in target.split("\n"):
                if p.strip():
                    doc.add_paragraph(p)
                else:
                    doc.add_paragraph()

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def export_pdf(doc_name: str, original_text: str, improved_text: str, version: str = "improved") -> bytes:
        """
        Generates formatted PDF document via reportlab.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=6
        )

        sub_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=12
        )

        section_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#1e40af'),
            spaceBefore=10,
            spaceAfter=8
        )

        body_style = ParagraphStyle(
            'BodyText',
            parent=styles['Normal'],
            fontSize=10,
            leading=15,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=6
        )

        elements = [
            Paragraph(doc_name, title_style),
            Paragraph("Exported by Handwritten Document Recognition System", sub_style),
            HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=4, spaceAfter=12)
        ]

        if version in ["original", "both"]:
            elements.append(Paragraph("Original OCR Output", section_style))
            for line in (original_text or "(No text)").split("\n"):
                safe_line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") or "&nbsp;"
                elements.append(Paragraph(safe_line, body_style))
            elements.append(Spacer(1, 10))

        if version in ["improved", "both"]:
            if version == "both":
                elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e2e8f0'), spaceBefore=8, spaceAfter=12))
            elements.append(Paragraph("Improved & Edited Text", section_style))
            target = improved_text or original_text or "(No text)"
            for line in target.split("\n"):
                safe_line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") or "&nbsp;"
                elements.append(Paragraph(safe_line, body_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def export_json(document_data: Dict[str, Any]) -> bytes:
        """
        Exports full structured document JSON.
        """
        clean_data = {
            "id": document_data.get("id"),
            "name": document_data.get("name"),
            "created_at": document_data.get("created_at"),
            "updated_at": document_data.get("updated_at"),
            "category": document_data.get("category"),
            "category_confidence": document_data.get("category_confidence"),
            "tags": document_data.get("tags", []),
            "is_favorite": document_data.get("is_favorite", False),
            "original_ocr_text": document_data.get("original_ocr_text", ""),
            "improved_text": document_data.get("improved_text", ""),
            "summary": document_data.get("summary", {}),
            "key_points": document_data.get("key_points", {}),
            "metadata": {
                "provider": document_data.get("provider", "Google Vision / Gemini"),
                "processing_time_ms": document_data.get("processing_time_ms", 0),
                "image_dimensions": document_data.get("image_dimensions")
            }
        }
        return json.dumps(clean_data, indent=2).encode("utf-8")
