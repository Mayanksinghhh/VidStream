import mongoose from 'mongoose';

const scheduledVideoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  categories: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  scheduledFor: {
    type: Date,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'failed'],
    default: 'scheduled'
  },
  videoFile: {
    type: String // Cloudinary URL if video is uploaded
  },
  thumbnail: {
    type: String // Cloudinary URL if thumbnail is uploaded
  },
  metadata: {
    duration: Number,
    size: Number,
    format: String
  },
  publishedAt: {
    type: Date
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
scheduledVideoSchema.index({ userId: 1, scheduledFor: 1 });
scheduledVideoSchema.index({ status: 1 });
scheduledVideoSchema.index({ scheduledFor: 1 });

export default mongoose.models.ScheduledVideo || mongoose.model('ScheduledVideo', scheduledVideoSchema);
