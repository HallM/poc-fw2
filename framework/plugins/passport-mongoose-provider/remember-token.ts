'use strict';

import mongoose from 'mongoose';
const Types = mongoose.Schema.Types;

const Schema = mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Token is required.']
  },

  user: {
    type: Types.ObjectId,
    ref: 'user',
    required: [true, 'User is required.']
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

export default mongoose.model('remember-token', Schema);
