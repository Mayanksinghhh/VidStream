import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/models/Video';
import User from '@/models/User';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { text } = await request.json();
    
    // For now, just return a success response
    // In a real app, you'd validate the user token and add the comment
    const comment = {
      _id: new Date().getTime().toString(),
      user: { username: 'Anonymous' },
      text: text,
      likes: [],
      replies: [],
      createdAt: new Date()
    };
    
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error('Comment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
