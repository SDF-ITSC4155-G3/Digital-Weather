from flask import Flask, request, jsonify
from heatmap_counter import get_tile_counts, reset_tile_counts, send_tile_counts

from extensions import db
from models import User, Pin, Review
from auth import auth_bp, token_required
from flask_cors import CORS
import os

app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy(app)
db.init_app(app)

app.register_blueprint(auth_bp)


# Hello World API route
@app.route("/hello-world")
def hello_world():
    # return {"hello_world": [0, 1, 3, 2, 5, 2, 4, 4, 0, 1, 
    #                         0, 0, 4, 4, 3, 2, 0, 0, 1, 0, 
    #                         0, 0, 1, 1, 1, 0, 0, 0, 1, 3, 
    #                         0, 0, 0, 3, 3, 2, 2, 1, 2, 0, 
    #                         0, 0, 0, 1, 2, 1, 2, 0, 0, 0, 
    #                         0, 2, 3, 1, 1, 2, 2, 3, 0, 0, 
    #                         0, 0, 1, 3, 1, 3, 2, 3, 5, 0, 
    #                         0, 1, 2, 0, 0, 3, 4, 5, 2, 0, 
    #                         0, 1, 1, 2, 2, 2, 3, 1, 1, 0, 
    #                         0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 
    #                        ]}

    return {"hello_world": send_tile_counts()}


@app.route("/reset-tile-counts", methods=["POST", "GET"])
def reset_counts():
    """Reset the in-memory tile counts to zeros and return the new state."""
    reset_tile_counts()
    return {"status": "ok", "hello_world": get_tile_counts()}


# ==================== PIN ENDPOINTS ====================

@app.route("/api/pins", methods=["GET"])
def get_pins():
    """Get all pins."""
    try:
        pins = Pin.query.all()
        return jsonify([pin.to_dict() for pin in pins]), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch pins: {str(e)}'}), 500


@app.route("/api/pins", methods=["POST"])
@token_required
def create_pin(current_user):
    """Create a new pin (requires authentication)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400

        latitude = data.get('latitude')
        longitude = data.get('longitude')
        title = data.get('title')
        description = data.get('description', '')

        if latitude is None or longitude is None or not title:
            return jsonify({'message': 'Missing required fields: latitude, longitude, title'}), 400

        new_pin = Pin(
            user_id=current_user.id,
            latitude=latitude,
            longitude=longitude,
            title=title,
            description=description
        )
        db.session.add(new_pin)
        db.session.commit()

        return jsonify({'message': 'Pin created successfully', 'pin': new_pin.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create pin: {str(e)}'}), 500


@app.route("/api/pins/<int:pin_id>", methods=["PUT"])
@token_required
def update_pin(current_user, pin_id):
    """Update a pin (only owner can update)."""
    try:
        pin = Pin.query.get(pin_id)
        if not pin:
            return jsonify({'message': 'Pin not found'}), 404

        if pin.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized to update this pin'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400

        if 'title' in data:
            if not data['title']:
                return jsonify({'message': 'Title cannot be empty'}), 400
            pin.title = data['title']

        if 'description' in data:
            pin.description = data['description']

        db.session.commit()

        return jsonify({'message': 'Pin updated successfully', 'pin': pin.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update pin: {str(e)}'}), 500


@app.route("/api/pins/<int:pin_id>", methods=["DELETE"])
@token_required
def delete_pin(current_user, pin_id):
    """Delete a pin (only owner can delete)."""
    try:
        pin = Pin.query.get(pin_id)
        if not pin:
            return jsonify({'message': 'Pin not found'}), 404

        if pin.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized to delete this pin'}), 403

        db.session.delete(pin)
        db.session.commit()

        return jsonify({'message': 'Pin deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete pin: {str(e)}'}), 500


# ==================== REVIEW ENDPOINTS ====================

@app.route("/api/pins/<int:pin_id>/reviews", methods=["GET"])
def get_reviews(pin_id):
    """Get all reviews for a specific pin."""
    try:
        pin = Pin.query.get(pin_id)
        if not pin:
            return jsonify({'message': 'Pin not found'}), 404

        reviews = Review.query.filter_by(pin_id=pin_id).all()
        return jsonify([review.to_dict() for review in reviews]), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch reviews: {str(e)}'}), 500


@app.route("/api/pins/<int:pin_id>/reviews", methods=["POST"])
@token_required
def create_review(current_user, pin_id):
    """Create a new review for a pin (requires authentication)."""
    try:
        pin = Pin.query.get(pin_id)
        if not pin:
            return jsonify({'message': 'Pin not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400

        rating = data.get('rating')
        comment = data.get('comment', '')

        if rating is None:
            return jsonify({'message': 'Missing required field: rating'}), 400

        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'message': 'Rating must be an integer between 1 and 5'}), 400

        new_review = Review(
            pin_id=pin_id,
            user_id=current_user.id,
            rating=rating,
            comment=comment
        )
        db.session.add(new_review)
        db.session.commit()

        return jsonify({'message': 'Review created successfully', 'review': new_review.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create review: {str(e)}'}), 500


@app.route("/api/reviews/<int:review_id>", methods=["PUT"])
@token_required
def update_review(current_user, review_id):
    """Update a review (only owner can update)."""
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({'message': 'Review not found'}), 404

        if review.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized to update this review'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No JSON data received'}), 400

        if 'rating' in data:
            rating = data['rating']
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return jsonify({'message': 'Rating must be an integer between 1 and 5'}), 400
            review.rating = rating

        if 'comment' in data:
            review.comment = data['comment']

        db.session.commit()

        return jsonify({'message': 'Review updated successfully', 'review': review.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update review: {str(e)}'}), 500


@app.route("/api/reviews/<int:review_id>", methods=["DELETE"])
@token_required
def delete_review(current_user, review_id):
    """Delete a review (only owner can delete)."""
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({'message': 'Review not found'}), 404

        if review.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized to delete this review'}), 403

        db.session.delete(review)
        db.session.commit()

        return jsonify({'message': 'Review deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete review: {str(e)}'}), 500


# Add simple CORS headers so the frontend (dev server or browser) can fetch safely
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        app.run(debug=True)
