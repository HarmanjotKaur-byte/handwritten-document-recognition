# Experimental Evaluation & Metrics: AI-Based Handwritten Document Understanding System

## 1. Evaluation Methodology

To rigorously verify the recognition quality of the system, a formal quantitative evaluation was performed against a labeled benchmark dataset consisting of **15 handwriting samples** (combining SimpleHTR repository test images and standardized line extracts from the IAM Handwriting Database).

### Experimental Setup:
- **Reference Ground Truth**: Manually transcribed and verified text files.
- **Evaluation Metrics**:
  - **Character Error Rate (CER)**: Levenshtein distance measured at the character level.
  - **Word Error Rate (WER)**: Levenshtein distance measured at the token/word level.
  - **Exact Match Accuracy**: Percentage of samples where prediction exactly matches ground truth.
  - **Inference Latency**: Round-trip processing time from input reception to text return.

---

## 2. Mathematical Formulations

### Character Error Rate (CER)
$$\text{CER} = \frac{S + D + I}{N}$$
Where:
- $S$ = Number of character substitutions.
- $D$ = Number of character deletions.
- $I$ = Number of character insertions.
- $N$ = Total number of characters in the ground-truth reference text.

### Word Error Rate (WER)
$$\text{WER} = \frac{S_w + D_w + I_w}{N_w}$$
Where:
- $S_w, D_w, I_w$ are word substitutions, deletions, and insertions respectively.
- $N_w$ is the total number of words in reference text.

---

## 3. Measured Benchmark Results

The following values were empirically measured using `sample_predictions.csv` and exported to `evaluation_results.csv`:

| Evaluation Metric | Measured Benchmark Value | Interpretation & Analysis |
|---|---|---|
| **Character Error Rate (CER)** | **6.97%** | Outstanding character recognition accuracy across diverse handwriting styles. |
| **Word Error Rate (WER)** | **39.13%** | Moderate word error rate primarily caused by tokenization and punctuation separation differences in benchmark datasets. |
| **Exact Match Accuracy** | **26.67%** | Exact 1:1 match across unconstrained cursive and multi-word line benchmarks. |
| **Average Latency** | **3,154.31 ms** | ~3.15 seconds per document line/page. |
| **Total Evaluation Samples** | **15** | Standard benchmark set covering single words, lines, and noisy crops. |

---

## 4. Factors Affecting Handwriting Recognition Accuracy

In real-world deployment, accuracy varies based on:
1. **Penmanship & Legibility**: Heavily slanted or erratic cursive increases ligature ambiguity.
2. **Ink and Background Contrast**: Faint pencil marks or dark textured paper degrade feature clarity.
3. **Punctuation Discrepancies**: The IAM dataset tokenizes punctuation with detached spaces (e.g. `word , but it 's`), whereas modern AI models output grammatically correct connected text (`word, but it's`), which penalizes strict WER despite higher human readability.
4. **Resolution and Lighting**: Low-resolution captures (< 300 DPI) or uneven shadows can mask subtle stroke intersections.
