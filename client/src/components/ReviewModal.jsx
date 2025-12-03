import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/auth.js';
import './ReviewModal.css';

function ReviewModal({ pin, onClose, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pin) {
      fetchReviews();
    }
  }, [pin]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/pins/${pin.id}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/pins/${pin.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ rating, comment })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      setRating(5);
      setComment('');
      fetchReviews();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete review');
      }

      fetchReviews();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!pin) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{pin.title}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="pin-details">
            <p><strong>Created by:</strong> {pin.username}</p>
            {pin.description && <p><strong>Description:</strong> {pin.description}</p>}
            <p><strong>Location:</strong> {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}</p>
          </div>

          <div className="reviews-section">
            <h3>Reviews ({reviews.length})</h3>

            <form className="review-form" onSubmit={handleSubmitReview}>
              <h4>Add Your Review</h4>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="rating">Rating:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Comment:</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this location..."
                  rows="4"
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div>
                        <strong>{review.username}</strong>
                        <div className="review-stars">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <div className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {review.comment && <p className="review-comment">{review.comment}</p>}
                    <button
                      className="delete-review-button"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
