import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { videoId } = await request.json();
    
    // For now, just return a success response
    // In a real app, you'd validate the user token and add video to playlist
    return NextResponse.json({ 
      message: 'Video added to playlist',
      success: true
    }, { status: 200 });
  } catch (err) {
    console.error('Add video to playlist error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const videoId = request.nextUrl.searchParams.get('videoId');
    
    // For now, just return a success response
    // In a real app, you'd validate the user token and remove video from playlist
    return NextResponse.json({ 
      message: 'Video removed from playlist',
      success: true
    }, { status: 200 });
  } catch (err) {
    console.error('Remove video from playlist error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
