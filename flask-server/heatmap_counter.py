from coordinate_converter import GRID_SIZE

tile_dict = {}

for i in range(GRID_SIZE * GRID_SIZE):
    tile_dict[i] = 0

def increment_tile_count(tile_id):
    if tile_id in tile_dict:
        tile_dict[tile_id] += 1

def get_tile_counts():
    return tile_dict

def reset_tile_counts():
    for key in tile_dict:
        tile_dict[key] = 0

