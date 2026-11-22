# Deployment & Production Configuration Guide: SimpleHTR Platform

This guide outlines deployment options for hosting the **FastAPI Backend** and **React Frontend** online for free or low-cost evaluation.

---

## Architecture for Deployment

The system is split into two independent services:
1. **Frontend (Static SPA)**: React 19 + Vite 8. Can be hosted globally on CDN platforms like **Vercel**, **Netlify**, or **Cloudflare Pages**.
2. **Backend (Python ASGI Service)**: FastAPI + SQLite + Google GenAI SDK. Can be deployed on **Render**, **Railway**, or **Fly.io**.

```
[ Client Browser ]
       |
       v
[ Vercel / Netlify (Frontend) ]
       |
       |  HTTPS API Calls (VITE_API_URL)
       v
[ Render / Railway (FastAPI Backend) ]
       ├── SQLite (Persistent Disk)
       └── Google Cloud Vision / Gemini Multimodal API
```

---

## Option 1: Render (Backend) + Vercel (Frontend) [Recommended Free Tier]

### Step 1: Deploy Backend on Render (Web Service)
1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `simplehtr-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `MONTHLY_LIMIT`: `900`
   - `ENVIRONMENT`: `production`
6. Click **Deploy Web Service**. Once deployed, Render will provide your live backend URL (e.g. `https://simplehtr-api.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** &rarr; **Project**.
3. Import your repository.
4. In the configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your live Render backend URL + `/api` (e.g., `https://simplehtr-api.onrender.com/api`)
6. Click **Deploy**. Vercel will build and provide your live application URL (e.g., `https://simplehtr.vercel.app`).

---

## Option 2: Monolithic Docker Deployment (Single Server / Cloud Run)

You can run both frontend and backend on a containerized service (such as **Google Cloud Run** or a VPS):

Create a `Dockerfile`:
```dockerfile
# Multi-stage build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "backend.app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
```
