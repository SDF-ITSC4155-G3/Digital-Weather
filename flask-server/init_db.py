import sqlite3

# Connect to (or create) the database
conn = sqlite3.connect("locations.db")
cursor = conn.cursor()

# Create a table for user locations
cursor.execute("""
CREATE TABLE IF NOT EXISTS UserLocation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
);
""")

cursor.execute("""  
CREATE TABLE IF NOT EXISTS TileCount (
    tile_id INTEGER PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0
);
""")

conn.commit()
conn.close()

print("Database and tables created successfully!")