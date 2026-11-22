# Application Usage & Quota Dashboard Documentation

## 1. Free-Tier Operational Guarantees

HDRS is designed with strict application-level guardrails to ensure **100% free-tier operation** without risk of unexpected billing or overage charges:

- **Configured Monthly Limit**: 900 recognition calls per calendar month.
- **Circuit Breaker Enforcement**: When `used_units >= monthly_limit`, `UsageService.check_and_increment()` rejects incoming requests with an HTTP 429 status (`MONTHLY_FREE_QUOTA_EXHAUSTED`).
- **Zero Paid API Fallback**: The backend refuses to silently route requests to paid services.

---

## 2. API Usage vs. Recognition Accuracy

The system maintains a clear architectural and user-facing distinction between API usage and model recognition accuracy:

| Metric | Definition | Measurement Source | Impact on Quota |
|---|---|---|---|
| **API Usage** | Volume of remote inference calls initiated | `backend/data/vision_usage.json` | Every submitted image increments counter by 1 |
| **Model Accuracy** | Character Error Rate (CER) and Word Error Rate (WER) against ground truth | Empirical evaluation benchmark | Independent of API quota consumption |

> **Important**: Even if a user uploads a blank image or an unreadable scribble resulting in zero detected characters, the backend still executes a vision inference call, consuming 1 unit of the monthly 900-unit allowance.

---

## 3. Real-Time Telemetry & Metrics

The **Usage & Quota Dashboard** surfaces:
1. **Current Month Allowance**: Ratio of consumed units to total monthly capacity (e.g., `8 / 900`).
2. **Cycle Reset Date**: Automated calendar tracking indicating when the free-tier allowance refreshes (1st of each month at 00:00 UTC).
3. **Session Query Throughput**: Breakdown of successful non-empty transcriptions vs. blank/empty inputs.
4. **Average Processing Latency**: Real-time round-trip latency calculated across all session requests.
5. **Circuit Breaker State**: Visual status badge showing whether the service is operational (`NORMAL`) or paused (`EXHAUSTED`).

---

## 4. Multi-Page Document & PDF Support Feasibility Study

### Technical Investigation
Google Cloud Vision API provides multi-page PDF/TIFF processing via asynchronous batch endpoints (`async_batch_annotate_images`):

1. **Storage Requirement**: Requires an active Google Cloud Storage (GCS) bucket for both input PDF staging and output JSON destinations. Public buckets are not allowed under our security guidelines.
2. **Billing Unit Mechanics**: Google Cloud Vision bills each PDF page as an individual image unit. A 10-page handwritten notebook scan would consume 10 units against the monthly quota.
3. **Budget Feasibility under Free Tier**:
   - Because our target deployment runs on 100% free tier without credit card billing or dedicated GCS infrastructure, invoking multi-page PDF pipelines via asynchronous cloud storage is restricted by design.
   - For user convenience, the application currently supports standard document scan formats (**JPG, JPEG, PNG, WEBP**) with a maximum upload size of 10MB, ensuring 100% free compliance and zero-leakage security.
