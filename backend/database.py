import sqlite3

def get_db_connection():
    conn = sqlite3.connect("safar.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # USER PROFILE TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT UNIQUE,
        name TEXT,
        email TEXT,
        photo TEXT
    )
    """)

    # TRIPS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        destination TEXT,
        days INTEGER,
        people INTEGER,
        budget TEXT,
        travelType TEXT,
        plan TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
