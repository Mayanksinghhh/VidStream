import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    
    const skip = (page - 1) * limit;
    
    // Simple query - get all videos
    let query = {};
    
    if (category) {
      query.categories = { $in: [category] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'popular':
        sortQuery = { views: -1 };
        break;
      case 'liked':
        sortQuery = { likes: -1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }
    
    let videos;
    try {
      videos = await Video.find(query)
        .populate('uploadedBy', 'username')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);
    } catch (populateError) {
      // Fallback: get videos without populate if User model is not available
      console.log('Populate failed, getting videos without user data:', populateError.message);
      videos = await Video.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);
    }
    
    const total = await Video.countDocuments(query);
    const hasMore = skip + videos.length < total;
    
    return NextResponse.json({ 
      videos, 
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    }, { status: 200 });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
