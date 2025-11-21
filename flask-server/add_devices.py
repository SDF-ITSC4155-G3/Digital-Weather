import sqlite3
import os

THIS_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(THIS_DIR, "locations.db")

def add_location(latitude, longitude):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO UserLocation (latitude, longitude)
        VALUES (?, ?);
    """, (latitude, longitude))

    conn.commit()
    conn.close()
    return {"status": "ok", "latitude": latitude, "longitude": longitude}

def get_all_locations():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT latitude, longitude
        FROM UserLocation;
    """)
    results = cursor.fetchall()
    conn.close()
    return results


print(get_all_locations())






# add_location(35.3030, -80.7365)  BOTTOM-LEFT

