# device_generator.py
# ------------------------------------------------------------
# Improved generator: Devices cluster realistically near all UNC Charlotte buildings
# and never exceed campus bounds.
# ------------------------------------------------------------

import sqlite3
import random
import math
import numpy as np
import os

# Use DB path relative to this script to avoid CWD issues
THIS_DIR = os.path.dirname(__file__)
DEFAULT_DB = os.path.join(THIS_DIR, "locations.db")

# --- Campus bounds (approximate for UNC Charlotte) ---
MIN_LATITUDE = 35.3030
MAX_LATITUDE = 35.3120
MIN_LONGITUDE = -80.7365
MAX_LONGITUDE = -80.7275

# --- Building clusters (approximate centers) ---
clusters = [
    {"name": "Atkins Library", "center": (35.30579, -80.73212), "radius": 0.00020, "weight": 0.12},                 
    {"name": "Popp Martin Student Union", "center": (35.30865, -80.73369), "radius": 0.00020, "weight": 0.10},  
    {"name": "Woodward Hall", "center": (35.30736, -80.73558), "radius": 0.00018, "weight": 0.08},
    {"name": "Barnhardt SAC", "center": (35.30635, -80.73443), "radius": 0.00020, "weight": 0.08},
    {"name": "Belk Gym", "center": (35.30539, -80.73561), "radius": 0.00018, "weight": 0.07},
    {"name": "Fretwell", "center": (35.30606, -80.72910), "radius": 0.00018, "weight": 0.07},
    {"name": "Kennedy", "center": (35.30597, -80.73093), "radius": 0.00015, "weight": 0.06},
    {"name": "McEniry", "center": (35.30717, -80.73020), "radius": 0.00015, "weight": 0.06},
    {"name": "Robinson Hall", "center": (35.30384, -80.72989), "radius": 0.00020, "weight": 0.05},
    {"name": "Belk Hall (Dorm)", "center": (35.31036, -80.73504), "radius": 0.00015, "weight": 0.05},
    {"name": "Wallis Hall", "center": (35.31131, -80.73381), "radius": 0.00015, "weight": 0.04},
    {"name": "Cameron Hall", "center": (35.30764, -80.73117), "radius": 0.00015, "weight": 0.05},
    {"name": "Smith Hall", "center": (35.30683, -80.73154), "radius": 0.00015, "weight": 0.04},
    {"name": "Denny Hall", "center": (35.30541, -80.72983), "radius": 0.00015, "weight": 0.04},
    {"name": "Garinger Hall", "center": (35.30499, -80.73021), "radius": 0.00015, "weight": 0.04},
    {"name": "Rowe Hall", "center": (35.30442, -80.73076), "radius": 0.00015, "weight": 0.03},
    {"name": "Storrs Hall", "center": (35.30460, -80.72914), "radius": 0.00015, "weight": 0.03},
    {"name": "Macy Hall", "center": (35.30577, -80.73025), "radius": 0.00014, "weight": 0.03},
    {"name": "Friday Hall", "center": (35.30629, -80.72998), "radius": 0.00014, "weight": 0.03},
    {"name": "King", "center": (35.30506, -80.73257), "radius": 0.00010, "weight": 0.02},
    {"name": "Reece", "center": (35.30464, -80.73257), "radius": 0.00010, "weight": 0.02},
    {"name": "Oak/Elm/Maple/Pine Dorms", "center": (35.30903, -80.73159), "radius": 0.00020, "weight": 0.05}
]

# --- clamp helper ---
def clamp(val, minv, maxv):
    return max(minv, min(val, maxv))

# --- Generate devices ---
def generate_clustered_devices(clusters, total_devices=500):
    """
    Generate devices clustered around the given `clusters` list.

    This function now guarantees at least one device per cluster when
    `total_devices >= len(clusters)`. We seed each cluster with 1 device
    (if possible) and then distribute the remaining devices according to
    the cluster weights using a multinomial distribution. This ensures
    every listed spot receives devices.
    """
    # Normalize weights
    weights = np.array([c["weight"] for c in clusters])
    weights = weights / weights.sum()

    n_clusters = len(clusters)

    # If we have at least as many devices as clusters, give each cluster
    # one device first so every cluster is represented, then distribute
    # the remaining devices according to weights.
    if total_devices >= n_clusters:
        seed = np.ones(n_clusters, dtype=int)  # 1 device per cluster
        remaining = total_devices - n_clusters
        if remaining > 0:
            extra = np.random.multinomial(remaining, weights)
        else:
            extra = np.zeros(n_clusters, dtype=int)
        cluster_counts = seed + extra
    else:
        # Not enough devices to give every cluster one. Distribute devices
        # by choosing clusters according to weights (multinomial with total_devices)
        cluster_counts = np.random.multinomial(total_devices, weights)

    # --- helper: expose cluster counts for debugging if needed ---
    # We return only the devices here for backward compatibility.
    # Call compute_cluster_counts() if you need the counts alone.

    devices = []

    for idx, cluster in enumerate(clusters):
        center_lat, center_lon = cluster["center"]
        radius = cluster["radius"]
        count = cluster_counts[idx]

        for _ in range(count):

            valid = False
            while not valid:
                # Gaussian cluster instead of circular
                delta_lat = random.gauss(0, radius / 2)
                delta_lon = random.gauss(0, radius / 2)

                new_lat = center_lat + delta_lat
                new_lon = center_lon + delta_lon

                # Clamp to map
                new_lat = clamp(new_lat, MIN_LATITUDE, MAX_LATITUDE)
                new_lon = clamp(new_lon, MIN_LONGITUDE, MAX_LONGITUDE)

                valid = True

            devices.append((new_lat, new_lon))

    return devices


def compute_cluster_counts(clusters, total_devices=500):
    """
    Compute and return the number of devices assigned to each cluster
    according to the current distribution logic (without generating coords).
    Guarantees at least 1 per cluster when total_devices >= len(clusters).
    """
    weights = np.array([c["weight"] for c in clusters])
    weights = weights / weights.sum()
    n_clusters = len(clusters)

    if total_devices >= n_clusters:
        seed = np.ones(n_clusters, dtype=int)
        remaining = total_devices - n_clusters
        extra = np.random.multinomial(remaining, weights) if remaining > 0 else np.zeros(n_clusters, dtype=int)
        return list((seed + extra).tolist())
    else:
        return list(np.random.multinomial(total_devices, weights).tolist())


# --- Insert into SQLite DB ---
def insert_devices_into_db(devices, db_path=DEFAULT_DB):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.executemany("INSERT INTO UserLocation (latitude, longitude) VALUES (?, ?)", devices)
    conn.commit()
    conn.close()
    print(f"[OK] Inserted {len(devices)} devices into {db_path}")

# --- Clear database ---
def clear_database(db_path=DEFAULT_DB):
    """
    Remove all rows from the UserLocation table.
    Uses an absolute path for clarity and prints counts before/after.
    """
    import os
    abs_path = os.path.abspath(db_path)
    print(f"Clearing DB at: {abs_path}")

    conn = sqlite3.connect(abs_path)
    cursor = conn.cursor()

    # Count rows before
    try:
        cursor.execute("SELECT COUNT(*) FROM UserLocation")
        before = cursor.fetchone()[0]
    except Exception:
        before = None

    cursor.execute("DELETE FROM UserLocation")  # clear the table
    conn.commit()

    # Count rows after
    try:
        cursor.execute("SELECT COUNT(*) FROM UserLocation")
        after = cursor.fetchone()[0]
    except Exception:
        after = None

    conn.close()
    print(f"[OK] Cleared DB. rows before={before}, rows after={after} (path={abs_path})")



# --- Main ---
if __name__ == "__main__":

    # clear_database()  # Clear existing data
    devices = generate_clustered_devices(clusters, total_devices=1000)
    insert_devices_into_db(devices)
