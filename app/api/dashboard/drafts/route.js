import { NextResponse } from 'next/server';
import { verifyTokenFromHeader } from '@/lib/auth';
import Draft from '@/models/Draft';

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

    const drafts = await Draft.find({ userId: user._id })
      .sort({ createdAt: -1 });

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Drafts API error:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = verifyTokenFromHeader(request);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, description, categories, tags } = body;

    if (userId !== user._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const draft = await Draft.create({
      userId,
      title,
      description,
      categories: categories ? categories.split(',').map(cat => cat.trim()).filter(Boolean) : [],
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      status: 'draft'
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Create draft error:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
