import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    bio: { type: String, maxlength: 500 },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users who subscribed to this user
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users this user subscribed to
    watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }], // videos saved for later
    playlists: [{
      name: String,
      description: String,
      videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
      isPublic: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }],
    watchHistory: [{
      video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      watchedAt: { type: Date, default: Date.now },
      watchTime: { type: Number, default: 0 } // in seconds
    }],
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      autoplay: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true }
    },
    socialLinks: {
      youtube: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      tiktok: { type: String }
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add additional indexes
userSchema.index({ subscribers: 1 });
userSchema.index({ subscriptions: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
