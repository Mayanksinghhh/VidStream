const mongoose = require('mongoose');
const User = require('../models/User').default;
const Video = require('../models/Video').default;

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videoapp');
    console.log('Connected to MongoDB');

    // Check users
    const userCount = await User.countDocuments();
    console.log(`Total users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}).select('username email _id').limit(5);
      console.log('Sample users:', users);
    }

    // Check videos
    const videoCount = await Video.countDocuments();
    console.log(`Total videos: ${videoCount}`);
    
    if (videoCount > 0) {
      const videos = await Video.find({}).select('title uploadedBy').limit(5);
      console.log('Sample videos:', videos);
    }

    if (userCount === 0) {
      console.log('\n⚠️  No users found in database!');
      console.log('Run: npm run seed');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkDatabase();
