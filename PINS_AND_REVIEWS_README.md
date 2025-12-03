# Pins and Reviews Feature

This document explains how to use the pins and reviews functionality on the Digital Weather Map.

## Overview

Users can now:

- Place pins on specific locations on the map
- Add titles and descriptions to their pins
- Write reviews for any pin on the map
- Rate locations with a 1-5 star system
- View all reviews for a location
- Delete their own pins and reviews

## How to Use

### Placing a Pin

1. **Login** to your account (required for creating pins)
2. **Click** anywhere on the map where you want to place a pin
3. A form will appear asking for:
   - **Title** (required): A short name for the location
   - **Description** (optional): Additional details about the location
4. Click **"Create Pin"** to save the pin
5. The pin will appear on the map as a 📍 emoji

### Viewing Pin Details

1. **Click** on any pin marker (📍) on the map
2. A modal will open showing:
   - Pin title and description
   - Creator's username
   - Location coordinates
   - Number of reviews
   - All reviews for that location

### Writing a Review

1. **Click** on a pin to open its details
2. In the review section, you can:
   - **Select a rating** by clicking the stars (1-5 stars)
   - **Write a comment** (optional)
3. Click **"Submit Review"** to post your review
4. Your review will appear in the reviews list

### Deleting Content

- **Delete a Pin**: Click on your pin, then use the delete option (only available for pins you created)
- **Delete a Review**: In the reviews list, click the "Delete" button next to your review (only available for reviews you wrote)

## Technical Details

### Database Models

**Pin Model:**

- `id`: Unique identifier
- `user_id`: Foreign key to User
- `latitude`: Vertical position on map (0-100%)
- `longitude`: Horizontal position on map (0-100%)
- `title`: Pin title (max 200 characters)
- `description`: Optional description
- `created_at`: Timestamp

**Review Model:**

- `id`: Unique identifier
- `pin_id`: Foreign key to Pin
- `user_id`: Foreign key to User
- `rating`: Integer from 1 to 5
- `comment`: Optional text
- `created_at`: Timestamp
- `updated_at`: Timestamp (auto-updates)

### API Endpoints

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

### Setup Instructions

1. **Run the database migration** to create the new tables:

   ```bash
   cd flask-server
   python migrate_db.py
   ```

2. **Start the Flask server** (if not already running):

   ```bash
   python server.py
   ```

3. **Start the React client** (if not already running):

   ```bash
   cd client
   npm start
   ```

4. **Login or Register** an account to start creating pins

## Features

### Pin Features

- ✅ Create pins at any location on the map
- ✅ Add custom titles and descriptions
- ✅ View creator information
- ✅ Delete your own pins
- ✅ Automatic review cascade (deleting a pin deletes all its reviews)

### Review Features

- ✅ 5-star rating system
- ✅ Optional text comments
- ✅ View all reviews for a location
- ✅ See review author and timestamp
- ✅ Delete your own reviews
- ✅ Track review counts per pin

### UI Features

- ✅ Interactive map with click-to-place functionality
- ✅ Visual pin markers with hover effects
- ✅ Modal dialogs for creating pins and viewing reviews
- ✅ Form validation
- ✅ Responsive design
- ✅ Error handling and user feedback

## Security

- Pin and review creation require authentication
- Users can only delete their own content
- JWT tokens are used for secure authentication
- Server-side validation for all inputs
- SQL injection protection through SQLAlchemy ORM

## Future Enhancements

Potential features for future development:

- Edit existing pins and reviews
- Filter pins by rating or date
- Search functionality
- Photo uploads for pins
- Pin categories/tags
- Average rating display
- User profiles with their pins/reviews
- Map clustering for dense areas
