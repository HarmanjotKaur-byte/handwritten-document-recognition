"""
SQLite Database Initializer and Connection Manager.
Creates user and document tables with schema migrations.
"""
import sqlite3
import os
import hashlib
import binascii
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DB_PATH = DATA_DIR / "app_database.sqlite"


def get_db_connection():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = binascii.hexlify(os.urandom(16)).decode()
    hashed = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return hashed, salt


def verify_password(password: str, hashed: str, salt: str) -> bool:
    check_hash, _ = hash_password(password, salt)
    return check_hash == hashed


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # 2. Documents Table (supports user ownership)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        category_confidence REAL DEFAULT 0.0,
        category_reason TEXT,
        original_ocr_text TEXT NOT NULL,
        improved_text TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]',
        summary TEXT DEFAULT '{}',
        key_points TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()


init_db()
