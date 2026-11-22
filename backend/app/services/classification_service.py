"""
Document Classification Service.
Analyzes extracted text using document-specific vocabulary, structural cues, and patterns.
Lightweight, local, deterministic, and free.
"""
import re
from typing import Dict, Any, List, Tuple

# Categories definition
CATEGORIES = [
    "Notes",
    "Assignment",
    "Question Paper / Exam Paper",
    "Letter",
    "Application",
    "Report",
    "Resume / CV",
    "Invoice / Bill",
    "Receipt",
    "Form",
    "Timetable / Schedule",
    "Meeting Minutes",
    "Study Material",
    "Other / Unknown"
]

CATEGORY_PATTERNS = {
    "Invoice / Bill": {
        "keywords": ["invoice", "bill to", "due date", "subtotal", "total amount", "tax", "gst", "qty", "unit price", "amount due", "remit to", "balance due"],
        "weight": 2.0
    },
    "Receipt": {
        "keywords": ["receipt", "cashier", "change due", "payment method", "pos terminal", "card no", "transaction id", "sub total", "tax invoice", "received with thanks"],
        "weight": 1.8
    },
    "Resume / CV": {
        "keywords": ["curriculum vitae", "resume", "work experience", "education", "skills", "projects", "certifications", "contact info", "career objective", "qualifications", "references"],
        "weight": 2.0
    },
    "Question Paper / Exam Paper": {
        "keywords": ["maximum marks", "max marks", "section a", "section b", "section c", "question paper", "time allowed", "instructions", "attempt all", "q.1", "q1", "q.no", "marks each"],
        "weight": 2.0
    },
    "Assignment": {
        "keywords": ["assignment", "submitted by", "submitted to", "roll no", "roll number", "course code", "student id", "academic year", "department of", "topic"],
        "weight": 1.8
    },
    "Letter": {
        "keywords": ["dear", "yours faithfully", "yours sincerely", "sincerely", "to whom it may concern", "subject:", "with regards", "best regards"],
        "weight": 1.6
    },
    "Application": {
        "keywords": ["application for", "resignation letter", "leave application", "humbly request", "kindly grant", "beg to state", "applicant signature", "applied for"],
        "weight": 1.8
    },
    "Meeting Minutes": {
        "keywords": ["meeting minutes", "minutes of meeting", "attendees", "present:", "absent:", "agenda", "action items", "adjourned at", "chaired by"],
        "weight": 2.0
    },
    "Timetable / Schedule": {
        "keywords": ["timetable", "time table", "schedule", "monday", "tuesday", "wednesday", "thursday", "friday", "period", "am -", "pm -", "slot"],
        "weight": 1.6
    },
    "Report": {
        "keywords": ["executive summary", "introduction", "methodology", "findings", "conclusion", "recommendations", "table of contents", "analysis", "case study"],
        "weight": 1.5
    },
    "Form": {
        "keywords": ["first name", "last name", "date of birth", "gender", "signature of", "check one", "fill in", "block letters", "declaration", "office use only"],
        "weight": 1.7
    },
    "Study Material": {
        "keywords": ["chapter", "lecture", "unit", "exercise", "textbook", "reading material", "syllabus", "theorem", "lemma", "proof"],
        "weight": 1.4
    },
    "Notes": {
        "keywords": ["note", "important", "remember", "summary", "definition", "key points", "bullet", "bullet point", "revision", "formula", "point to ponder"],
        "weight": 1.2
    }
}


class DocumentClassificationService:
    @staticmethod
    def classify_text(text: str) -> Dict[str, Any]:
        """
        Classifies extracted text into a document category.
        Returns category, confidence (0.0 to 1.0), and human-readable explanation.
        """
        if not text or len(text.strip()) < 10:
            return {
                "category": "Other / Unknown",
                "confidence": 0.0,
                "is_confident": False,
                "reason": "Text is too brief or empty to classify with confidence.",
                "matched_patterns": []
            }

        clean_text = text.lower()
        scores: Dict[str, Tuple[float, List[str]]] = {}

        for cat, config in CATEGORY_PATTERNS.items():
            matches = []
            score = 0.0
            for kw in config["keywords"]:
                # Use regex word boundaries for short words, substring for multi-word phrases
                if " " in kw or "." in kw:
                    count = clean_text.count(kw)
                else:
                    count = len(re.findall(rf"\b{re.escape(kw)}\b", clean_text))

                if count > 0:
                    matches.append(kw)
                    score += count * config["weight"]

            if matches:
                scores[cat] = (score, matches)

        if not scores:
            return {
                "category": "Other / Unknown",
                "confidence": 0.15,
                "is_confident": False,
                "reason": "No strong document-specific keyword patterns detected.",
                "matched_patterns": []
            }

        # Sort by total score descending
        sorted_scores = sorted(scores.items(), key=lambda x: x[1][0], reverse=True)
        top_category, (top_score, top_matches) = sorted_scores[0]

        # Calculate normalized confidence
        # Score of 3.0 or more yields >= 0.70 confidence
        confidence = min(0.95, round(0.40 + (top_score * 0.12), 2))
        is_confident = confidence >= 0.55 and len(top_matches) >= 1

        if not is_confident:
            return {
                "category": "Other / Unknown",
                "suggested_category": top_category,
                "confidence": confidence,
                "is_confident": False,
                "reason": f"Weak signals matched ({', '.join(top_matches[:3])}); confidence is below reliable threshold.",
                "matched_patterns": top_matches[:5]
            }

        return {
            "category": top_category,
            "confidence": confidence,
            "is_confident": True,
            "reason": f"Identified characteristic patterns: {', '.join(top_matches[:4])}.",
            "matched_patterns": top_matches[:5]
        }
