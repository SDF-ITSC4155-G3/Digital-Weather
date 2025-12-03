# Pins and Reviews API Reference

This document describes the API endpoints for managing pins and reviews on the Digital Weather Map.

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Pin Endpoints

### GET /api/pins

Get all pins on the map.

**Authentication:** Not required

**Response:**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "username": "john_doe",
    "latitude": 35.3074,
    "longitude": -80.7353,
    "title": "Beautiful spot",
    "description": "Great view of campus",
    "created_at": "2025-12-02T10:30:00",
    "review_count": 3
  }
]
```

### POST /api/pins

Create a new pin on the map.

**Authentication:** Required

**Request Body:**

```json
{
  "latitude": 35.3074,
  "longitude": -80.7353,
  "title": "Beautiful spot",
  "description": "Great view of campus (optional)"
}
```

**Response:**

```json
{
  "message": "Pin created successfully",
  "pin": {
    "id": 1,
    "user_id": 1,
    "username": "john_doe",
    "latitude": 35.3074,
    "longitude": -80.7353,
    "title": "Beautiful spot",
    "description": "Great view of campus",
    "created_at": "2025-12-02T10:30:00",
    "review_count": 0
  }
}
```

### PUT /api/pins/<pin_id>

Update an existing pin. Only the pin owner can update their pins.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "Updated title",
  "description": "Updated description (optional)"
}
```

**Response:**

```json
{
  "message": "Pin updated successfully",
  "pin": {
    "id": 1,
    "user_id": 1,
    "username": "john_doe",
    "latitude": 35.3074,
    "longitude": -80.7353,
    "title": "Updated title",
    "description": "Updated description",
    "created_at": "2025-12-02T10:30:00",
    "review_count": 0
  }
}
```

### DELETE /api/pins/<pin_id>

Delete a pin. Only the pin owner can delete their own pins.

**Authentication:** Required

**Response:**

```json
{
  "message": "Pin deleted successfully"
}
```

## Review Endpoints

### GET /api/pins/<pin_id>/reviews

Get all reviews for a specific pin.

**Authentication:** Not required

**Response:**

```json
[
  {
    "id": 1,
    "pin_id": 1,
    "user_id": 2,
    "username": "jane_smith",
    "rating": 5,
    "comment": "Amazing location!",
    "created_at": "2025-12-02T11:00:00",
    "updated_at": "2025-12-02T11:00:00"
  }
]
```

### POST /api/pins/<pin_id>/reviews

Create a new review for a pin.

**Authentication:** Required

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Amazing location! (optional)"
}
```

**Note:** Rating must be an integer between 1 and 5.

**Response:**

```json
{
  "message": "Review created successfully",
  "review": {
    "id": 1,
    "pin_id": 1,
    "user_id": 2,
    "username": "jane_smith",
    "rating": 5,
    "comment": "Amazing location!",
    "created_at": "2025-12-02T11:00:00",
    "updated_at": "2025-12-02T11:00:00"
  }
}
```

### PUT /api/reviews/<review_id>

Update a review. Only the review owner can update their own reviews.

**Authentication:** Required

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Pretty good location"
}
```

**Note:** You can update either rating, comment, or both.

**Response:**

```json
{
  "message": "Review updated successfully",
  "review": {
    "id": 1,
    "pin_id": 1,
    "user_id": 2,
    "username": "jane_smith",
    "rating": 4,
    "comment": "Pretty good location",
    "created_at": "2025-12-02T11:00:00",
    "updated_at": "2025-12-02T11:30:00"
  }
}
```

### DELETE /api/reviews/<review_id>

Delete a review. Only the review owner can delete their own reviews.

**Authentication:** Required

**Response:**

```json
{
  "message": "Review deleted successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (missing or invalid data)
- `401` - Unauthorized (authentication required or invalid token)
- `403` - Forbidden (not authorized to perform this action)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
