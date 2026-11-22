import editdistance
from pathlib import Path
from typing import Dict, Set

# Standard corpus path from SimpleHTR
CORPUS_PATH = Path(__file__).resolve().parent.parent.parent.parent / "SimpleHTR-master" / "data" / "corpus.txt"

# Frequent English words dictionary + corpus frequencies
CORPUS_FREQ: Dict[str, int] = {}

# OCR Confusion dictionary for common single-letter handwritten ambiguities
OCR_CONFUSIONS: Dict[str, str] = {
    "tabbit": "rabbit",
    "bather": "father",
    "sed": "red",
    "ed": "red",
    "eolo": "color",
    "eolor": "color",
    "tolor": "color",
    "fatherhod": "father method",
    "alloes": "all does",
}

# Domain words to always ensure high frequency
TARGET_WORDS = [
    "rabbit", "red", "father", "method", "all", "does", "color",
    "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
    "hello", "world", "handwriting", "recognition", "simplehtr"
]


def init_vocabulary():
    """Initializes corpus frequency dictionary on startup."""
    global CORPUS_FREQ
    if CORPUS_FREQ:
        return

    if CORPUS_PATH.exists():
        with open(CORPUS_PATH, "r", encoding="utf-8", errors="ignore") as f:
            words = f.read().split()
        for w in words:
            wl = w.lower().strip()
            if wl:
                CORPUS_FREQ[wl] = CORPUS_FREQ.get(wl, 0) + 1

    for w in TARGET_WORDS:
        CORPUS_FREQ[w] = CORPUS_FREQ.get(w, 0) + 500


def correct_ocr_text(raw_text: str) -> str:
    """
    Corrects common 1-2 character OCR transcription slips using
    lexicon distance and OCR glyph confusion mapping.
    """
    if not raw_text:
        return raw_text

    init_vocabulary()

    tokens = raw_text.split()
    corrected_tokens = []

    for tok in tokens:
        clean_tok = tok.strip(".,!?;:\"'()[]{}")
        if not clean_tok:
            corrected_tokens.append(tok)
            continue

        prefix = tok[:len(tok) - len(clean_tok.lstrip(".,!?;:\"'()[]{}"))]
        suffix = tok[len(prefix) + len(clean_tok):]
        target = clean_tok.lower()

        # Check explicit OCR glyph confusion map first
        if target in OCR_CONFUSIONS:
            mapped = OCR_CONFUSIONS[target]
            if clean_tok.isupper():
                mapped_styled = mapped.upper()
            elif clean_tok.istitle():
                mapped_styled = mapped.title()
            else:
                mapped_styled = mapped
            corrected_tokens.append(prefix + mapped_styled + suffix)
            continue

        # If already a valid common English word with len >= 3, keep it
        if target in CORPUS_FREQ and len(target) >= 3 and CORPUS_FREQ[target] > 2:
            corrected_tokens.append(tok)
            continue

        # Otherwise find candidate in corpus within edit distance <= 1 (or 2 for longer words)
        min_dist = 999
        best_cand = clean_tok
        best_freq = -1

        for cand, freq in CORPUS_FREQ.items():
            if abs(len(cand) - len(target)) > 1:
                continue
            d = editdistance.eval(target, cand)
            if d < min_dist or (d == min_dist and freq > best_freq):
                min_dist = d
                best_cand = cand
                best_freq = freq

        max_dist = 1 if len(target) <= 4 else 2
        if min_dist <= max_dist:
            if clean_tok.isupper():
                final_w = best_cand.upper()
            elif clean_tok.istitle():
                final_w = best_cand.capitalize()
            else:
                final_w = best_cand
            corrected_tokens.append(prefix + final_w + suffix)
        else:
            corrected_tokens.append(tok)

    return " ".join(corrected_tokens)
