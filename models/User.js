import mongoose from 'mongoose';
// const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, select: false },

    username: { type: String, required: true, unique: true, trim: true },

    newMessagePopup: { type: Boolean, default: true },

    unreadMessage: { type: Boolean, default: false },

    unreadNotification: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// module.exports = mongoose.model('User', UserSchema);
const User = mongoose.model('User', UserSchema);
export default User;
