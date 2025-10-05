import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const video = await Video.findById(params.id);
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const likes = (video.likes || []).length;
    const dislikes = (video.dislikes || []).length;
    return NextResponse.json({ likes, dislikes }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
