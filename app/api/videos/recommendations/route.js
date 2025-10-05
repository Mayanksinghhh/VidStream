import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 6;
    const exclude = searchParams.get('exclude');
    const categories = searchParams.get('categories')?.split(',') || [];
    const userId = searchParams.get('userId');
    
    let query = { isPublic: true };
    
    // Exclude current video
    if (exclude) {
      query._id = { $ne: exclude };
    }
    
    // Build recommendation logic
    let recommendations = [];
    
    if (userId) {
      // Get user's watch history and preferences
      const user = await User.findById(userId).populate('watchHistory.video');
      if (user && user.watchHistory.length > 0) {
        // Get categories from user's watch history
        const watchedCategories = user.watchHistory
          .map(entry => entry.video?.categories)
          .flat()
          .filter(Boolean);
        
        // Get liked videos categories
        const likedVideos = await Video.find({ 
          _id: { $in: user.watchLater || [] },
          isPublic: true 
        });
        
        const likedCategories = likedVideos
          .map(video => video.categories)
          .flat()
          .filter(Boolean);
        
        // Combine all categories
        const allCategories = [...new Set([...watchedCategories, ...likedCategories])];
        
        if (allCategories.length > 0) {
          query.categories = { $in: allCategories };
        }
      }
    } else if (categories.length > 0) {
      // Use provided categories
      query.categories = { $in: categories };
    }
    
    // Get recommendations based on different criteria
    const categoryRecommendations = await Video.find(query)
      .populate('uploadedBy', 'username profileImage')
      .sort({ views: -1, likes: -1, createdAt: -1 })
      .limit(limit * 2); // Get more to filter later
    
    // If we have user data, try to get more personalized recommendations
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.subscriptions.length > 0) {
        const subscribedVideos = await Video.find({
          uploadedBy: { $in: user.subscriptions },
          isPublic: true,
          _id: { $ne: exclude }
        })
        .populate('uploadedBy', 'username profileImage')
        .sort({ createdAt: -1 })
        .limit(limit);
        
        recommendations = [...subscribedVideos, ...categoryRecommendations];
      } else {
        recommendations = categoryRecommendations;
      }
    } else {
      recommendations = categoryRecommendations;
    }
    
    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations.filter((video, index, self) => 
      index === self.findIndex(v => v._id.toString() === video._id.toString())
    ).slice(0, limit);
    
    return NextResponse.json({ 
      videos: uniqueRecommendations,
      algorithm: userId ? 'personalized' : 'category-based'
    }, { status: 200 });
  } catch (err) {
    console.error('Recommendation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
