import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { userId } = await request.json();
    
    // For now, just return a success response
    // In a real app, you'd validate the user token and add to watch later
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Added to watch later',
      inWatchLater: true
    }, { status: 200 });
  } catch (err) {
    console.error('Watch later add error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { userId } = await request.json();
    
    // For now, just return a success response
    // In a real app, you'd validate the user token and remove from watch later
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Removed from watch later',
      inWatchLater: false
    }, { status: 200 });
  } catch (err) {
    console.error('Watch later remove error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
