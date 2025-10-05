import { NextResponse } from 'next/server';
import { verifyTokenFromHeader } from '@/lib/auth';
import Video from '@/models/Video';
import User from '@/models/User';

export async function GET(request) {
  try {
    const user = verifyTokenFromHeader(request);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's videos
    const videos = await Video.find({ uploadedBy: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('uploadedBy', 'username');

    // Calculate stats
    const totalVideos = await Video.countDocuments({ uploadedBy: user._id });
    const totalViews = await Video.aggregate([
      { $match: { uploadedBy: user._id } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalLikes = await Video.aggregate([
      { $match: { uploadedBy: user._id } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);

    // Get user's subscriber count
    const userData = await User.findById(user._id).select('subscribers');
    const subscribers = userData?.subscribers?.length || 0;

    return NextResponse.json({
      totalVideos,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      subscribers,
      recentVideos: videos
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
