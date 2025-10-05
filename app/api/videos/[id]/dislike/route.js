import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { userId } = await req.json();
    const video = await Video.findById(params.id);
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const uid = userId;
    video.likes = (video.likes || []).filter(id => id.toString() !== uid);
    if (!video.dislikes.map(String).includes(String(uid))) {
      video.dislikes = [...(video.dislikes || []), uid];
    }
    await video.save();
    return NextResponse.json({ video }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
