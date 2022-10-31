import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  // maybe better using userID
  notifications: [
    {
      type: {
        type: String,
        enum: [
          'newAdminMsg',
          'newChatMsg',
          'newLike',
          'newComment',
          'newFollower',
        ],
      },
      from: { type: Schema.Types.ObjectId, ref: 'User' },
      post: { type: Schema.Types.ObjectId, ref: 'Post' },
      commentId: { type: String },
      text: { type: String },
      isRead: { type: Boolean, default: false },
      date: { type: Date, default: Date.now },
    },
  ],
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
