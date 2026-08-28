const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true
    },
    products: [
      {
        type: String,
        required: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Helper method to format public wishlist JSON
wishlistSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    products: this.products || [],
    count: (this.products || []).length,
    updatedAt: this.updatedAt
  };
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
