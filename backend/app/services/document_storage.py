"""
SQLite-backed Document Storage Service.
Replaces JSON file with persistent relational SQLite storage.
Provides:
- List documents (with search, category, favorites, tag filtering)
- Create document (strict original vs improved separation)
- Get document by ID
- Update document
- Delete document
"""
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.services.database import get_db_connection

logger = logging.getLogger("simplehtr.document_db")


class DocumentStorageService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DocumentStorageService()
        return cls._instance

    def list_documents(
        self,
        user_id: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        is_favorite: Optional[bool] = None,
        tag: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM documents WHERE 1=1"
        params = []

        if user_id:
            query += " AND (user_id = ? OR user_id IS NULL)"
            params.append(user_id)

        if category:
            query += " AND category = ?"
            params.append(category)

        if is_favorite is not None:
            query += " AND is_favorite = ?"
            params.append(1 if is_favorite else 0)

        query += " ORDER BY updated_at DESC"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        docs = []
        for r in rows:
            d = dict(r)
            d["is_favorite"] = bool(d["is_favorite"])
            try:
                d["tags"] = json.loads(d["tags"])
            except:
                d["tags"] = []
            try:
                d["summary"] = json.loads(d["summary"])
            except:
                d["summary"] = {}
            try:
                d["key_points"] = json.loads(d["key_points"])
            except:
                d["key_points"] = {}
            docs.append(d)

        # Filter by search string or tag in memory if specified
        if search:
            q = search.lower()
            docs = [
                d for d in docs
                if q in d["name"].lower()
                or q in d["original_ocr_text"].lower()
                or q in d["improved_text"].lower()
                or any(q in t.lower() for t in d["tags"])
            ]

        if tag:
            docs = [d for d in docs if tag.lower() in [t.lower() for t in d["tags"]]]

        return docs

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return None

        d = dict(row)
        d["is_favorite"] = bool(d["is_favorite"])
        try:
            d["tags"] = json.loads(d["tags"])
        except:
            d["tags"] = []
        try:
            d["summary"] = json.loads(d["summary"])
        except:
            d["summary"] = {}
        try:
            d["key_points"] = json.loads(d["key_points"])
        except:
            d["key_points"] = {}
        return d

    def create_document(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        doc_id = doc_data.get("id") or f"doc_{int(datetime.utcnow().timestamp() * 1000)}"
        user_id = doc_data.get("user_id")
        name = doc_data.get("name") or f"Document {doc_id[-6:]}"
        category = doc_data.get("category", "Other / Unknown")
        category_confidence = float(doc_data.get("category_confidence", 0.0))
        category_reason = doc_data.get("category_reason", "")
        original_ocr_text = doc_data.get("original_ocr_text", "")
        improved_text = doc_data.get("improved_text") or original_ocr_text
        is_favorite = 1 if doc_data.get("is_favorite") else 0
        tags = json.dumps(doc_data.get("tags", []))
        summary = json.dumps(doc_data.get("summary", {}))
        key_points = json.dumps(doc_data.get("key_points", {}))
        now = datetime.utcnow().isoformat()

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check existing
        cursor.execute("SELECT id, original_ocr_text FROM documents WHERE id = ?", (doc_id,))
        existing = cursor.fetchone()

        if existing:
            # Preserve original_ocr_text strictly
            cursor.execute("""
            UPDATE documents 
            SET name = ?, category = ?, category_confidence = ?, category_reason = ?,
                improved_text = ?, is_favorite = ?, tags = ?, summary = ?, key_points = ?, updated_at = ?
            WHERE id = ?
            """, (name, category, category_confidence, category_reason, improved_text, is_favorite, tags, summary, key_points, now, doc_id))
        else:
            cursor.execute("""
            INSERT INTO documents (
                id, user_id, name, category, category_confidence, category_reason,
                original_ocr_text, improved_text, is_favorite, tags, summary, key_points,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (doc_id, user_id, name, category, category_confidence, category_reason,
                  original_ocr_text, improved_text, is_favorite, tags, summary, key_points,
                  now, now))

        conn.commit()
        conn.close()

        return self.get_document(doc_id)

    def update_document(self, doc_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM documents WHERE id = ?", (doc_id,))
        if not cursor.fetchone():
            conn.close()
            return None

        clauses = ["updated_at = ?"]
        params = [datetime.utcnow().isoformat()]

        if "name" in updates:
            clauses.append("name = ?")
            params.append(updates["name"])
        if "improved_text" in updates:
            clauses.append("improved_text = ?")
            params.append(updates["improved_text"])
        if "category" in updates:
            clauses.append("category = ?")
            params.append(updates["category"])
        if "is_favorite" in updates:
            clauses.append("is_favorite = ?")
            params.append(1 if updates["is_favorite"] else 0)
        if "tags" in updates:
            clauses.append("tags = ?")
            params.append(json.dumps(updates["tags"]))
        if "summary" in updates:
            clauses.append("summary = ?")
            params.append(json.dumps(updates["summary"]))
        if "key_points" in updates:
            clauses.append("key_points = ?")
            params.append(json.dumps(updates["key_points"]))

        params.append(doc_id)
        sql = f"UPDATE documents SET {', '.join(clauses)} WHERE id = ?"

        cursor.execute(sql, params)
        conn.commit()
        conn.close()

        return self.get_document(doc_id)

    def delete_document(self, doc_id: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted
