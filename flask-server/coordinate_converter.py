


'''
This file is not complete and logic is broken
'''







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

    #Top-left will be (0,0), bottom-right will be (9,9)
    lat_index = GRID_SIZE - int((latitude - MIN_LATITUDE) / lat_range * GRID_SIZE)
    long_index = GRID_SIZE - int((longitude - MIN_LONGITUDE) / long_range * GRID_SIZE)

    # Ensure indices are within grid bounds
    lat_index = min(max(lat_index, 0), GRID_SIZE - 1)
    long_index = min(max(long_index, 0), GRID_SIZE - 1)

    tile_id = lat_index * GRID_SIZE + long_index
    return tile_id