const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Health check endpoint: checks backend availability and model load state.
 */
export async function fetchHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Backend returned status ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection to SimpleHTR backend timed out (server unreachable).');
    }
    throw new Error('Cannot reach SimpleHTR backend server. Ensure backend is running on port 8000.');
  }
}

/**
 * Model info endpoint: retrieves topology, vocabulary, and active checkpoint.
 */
export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to retrieve model architecture metadata');
  }
  return await res.json();
}

/**
 * Usage status endpoint.
 */
export async function fetchUsage() {
  const res = await fetch(`${API_BASE}/usage`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to retrieve usage stats');
  }
  return await res.json();
}

/**
 * Samples catalog: lists reference handwriting samples available on the server.
 */
export async function fetchSamples() {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to retrieve reference samples');
  }
  return await res.json();
}

/**
 * Inference endpoint: sends image File to POST /api/predict.
 */
export async function predictImage(file) {
  if (!file) {
    throw new Error('No image file selected.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Prediction request failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Model inference returned unsuccessful status.');
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Recognition request timed out after 20 seconds.');
    }
    throw err;
  }
}

/**
 * Sample inference endpoint: requests prediction on a predefined server sample by ID.
 */
export async function predictSample(sampleId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}/sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_id: sampleId }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Sample prediction failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Sample recognition failed.');
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Sample recognition timed out.');
    }
    throw err;
  }
}

// ==========================================
// USER AUTHENTICATION APIS
// ==========================================

export async function signupUser({ name, email, password }) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Signup failed');
  return data;
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

// ==========================================
// POST-OCR DOCUMENT UNDERSTANDING & WORKSPACE APIS
// ==========================================

export async function classifyDocument(text) {
  const res = await fetch(`${API_BASE}/documents/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Classification failed');
  return await res.json();
}

export async function improveDocumentText(text) {
  const res = await fetch(`${API_BASE}/documents/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Text improvement failed');
  return await res.json();
}

export async function summarizeDocument(text) {
  const res = await fetch(`${API_BASE}/documents/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Summarization failed');
  return await res.json();
}

export async function extractDocumentKeyPoints(text) {
  const res = await fetch(`${API_BASE}/documents/key-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Key points extraction failed');
  return await res.json();
}

export async function fetchRecommendedQuestions(text) {
  const res = await fetch(`${API_BASE}/documents/recommended-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Failed to fetch recommended questions');
  return await res.json();
}

export async function askDocumentQuestion(text, question) {
  const res = await fetch(`${API_BASE}/documents/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, question })
  });
  if (!res.ok) throw new Error('Q&A request failed');
  return await res.json();
}

export async function exportDocumentFile({ docName, originalText, improvedText, version, format }) {
  const res = await fetch(`${API_BASE}/documents/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_name: docName || 'Document',
      original_text: originalText,
      improved_text: improvedText || '',
      version: version || 'improved',
      format: format || 'txt'
    })
  });

  if (!res.ok) throw new Error(`Export failed with status ${res.status}`);

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${docName || 'document'}_${version}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
  return true;
}

// CRUD
export async function listSavedDocuments(params = {}) {
  const query = new URLSearchParams();
  if (params.user_id) query.append('user_id', params.user_id);
  if (params.category) query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.is_favorite !== undefined) query.append('is_favorite', params.is_favorite);
  if (params.tag) query.append('tag', params.tag);

  const res = await fetch(`${API_BASE}/documents?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load saved documents');
  return await res.json();
}

export async function saveDocumentRecord(docData) {
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docData)
  });
  if (!res.ok) throw new Error('Failed to save document');
  return await res.json();
}

export async function updateDocumentRecord(docId, updates) {
  const res = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update document');
  return await res.json();
}

export async function deleteDocumentRecord(docId) {
  const res = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete document');
  return await res.json();
}
