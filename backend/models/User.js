const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      default: 'customer'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare candidate password with stored hash
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Helper method to format public user JSON (removes password fields, maps _id to id)
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
