import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  podcast: {
    type: mongoose.Schema.ObjectId,
    ref: 'Podcast',
    required: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  notifications: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

// Prevent multiple subscriptions to the same podcast by the same user
subscriptionSchema.index({ user: 1, podcast: 1 }, { unique: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
