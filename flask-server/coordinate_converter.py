

#Coordinate bounds for UNC Charlotte map in UNCCMap.jpg
MIN_LATITUDE = 35.3030
MAX_LATITUDE = 35.3120

MIN_LONGITUDE = -80.7365
MAX_LONGITUDE = -80.7275

GRID_SIZE = 10  # Number of tiles along one axis (10x10 grid)

#Convert coordinates to specific tile in heatmap
def coords_to_tile(latitude, longitude):
    if not (MIN_LATITUDE <= latitude <= MAX_LATITUDE) or not (MIN_LONGITUDE <= longitude <= MAX_LONGITUDE):
        return None  # Coordinates out of bounds

    lat_range = MAX_LATITUDE - MIN_LATITUDE
    long_range = MAX_LONGITUDE - MIN_LONGITUDE

    # Normalize coordinates to [0,1] range
    lat_norm = (latitude - MIN_LATITUDE) / lat_range
    long_norm = (longitude - MIN_LONGITUDE) / long_range

    # Convert to grid indices
    lat_index = int((1 - lat_norm) * GRID_SIZE)   # flip vertically so north is top
    long_index = int(long_norm * GRID_SIZE)

    # Ensure indices are within grid bounds
    lat_index = min(max(lat_index, 0), GRID_SIZE - 1)
    long_index = min(max(long_index, 0), GRID_SIZE - 1)

    # Convert 2D grid indices to 1D tile ID
    # Ex: (0,1) in 10x10 grid -> tile ID 1, (2,3) -> tile ID 23
    # Top left is (0,0) or tle_id 0, bottom right is (9,9) or tile_id 99

    tile_id = lat_index * GRID_SIZE + long_index
    return tile_id