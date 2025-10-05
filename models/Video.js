import mongoose from "mongoose"

const videoSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    videoUrl: String,
    thumbnailUrl: String,
    publicId: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // New optional fields for enhanced features
    duration: { type: Number, default: 0 },
    categories: [{ type: String }],
    tags: [{ type: String }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        replies: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: String,
            likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

videoSchema.index({ uploadedBy: 1, createdAt: -1 })
videoSchema.index({ tags: 1 })
videoSchema.index({ createdAt: -1 })

export default mongoose.models.Video || mongoose.model("Video", videoSchema)
