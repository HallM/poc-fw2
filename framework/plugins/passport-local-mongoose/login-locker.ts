'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required."]
  },

  failedCount: {
    type: Number,
    default: 0
  },

  lockedUntil: {
    type: Date
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  timestamps: true
});

export default mongoose.model('login-locker', Schema);
