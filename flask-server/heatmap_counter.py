from coordinate_converter import GRID_SIZE, coords_to_tile
import sqlite3

tile_dict = {}
DB_PATH = "locations.db"

for i in range(GRID_SIZE * GRID_SIZE):
    tile_dict[i] = 0

def increment_tile_count(tile_id):
    if tile_id in tile_dict:
        tile_dict[tile_id] += 1



def get_tile_counts():
    return list(tile_dict.values())




# Method should run increment_tile_count for each entry in the database
def update_all_tile_counts():
    conn = sqlite3.connect("locations.db")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT latitude, longitude
        FROM UserLocation;
    """)
    results = cursor.fetchall()

    for latitude, longitude in results:
        increment_tile_count(coords_to_tile(latitude, longitude))

    conn.close()


def reset_tile_counts():
    for key in tile_dict:
        tile_dict[key] = 0

def send_tile_counts():
    reset_tile_counts()
    update_all_tile_counts()
    return get_tile_counts()










