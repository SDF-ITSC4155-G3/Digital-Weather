# device_generator.py
# ------------------------------------------------------------
# Generates device locations clustered near UNC Charlotte buildings
# and inserts them into a SQLite database for use in a heatmap.
# ------------------------------------------------------------

import sqlite3
import random
import math
import numpy as np


# --- Campus bounds (approximate for UNC Charlotte) ---
MIN_LATITUDE = 35.3030
MAX_LATITUDE = 35.3120
MIN_LONGITUDE = -80.7365
MAX_LONGITUDE = -80.7275

# --- Building clusters (approximate centers) ---
clusters = [
    {"name": "Atkins Library", "center": (35.3079, -80.7335), "radius": 0.00020, "weight": 0.12},
    {"name": "Popp Martin Student Union", "center": (35.3090, -80.7352), "radius": 0.00020, "weight": 0.10},
    {"name": "Woodward Hall", "center": (35.3086, -80.7350), "radius": 0.00018, "weight": 0.08},
    {"name": "Barnhardt Student Activity Center", "center": (35.3080, -80.7355), "radius": 0.00020, "weight": 0.08},
    {"name": "Belk Gymnasium", "center": (35.3072, -80.7360), "radius": 0.00018, "weight": 0.07},
    {"name": "Fretwell Hall", "center": (35.3087, -80.7318), "radius": 0.00018, "weight": 0.07},
    {"name": "Kennedy Hall", "center": (35.3084, -80.7328), "radius": 0.00015, "weight": 0.06},
    {"name": "McEniry Hall", "center": (35.3084, -80.7323), "radius": 0.00015, "weight": 0.06},
    {"name": "Robinson Hall", "center": (35.3057, -80.7295), "radius": 0.00020, "weight": 0.05},
    {"name": "Belk Hall", "center": (35.3113, -80.7360), "radius": 0.00015, "weight": 0.05},
    {"name": "Wallis Hall", "center": (35.3115, -80.7350), "radius": 0.00015, "weight": 0.04},
    {"name": "Cameron Hall", "center": (35.3088, -80.7330), "radius": 0.00015, "weight": 0.05},
    {"name": "Smith Hall", "center": (35.3085, -80.7332), "radius": 0.00015, "weight": 0.04},
    {"name": "Denny Hall", "center": (35.3082, -80.7325), "radius": 0.00015, "weight": 0.04},
    {"name": "Garinger Hall", "center": (35.3081, -80.7320), "radius": 0.00015, "weight": 0.04},
    {"name": "Rowe Hall", "center": (35.3080, -80.7312), "radius": 0.00015, "weight": 0.03},
    {"name": "Storrs Hall", "center": (35.3079, -80.7308), "radius": 0.00015, "weight": 0.03},
    {"name": "Macy Hall", "center": (35.3083, -80.7324), "radius": 0.00014, "weight": 0.03},
    {"name": "Friday Hall", "center": (35.3084, -80.7321), "radius": 0.00014, "weight": 0.03},
    {"name": "King & Reese (res)", "center": (35.3081, -80.7338), "radius": 0.00013, "weight": 0.02},
    {"name": "Oak / Elm / Maple / Pine (Dorms)", "center": (35.3089, -80.7320), "radius": 0.00020, "weight": 0.05}
]

# --- Generate clustered device coordinates ---
def generate_clustered_devices(clusters, total_devices=500):
    weights = np.array([c["weight"] for c in clusters])
    weights /= weights.sum()  # Normalize to 1

    devices = []
    for _ in range(total_devices):
        cluster = np.random.choice(clusters, p=weights)
        lat, lon = cluster["center"]
        # Generate a random point within a circle around the cluster center
        r = cluster["radius"] * math.sqrt(random.random())
        theta = random.random() * 2 * math.pi
        new_lat = lat + r * math.cos(theta)
        new_lon = lon + r * math.sin(theta)

        # Clamp to campus bounds
        if not (MIN_LATITUDE <= new_lat <= MAX_LATITUDE and MIN_LONGITUDE <= new_lon <= MAX_LONGITUDE):
            continue  # Skip if outside map

        devices.append((new_lat, new_lon))
    return devices

# --- Insert into SQLite database ---
def insert_devices_into_db(devices, db_path="locations.db"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.executemany("INSERT INTO UserLocation (latitude, longitude) VALUES (?, ?);", devices)
    conn.commit()
    conn.close()
    print(f"Inserted {len(devices)} devices into {db_path}")


# --- Main execution ---
if __name__ == "__main__":
    total_devices = 1000  # adjust as needed
    devices = generate_clustered_devices(clusters, total_devices)
    insert_devices_into_db(devices)
