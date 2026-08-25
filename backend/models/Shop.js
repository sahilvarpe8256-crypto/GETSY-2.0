const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required']
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true
    },
    shopType: {
      type: String,
      required: [true, 'Shop type is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    area: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Location coordinates [longitude, latitude] are required']
      }
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for MongoDB geospatial querying
shopSchema.index({ location: '2dsphere' });

// Helper method to format public shop JSON (maps _id to id)
shopSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    ownerId: this.ownerId ? (this.ownerId._id ? this.ownerId._id.toString() : this.ownerId.toString()) : undefined,
    shopName: this.shopName,
    shopType: this.shopType,
    description: this.description,
    phone: this.phone,
    image: this.image,
    address: this.address,
    area: this.area,
    location: {
      type: this.location ? this.location.type : 'Point',
      coordinates: this.location ? this.location.coordinates : []
    },
    verified: this.verified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
