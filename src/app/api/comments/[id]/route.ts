import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const result = await query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING id',
      [params.id, user.id]
    );

    if (result.rows.length === 0) {
      const adminCheck = await query('SELECT id FROM comments WHERE id = $1', [params.id]);
      if (adminCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Not your comment to delete' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment delete error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
