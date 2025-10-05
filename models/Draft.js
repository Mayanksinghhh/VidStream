import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft'
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
  }
}, {
  timestamps: true
});

// Indexes
draftSchema.index({ userId: 1, createdAt: -1 });
draftSchema.index({ status: 1 });
draftSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Draft || mongoose.model('Draft', draftSchema);
