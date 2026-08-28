import { useState, useEffect } from 'react';
import {
  Star,
  ThumbsUp,
  CheckCircle,
  MessageSquare,
  Edit2,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} from '../../services/reviewService';
import './ProductReviews.css';

export default function ProductReviews({
  productId = null,
  shopId = null,
  title = 'Customer Reviews',
  entityName = 'item'
}) {
  const { user, token, openAuthModal } = useAuth();

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState(4.8);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load reviews from backend API
  const fetchReviews = async () => {
    if (!productId && !shopId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getReviews({ shopId, productId });
      setReviewsList(data.reviews || []);
      setReviewsCount(data.reviewsCount || 0);
      setAvgRating(data.averageRating || 4.8);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, shopId]);

  const handleOpenForm = (existingRev = null) => {
    if (!user) {
      if (openAuthModal) openAuthModal('login');
      return;
    }

    if (existingRev) {
      setEditingReviewId(existingRev.id || existingRev._id);
      setRating(existingRev.rating || 5);
      setComment(existingRev.comment || '');
    } else {
      setEditingReviewId(null);
      setRating(5);
      setComment('');
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReviewId(null);
    setComment('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFormError('Please write your review comment before submitting.');
      return;
    }
    if (comment.trim().length < 2) {
      setFormError('Review must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingReviewId) {
        // Update existing review
        const res = await updateReview(
          editingReviewId,
          { rating: Number(rating), comment: comment.trim() },
          token
        );
        if (res.success) {
          setSuccessMsg('Your review has been updated!');
          setTimeout(() => setSuccessMsg(''), 3500);
          handleCloseForm();
          await fetchReviews();
        } else {
          setFormError(res.error || 'Failed to update review.');
        }
      } else {
        // Create new review
        const res = await createReview(
          {
            shopId,
            productId,
            rating: Number(rating),
            comment: comment.trim()
          },
          token
        );
        if (res.success) {
          setSuccessMsg('Thank you! Your verified review is now live.');
          setTimeout(() => setSuccessMsg(''), 3500);
          handleCloseForm();
          await fetchReviews();
        } else {
          setFormError(res.error || 'Failed to submit review.');
        }
      }
    } catch {
      setFormError('An unexpected error occurred while saving your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (revId) => {
    if (!window.confirm('Are you sure you want to remove this review?')) return;
    try {
      const res = await deleteReview(revId, token);
      if (res.success) {
        setSuccessMsg('Review removed.');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchReviews();
      }
    } catch {
      // Non-fatal
    }
  };

  const currentUserId = user?.id || user?._id;

  return (
    <div className="product-reviews-section" id="product-reviews">
      {/* Header and Summary */}
      <div className="product-reviews-header">
        <div>
          <h2 className="product-reviews-title">{title}</h2>
          <div className="product-reviews-summary">
            <div className="product-reviews-score">
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
              <span className="product-reviews-avg">{avgRating}</span>
              <span className="product-reviews-max">/ 5</span>
            </div>
            <span className="product-reviews-count">
              Based on {reviewsCount || reviewsList.length} verified {reviewsCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {/* Write Review Action */}
        <button
          type="button"
          className="write-review-toggle-btn"
          onClick={() => handleOpenForm()}
          id="write-review-btn"
        >
          <MessageSquare size={16} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="review-success-toast">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Review Submission / Edit Form */}
      {isFormOpen && (
        <form className="review-form-card" onSubmit={handleSubmit} id="review-submission-form">
          <div className="review-form-header">
            <h4 className="review-form-title">
              {editingReviewId ? 'Edit Your Review' : `Rate & Review this ${entityName}`}
            </h4>
            <button
              type="button"
              className="review-form-close-btn"
              onClick={handleCloseForm}
              aria-label="Cancel review"
            >
              <X size={16} />
            </button>
          </div>

          {/* Star Rating Picker */}
          <div className="review-star-picker-wrap">
            <label className="review-field-label">YOUR RATING</label>
            <div className="review-star-picker">
              {[1, 2, 3, 4, 5].map((starNum) => (
                <button
                  key={starNum}
                  type="button"
                  className="star-pick-btn"
                  onMouseEnter={() => setHoverRating(starNum)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(starNum)}
                  aria-label={`${starNum} Stars`}
                  id={`rating-star-${starNum}`}
                >
                  <Star
                    size={26}
                    fill={(hoverRating || rating) >= starNum ? '#f59e0b' : 'transparent'}
                    color={(hoverRating || rating) >= starNum ? '#f59e0b' : '#64748b'}
                  />
                </button>
              ))}
              <span className="star-rating-label">
                {(hoverRating || rating) === 5 && 'Outstanding (5/5)'}
                {(hoverRating || rating) === 4 && 'Very Good (4/5)'}
                {(hoverRating || rating) === 3 && 'Average (3/5)'}
                {(hoverRating || rating) === 2 && 'Below Average (2/5)'}
                {(hoverRating || rating) === 1 && 'Poor (1/5)'}
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="review-comment-field">
            <label className="review-field-label" htmlFor="review-comment-input">
              YOUR VERIFIED FEEDBACK
            </label>
            <textarea
              id="review-comment-input"
              className="review-textarea"
              rows={4}
              placeholder="Share your genuine experience with this store/product, quality, fit, or customer service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
            <div className="review-char-count">{comment.length} / 1000 characters</div>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="review-form-error">
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="review-form-actions">
            <button
              type="button"
              className="review-cancel-btn"
              onClick={handleCloseForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-submit-btn"
              disabled={submitting}
              id="submit-review-btn"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin-anim" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{editingReviewId ? 'Update Review' : 'Submit Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="product-reviews-list">
        {loading ? (
          <div className="reviews-loading-box">
            <Loader2 size={24} className="spin-anim" color="var(--primary)" />
            <p>Loading verified customer reviews...</p>
          </div>
        ) : reviewsList.length > 0 ? (
          reviewsList.map((rev) => {
            const isAuthor =
              currentUserId &&
              (rev.userId === currentUserId ||
                (typeof rev.userId === 'object' && rev.userId?._id === currentUserId));

            return (
              <div key={rev.id || rev._id} className="review-card" id={`review-card-${rev.id || rev._id}`}>
                <div className="review-card-top">
                  <div className="review-card-user">
                    <div className="review-avatar">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="review-user-name">
                        <span>{rev.userName || 'Verified Buyer'}</span>
                        <span className="review-verified-badge" title="Verified Local Buyer">
                          <CheckCircle size={12} />
                          <span>Verified Buyer</span>
                        </span>
                      </div>
                      <span className="review-date">{rev.date || 'Recently'}</span>
                    </div>
                  </div>

                  <div className="review-top-right">
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? '#f59e0b' : '#334155'}
                          color={i < rev.rating ? '#f59e0b' : '#334155'}
                        />
                      ))}
                    </div>

                    {isAuthor && (
                      <div className="review-author-actions">
                        <button
                          type="button"
                          className="review-action-icon-btn"
                          title="Edit your review"
                          onClick={() => handleOpenForm(rev)}
                          aria-label="Edit review"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="review-action-icon-btn review-action-delete"
                          title="Delete your review"
                          onClick={() => handleDelete(rev.id || rev._id)}
                          aria-label="Delete review"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="review-comment">{rev.comment}</p>

                <div className="review-card-footer">
                  <button type="button" className="review-helpful-btn">
                    <ThumbsUp size={13} />
                    <span>Helpful</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-reviews-box">
            <p>No customer reviews yet. Be the first to share your verified review!</p>
            <button
              type="button"
              className="be-first-review-btn"
              onClick={() => handleOpenForm()}
            >
              Write First Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
