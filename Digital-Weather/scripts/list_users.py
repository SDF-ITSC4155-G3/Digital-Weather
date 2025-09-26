#!/usr/bin/env python3
"""
Simple helper to list users from the project's SQLite DB.

Usage (PowerShell):
  python .\scripts\list_users.py

This script opens `src-tauri/users.db` in the repository root and prints the
id and username for each user.
"""
from __future__ import annotations
import sqlite3
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "src-tauri" / "users.db"


def main() -> None:
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, username FROM users ORDER BY id ASC;")
    except sqlite3.Error as e:
        print("SQL error:", e)
        return

    rows = cur.fetchall()
    if not rows:
        print("No users found in the database.")
        return

    print(f"Found {len(rows)} user(s):")
    for r in rows:
        print(f"  id={r[0]}  username={r[1]}")


if __name__ == '__main__':
    main()
