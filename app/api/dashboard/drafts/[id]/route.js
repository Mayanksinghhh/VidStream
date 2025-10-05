import { NextResponse } from 'next/server';
import { verifyTokenFromHeader } from '@/lib/auth';
import Draft from '@/models/Draft';

export async function DELETE(request, { params }) {
  try {
    const user = verifyTokenFromHeader(request);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const draft = await Draft.findById(params.id);
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (draft.userId !== user._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Draft.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Delete draft error:', error);
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
  }
}
