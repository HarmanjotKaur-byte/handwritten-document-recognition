# Google Cloud Vision Setup Guide for SimpleHTR Migration

This document provides step-by-step instructions to enable the Google Cloud Vision API, create a dedicated service account, generate authentication credentials, and configure them securely for handwriting recognition.

---

## Step 1: Create or Select a Google Cloud Project

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top navigation bar, click the project selector dropdown and click **New Project**.
3. Name your project (e.g., `simplehtr-vision-app`) and click **Create**.
4. Make sure your newly created project is selected in the top bar.

---

## Step 2: Enable the Cloud Vision API

1. In the Cloud Console search bar, search for **Cloud Vision API**.
2. Select **Cloud Vision API** from the results.
3. Click the **Enable** button.
   - *Note*: If billing is not already enabled on your Google Cloud account, you may be prompted to attach a billing account. Google Cloud provides a **Free Tier** that includes **1,000 Document Text Detection units free per month**.

---

## Step 3: Create a Dedicated Service Account

1. In the Cloud Console navigation menu, navigate to **IAM & Admin** > **Service Accounts**.
2. Click **+ Create Service Account** at the top.
3. Enter service account details:
   - **Service account name**: `vision-ocr-service`
   - **Service account ID**: `vision-ocr-service` (auto-filled)
   - **Description**: `Service account for SimpleHTR handwriting recognition`
4. Click **Create and Continue**.
5. Assign the role:
   - Search for and select: **Cloud Vision API User** (or `roles/viewer` / `roles/serviceusage.serviceUsageConsumer`).
6. Click **Done**.

---

## Step 4: Generate and Download the Service Account Key

1. In the **Service Accounts** list, click on the newly created service account (`vision-ocr-service@...`).
2. Navigate to the **Keys** tab at the top.
3. Click **Add Key** > **Create new key**.
4. Select **JSON** as the key type and click **Create**.
5. A `.json` private key file will automatically download to your computer.
   - *Security Notice*: Treat this JSON file like a password. Never share it, never commit it to Git, and never paste its contents into public repositories or frontend code.

---

## Step 5: Configure the Credentials Locally

Save the downloaded JSON file into the `backend/` directory with a standardized name, for example:
```
D:\Downloads\SimpleHTR-master\backend\gcp-credentials.json
```

Then configure the environment variable:

### On Windows (PowerShell):
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "D:\Downloads\SimpleHTR-master\backend\gcp-credentials.json"
```

### On Windows (Command Prompt):
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=D:\Downloads\SimpleHTR-master\backend\gcp-credentials.json
```

### Permanent Windows System Environment Variable:
```powershell
[System.Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', 'D:\Downloads\SimpleHTR-master\backend\gcp-credentials.json', 'User')
```

---

## Step 6: Verify Git Secrets Protection

Ensure that secret JSON credential files are excluded from Git:
```gitignore
# Google Cloud Service Account Keys
*credentials*.json
gcp-key*.json
*.pem
.env
```

---

## Step 7: Application-Level Free Tier Safety Guardrails

- The application implements an in-memory budget counter capping monthly requests at **900 calls/month** (leaving a 100-call buffer under Google's 1,000 free units/month).
- Once the budget is reached, the backend rejects further requests with HTTP 429 to prevent unintentional billing.
- *Notice*: The local application counter only tracks calls made through this application; it cannot track calls made by other projects or tools sharing the same Google Cloud account.
