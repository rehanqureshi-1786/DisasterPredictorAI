import sqlite3
import json
import os
from datetime import datetime

# Standardize path to be consistently in the backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "predictions.db"))

print(f"[DB] Using database at: {DB_NAME}")

def init_db():
    """Initialize the database and create the table if it doesn't exist."""
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recent_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                city TEXT NOT NULL,
                prediction TEXT NOT NULL,
                risk_score REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Migration: Add email to recent_predictions if it doesn't exist
        try:
            cursor.execute('ALTER TABLE recent_predictions ADD COLUMN email TEXT')
            print("[DB] Migrated recent_predictions: added email column")
        except sqlite3.OperationalError:
            pass # Column already exists
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Migration: Add full_name if it doesn't exist
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN full_name TEXT')
            print("[DB] Migrated users table: added full_name")
        except sqlite3.OperationalError:
            pass # Column already exists
        conn.commit()
        conn.close()
        print("[DB] Database initialized")
    except Exception as e:
        print(f"[DB] Init error: {e}")

def save_prediction(city, prediction, risk_score, email=None):
    """Save a new prediction to the database."""
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO recent_predictions (email, city, prediction, risk_score)
            VALUES (?, ?, ?, ?)
        ''', (email, city, prediction, float(risk_score)))
        conn.commit()
        conn.close()
        print(f"[DB] Saved prediction for {city} (User: {email})")
    except Exception as e:
        print(f"[DB] Save error: {e}")

def get_recent_predictions(limit=5, email=None):
    """Fetch recent predictions from the database, optionally filtered by user."""
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row  # Access columns by name
        cursor = conn.cursor()
        
        if email:
            cursor.execute('''
                SELECT city, prediction, risk_score, timestamp
                FROM recent_predictions
                WHERE email = ?
                ORDER BY timestamp DESC
                LIMIT ?
            ''', (email, limit))
        else:
            cursor.execute('''
                SELECT city, prediction, risk_score, timestamp
                FROM recent_predictions
                ORDER BY timestamp DESC
                LIMIT ?
            ''', (limit,))
            
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            results.append({
                "city": row["city"],
                "prediction": row["prediction"],
                "risk_score": row["risk_score"],
                "timestamp": row["timestamp"]
            })
        return results
    except Exception as e:
        print(f"[DB] Fetch error: {e}")
        return []

def create_user(email, password_hash, full_name=None):
    """Create a new user in the database."""
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (email, password_hash, full_name)
            VALUES (?, ?, ?)
        ''', (email, password_hash, full_name))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        print(f"[DB] User already exists: {email}")
        return False
    except Exception as e:
        print(f"[DB] Create user error: {e}")
        return False

def get_user_by_email(email):
    """Fetch a user by email."""
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        return dict(user) if user else None
    except Exception as e:
        print(f"[DB] Get user error: {e}")
        return None
