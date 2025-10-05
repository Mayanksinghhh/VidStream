import { NextResponse } from 'next/server';
import { verifyTokenFromHeader } from '@/lib/auth';
import ScheduledVideo from '@/models/ScheduledVideo';

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

    const scheduled = await ScheduledVideo.find({ userId: user._id })
      .sort({ scheduledFor: 1 });

    return NextResponse.json({ scheduled });
  } catch (error) {
    console.error('Scheduled videos API error:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled videos' }, { status: 500 });
  }
}
