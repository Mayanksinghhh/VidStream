import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // For now, just return a success response
    // In a real app, you'd validate the user token and enable notifications
    return NextResponse.json({ 
      message: 'Notifications enabled',
      notifications: true
    }, { status: 200 });
  } catch (err) {
    console.error('Notification enable error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // For now, just return a success response
    // In a real app, you'd validate the user token and disable notifications
    return NextResponse.json({ 
      message: 'Notifications disabled',
      notifications: false
    }, { status: 200 });
  } catch (err) {
    console.error('Notification disable error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
