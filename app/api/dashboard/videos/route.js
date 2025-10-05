import { NextResponse } from 'next/server';
import { verifyTokenFromHeader } from '@/lib/auth';
import Video from '@/models/Video';

export async function GET(request) {
  try {
    const user = verifyTokenFromHeader(request);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId !== user._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const videos = await Video.find({ uploadedBy: user._id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username');

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Dashboard videos API error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
