import { NextResponse } from 'next/server';
import { verifyTokenFromHeader } from '@/lib/auth';
import ScheduledVideo from '@/models/ScheduledVideo';
import Draft from '@/models/Draft';

export async function POST(request) {
  try {
    const user = verifyTokenFromHeader(request);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { draftId, userId, scheduledFor, isPublic } = body;

    if (userId !== user._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the draft
    const draft = await Draft.findById(draftId);
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (draft.userId !== user._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create scheduled video
    const scheduledVideo = await ScheduledVideo.create({
      userId,
      title: draft.title,
      description: draft.description,
      categories: draft.categories,
      tags: draft.tags,
      scheduledFor: new Date(scheduledFor),
      isPublic: isPublic !== false,
      status: 'scheduled'
    });

    // Delete the draft
    await Draft.findByIdAndDelete(draftId);

    return NextResponse.json(scheduledVideo);
  } catch (error) {
    console.error('Schedule video error:', error);
    return NextResponse.json({ error: 'Failed to schedule video' }, { status: 500 });
  }
}
