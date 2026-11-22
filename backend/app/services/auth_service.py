"""
User Authentication Service.
Handles signup, login, password hashing, and user profile management via SQLite.
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from app.services.database import get_db_connection, hash_password, verify_password


class AuthService:
    @staticmethod
    def signup(name: str, email: str, password: str) -> Dict[str, Any]:
        email = email.strip().lower()
        if not name or not email or not password:
            raise ValueError("Name, email, and password are required.")
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters.")

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            raise ValueError("An account with this email already exists.")

        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        hashed, salt = hash_password(password)
        now = datetime.utcnow().isoformat()

        cursor.execute(
            "INSERT INTO users (id, name, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, name.strip(), email, hashed, salt, now)
        )
        conn.commit()
        conn.close()

        return {
            "id": user_id,
            "name": name.strip(),
            "email": email,
            "created_at": now
        }

    @staticmethod
    def login(email: str, password: str) -> Dict[str, Any]:
        email = email.strip().lower()
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, name, email, password_hash, password_salt, created_at FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise ValueError("Invalid email or password.")

        if not verify_password(password, row["password_hash"], row["password_salt"]):
            raise ValueError("Invalid email or password.")

        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "created_at": row["created_at"]
        }
