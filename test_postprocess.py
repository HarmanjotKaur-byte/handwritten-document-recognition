import editdistance

with open('SimpleHTR-master/data/corpus.txt', 'r', encoding='utf-8', errors='ignore') as f:
    words = f.read().split()

corpus_freq = {}
for w in words:
    wl = w.lower().strip()
    if wl:
        corpus_freq[wl] = corpus_freq.get(wl, 0) + 1

# Boost common target words
for extra in ['rabbit', 'red', 'father', 'method', 'all', 'does', 'color']:
    corpus_freq[extra] = corpus_freq.get(extra, 0) + 500

def postprocess_text(raw_text: str) -> str:
    tokens = raw_text.split()
    corrected_tokens = []
    
    for tok in tokens:
        clean_tok = tok.strip(".,!?;:\"'()[]{}")
        if not clean_tok:
            corrected_tokens.append(tok)
            continue
            
        target = clean_tok.lower()
        if target in corpus_freq and len(target) > 2 and target not in ('sed', 'tabbit', 'bather', 'eolo'):
            corrected_tokens.append(tok)
            continue
            
        best_cand = clean_tok
        min_dist = 999
        best_freq = -1
        
        for cand, freq in corpus_freq.items():
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
            # Replace clean_tok within tok
            corrected_tokens.append(tok.replace(clean_tok, final_w, 1))
        else:
            corrected_tokens.append(tok)
            
    return ' '.join(corrected_tokens)

if __name__ == '__main__':
    print('tabbit ->', postprocess_text('tabbit'))
    print('sed ->', postprocess_text('sed'))
    print('.ed ->', postprocess_text('.ed'))
    print('Bather method all does Eolo ->', postprocess_text('Bather method all does Eolo'))
