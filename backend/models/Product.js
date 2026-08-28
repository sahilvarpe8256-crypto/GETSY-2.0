const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop ID is required']
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be an integer'
      }
    },
    sizes: {
      type: [String],
      default: []
    },
    size: {
      type: String,
      trim: true,
      default: ''
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Helper method to format public product JSON (maps _id to id)
productSchema.methods.toPublicJSON = function () {
  const rawSizes = Array.isArray(this.sizes) && this.sizes.length > 0
    ? this.sizes
    : (this.size ? this.size.split(',').map((s) => s.trim()).filter(Boolean) : []);

  return {
    id: this._id.toString(),
    shopId: this.shopId ? (this.shopId._id ? this.shopId._id.toString() : this.shopId.toString()) : undefined,
    name: this.name,
    category: this.category,
    description: this.description,
    price: this.price,
    image: this.image,
    stock: this.stock !== undefined ? this.stock : 0,
    quantity: this.stock !== undefined ? this.stock : 0,
    sizes: rawSizes,
    size: this.size || (rawSizes.length > 0 ? rawSizes.join(', ') : ''),
    availableSizes: rawSizes,
    available: this.available !== undefined ? this.available : (this.stock > 0),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
