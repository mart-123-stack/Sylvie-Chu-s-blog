import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const postSlug = request.nextUrl.searchParams.get('post_slug');
  if (!postSlug) {
    return NextResponse.json({ error: 'post_slug is required' }, { status: 400 });
  }

  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM likes WHERE post_slug = $1',
      [postSlug]
    );
    const count = parseInt(result.rows[0]?.count || '0', 10);

    // Check if current user liked
    const user = await getUserFromRequest(request);
    let liked = false;
    if (user) {
      const userLike = await query(
        'SELECT id FROM likes WHERE post_slug = $1 AND user_id = $2 LIMIT 1',
        [postSlug, user.id]
      );
      liked = userLike.rows.length > 0;
    }

    return NextResponse.json({ count, liked });
  } catch (error) {
    console.error('Likes GET error:', error);
    return NextResponse.json({ count: 0, liked: false });
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const { post_slug } = await request.json();
    if (!post_slug) {
      return NextResponse.json({ error: 'post_slug is required' }, { status: 400 });
    }

    // Toggle like
    const existing = await query(
      'SELECT id FROM likes WHERE post_slug = $1 AND user_id = $2 LIMIT 1',
      [post_slug, user.id]
    );

    if (existing.rows.length > 0) {
      await query('DELETE FROM likes WHERE post_slug = $1 AND user_id = $2', [post_slug, user.id]);
    } else {
      await query('INSERT INTO likes (post_slug, user_id) VALUES ($1, $2)', [post_slug, user.id]);
    }

    // Return updated count
    const result = await query('SELECT COUNT(*) as count FROM likes WHERE post_slug = $1', [post_slug]);
    return NextResponse.json({
      count: parseInt(result.rows[0]?.count || '0', 10),
      liked: existing.rows.length === 0,
    });
  } catch (error) {
    console.error('Likes POST error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
