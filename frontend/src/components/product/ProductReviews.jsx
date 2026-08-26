import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import './ProductReviews.css';

export default function ProductReviews({ reviews = [], rating = 4.8, reviewsCount = 0 }) {
  return (
    <div className="product-reviews-section" id="product-reviews">
      <div className="product-reviews-header">
        <h2 className="product-reviews-title">Customer Reviews</h2>
        <div className="product-reviews-summary">
          <div className="product-reviews-score">
            <Star size={20} fill="#f59e0b" color="#f59e0b" />
            <span className="product-reviews-avg">{rating}</span>
            <span className="product-reviews-max">/ 5</span>
          </div>
          <span className="product-reviews-count">Based on {reviewsCount || reviews.length} verified reviews</span>
        </div>
      </div>

      <div className="product-reviews-list">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="review-card">
              <div className="review-card-top">
                <div className="review-card-user">
                  <div className="review-avatar">
                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="review-user-name">
                      <span>{rev.userName}</span>
                      <span className="review-verified-badge" title="Verified Local Buyer">
                        <CheckCircle size={12} />
                        <span>Verified Buyer</span>
                      </span>
                    </div>
                    <span className="review-date">{rev.date}</span>
                  </div>
                </div>

                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < rev.rating ? '#f59e0b' : '#e5e7eb'}
                      color={i < rev.rating ? '#f59e0b' : '#e5e7eb'}
                    />
                  ))}
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
          ))
        ) : (
          <div className="no-reviews-box">
            <p>No customer reviews yet. Be the first to visit the store and share your review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
