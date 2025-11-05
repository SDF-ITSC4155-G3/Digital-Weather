from coordinate_converter import GRID_SIZE, coords_to_tile
import sqlite3

tile_dict = {}
density_list = ()
DB_PATH = "locations.db"

# When ran, initialize the tile dictionary with zero counts
for i in range(GRID_SIZE * GRID_SIZE):
    tile_dict[i] = 0

# Increment the count for a specific tile
# Param: tile_id (int) - the ID of the tile to increment
def increment_tile_count(tile_id):
    if tile_id in tile_dict:
        tile_dict[tile_id] += 1


# Return a list of tile counts
def get_tile_counts():
    return list(tile_dict.values())




# Method runs increment_tile_count for each entry in the database
def update_all_tile_counts():
    conn = sqlite3.connect("locations.db")
    cursor = conn.cursor()
    # Grab all sets of coordinates from the database
    cursor.execute("""
        SELECT latitude, longitude
        FROM UserLocation;
    """)
    results = cursor.fetchall()

    # Set tile counts to represent the database entries
    for latitude, longitude in results:
        increment_tile_count(coords_to_tile(latitude, longitude))

    conn.close()



# Sets all tiles' count to zero in the dictionary
def reset_tile_counts():
    for key in tile_dict:
        tile_dict[key] = 0


# This must be updated 
def send_tile_counts():
    reset_tile_counts()
    update_all_tile_counts()
    return get_tile_counts()










