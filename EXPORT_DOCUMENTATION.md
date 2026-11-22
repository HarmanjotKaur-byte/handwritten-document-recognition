# Export Options Documentation

## Overview

HDRS provides multiple standardized export options designed for academic documentation, dataset generation, recordkeeping, and downstream NLP pipeline consumption.

---

## 1. Supported Formats

| Format | Scope | Structure / Contents | Preservation Details |
|---|---|---|---|
| **TXT** | Single Document | Full plain text document transcription | Retains native multi-line breaks and paragraph boundaries |
| **JSON** | Single Document | Full document metadata, paragraphs, words, bounding boxes | Complete structured AST representation |
| **JSON** | Batch History | Complete array of historical recognition records | Full session audit trail formatted in JSON array |
| **CSV** | Batch History | Tabular columns: `Recognition_ID`, `Timestamp`, `Input_Type`, `Status`, `Recognized_Text`, `Latency_ms`, `Image_Dimensions` | RFC 4180 compliant with double-quote escaping |
| **Clipboard** | Single / Quick | Clean formatted plain text string | Direct system clipboard copy via modern Navigator API |

---

## 2. Formatting Preservation

### Paragraph & Line Breaks
When exporting to `.txt` or copying to the clipboard, paragraph divisions detected by the model are preserved using double newline characters `\n\n`. Line wraps within paragraphs maintain single newlines `\n`, allowing exported text to easily paste into Word, Google Docs, LaTeX, or Markdown editors without lost indentation.

### CSV Normalization
Exported CSV files escape quotation marks according to RFC 4180 standards:
```javascript
`"${(item.recognized_text || '').replace(/"/g, '""')}"`
```
This guarantees that multi-word transcriptions with commas, quotes, and punctuation do not break spreadsheet cell boundaries when opened in Microsoft Excel, Apple Numbers, or Google Sheets.

---

## 3. Client-Side Blob Generation

All file downloads are produced purely on the client side using the HTML5 `Blob` and `URL.createObjectURL` APIs:
- Zero extra server traffic.
- Immediate response latency.
- Completely offline-compatible once the page is loaded.
- Temporary object URLs are revoked (`URL.revokeObjectURL(url)`) immediately after initiating the download to prevent client memory leaks.
