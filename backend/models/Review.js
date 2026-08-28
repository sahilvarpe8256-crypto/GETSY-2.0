const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      default: null
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5'
      }
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [2, 'Comment must be at least 2 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    userName: {
      type: String,
      trim: true,
      default: 'Verified Customer'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure 1 review per user per target entity
reviewSchema.index(
  { userId: 1, shopId: 1, productId: 1 },
  { unique: true }
);

// Index for performant querying of reviews by target
reviewSchema.index({ shopId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, createdAt: -1 });

// Helper to format safe public review JSON
reviewSchema.methods.toPublicJSON = function () {
  let displayName = this.userName || 'Verified Buyer';
  if (this.userId && typeof this.userId === 'object' && this.userId.name) {
    displayName = this.userId.name;
  }

  return {
    id: this._id.toString(),
    userId: this.userId && typeof this.userId === 'object' ? this.userId._id.toString() : (this.userId ? this.userId.toString() : undefined),
    userName: displayName,
    shopId: this.shopId ? (typeof this.shopId === 'object' ? this.shopId._id.toString() : this.shopId.toString()) : null,
    productId: this.productId ? (typeof this.productId === 'object' ? this.productId._id.toString() : this.productId.toString()) : null,
    rating: this.rating,
    comment: this.comment,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    date: this.createdAt ? new Date(this.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'
  };
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
