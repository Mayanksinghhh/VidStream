const mongoose = require('mongoose');
const Video = require('../models/Video').default;
const User = require('../models/User').default;

// Sample data
const sampleUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: '$2b$10$example', // This would be hashed in real app
    profileImage: 'https://via.placeholder.com/150'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: '$2b$10$example',
    profileImage: 'https://via.placeholder.com/150'
  }
];

const sampleVideos = [
  {
    title: 'Amazing Nature Documentary',
    description: 'A beautiful journey through nature\'s wonders',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: 'https://via.placeholder.com/320x180',
    duration: 120,
    categories: ['Nature', 'Documentary'],
    tags: ['nature', 'wildlife', 'documentary'],
    views: 1500,
    likes: [],
    dislikes: [],
    isPublic: true
  },
  {
    title: 'Cooking Tutorial: Perfect Pasta',
    description: 'Learn how to make the perfect pasta from scratch',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: 'https://via.placeholder.com/320x180',
    duration: 300,
    categories: ['Cooking', 'Tutorial'],
    tags: ['cooking', 'pasta', 'tutorial', 'italian'],
    views: 2300,
    likes: [],
    dislikes: [],
    isPublic: true
  },
  {
    title: 'Gaming Highlights: Epic Moments',
    description: 'Best gaming moments from this week',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    thumbnailUrl: 'https://via.placeholder.com/320x180',
    duration: 180,
    categories: ['Gaming', 'Entertainment'],
    tags: ['gaming', 'highlights', 'funny', 'epic'],
    views: 5000,
    likes: [],
    dislikes: [],
    isPublic: true
  },
  {
    title: 'Tech Review: Latest Smartphone',
    description: 'In-depth review of the newest smartphone',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4',
    thumbnailUrl: 'https://via.placeholder.com/320x180',
    duration: 600,
    categories: ['Technology', 'Review'],
    tags: ['tech', 'smartphone', 'review', 'mobile'],
    views: 8000,
    likes: [],
    dislikes: [],
    isPublic: true
  },
  {
    title: 'Fitness Workout: Full Body',
    description: 'Complete full body workout routine',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_30mb.mp4',
    thumbnailUrl: 'https://via.placeholder.com/320x180',
    duration: 2400,
    categories: ['Fitness', 'Health'],
    tags: ['fitness', 'workout', 'exercise', 'health'],
    views: 1200,
    likes: [],
    dislikes: [],
    isPublic: true
  }
];

async function addSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videoapp');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Video.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Add sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`Added ${users.length} users`);

    // Add sample videos with user references
    const videosWithUsers = sampleVideos.map((video, index) => ({
      ...video,
      uploadedBy: users[index % users.length]._id
    }));

    const videos = await Video.insertMany(videosWithUsers);
    console.log(`Added ${videos.length} videos`);

    console.log('Sample data added successfully!');
    console.log('You can now visit your app to see the videos.');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleData();
