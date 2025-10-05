import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { userId } = await req.json();

    let {id}= await params
    const video = await Video.findById(id);
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const uid = userId;
    video.dislikes = (video.dislikes || []).filter(id => id.toString() !== uid);
    if (!video.likes.map(String).includes(String(uid))) {
      video.likes = [...(video.likes || []), uid];
    }
    await video.save();
    return NextResponse.json({ video }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
