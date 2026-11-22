# Automatic Document Type Detection

## Overview
Document Type Detection automatically identifies the structural category of a handwritten document scan upon OCR completion. The engine uses a lightweight, deterministic pattern-matching algorithm with category weights and keyword density scoring.

---

## 1. Supported Categories (14 Types)

1. **Notes**: Study notes, revision pointers, bullet points, definitions.
2. **Assignment**: University/school submissions with roll numbers, student IDs, and course codes.
3. **Question Paper / Exam Paper**: Tests with maximum marks, section headers, instructions, and numbered questions.
4. **Letter**: Formal/informal correspondence featuring salutations (*Dear Sir/Madam*) and sign-offs (*Yours faithfully*).
5. **Application**: Leave requests, formal petitions, declarations, and applicant signatures.
6. **Report**: Multi-section reports with introductions, methodology, findings, and conclusions.
7. **Resume / CV**: Curricula vitae, career objectives, work experience, and educational qualifications.
8. **Invoice / Bill**: Commercial billing documents with line-item quantities, unit prices, tax, and total amount due.
9. **Receipt**: Point-of-sale transactions, cashier identifiers, payment methods, and change due.
10. **Form**: Structured registration forms with checkboxes, block letters, and field labels.
11. **Timetable / Schedule**: Weekly planners, day columns (*Monday-Friday*), time slots, and period numbers.
12. **Meeting Minutes**: Meeting records with attendee lists (*Present/Absent*), agendas, and chairpersons.
13. **Study Material**: Textbook chapters, theorem proofs, lemmas, and exercise sets.
14. **Other / Unknown**: Unclassified or ambiguous documents with insufficient text signals.

---

## 2. Classification Mechanics & Guardrails

- **Threshold Confidence**: Requires a minimum confidence of 0.55 to assign a specific category.
- **Ambiguity Guard**: When text is brief (<10 characters) or matches weak signals across multiple categories, the engine classifies the document as **Other / Unknown** and provides an explanation.
- **User Control**: The detected category is displayed near the document title. Users can manually override the category via a dropdown selector. Overrides are marked as **Confirmed** and persist across sessions.
