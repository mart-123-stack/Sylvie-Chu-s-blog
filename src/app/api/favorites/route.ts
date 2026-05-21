import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT f.post_slug, p.title, p.excerpt, f.created_at
       FROM favorites f
       LEFT JOIN posts p ON f.post_slug = p.slug
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json([]);
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

    // Toggle favorite
    const existing = await query(
      'SELECT id FROM favorites WHERE post_slug = $1 AND user_id = $2 LIMIT 1',
      [post_slug, user.id]
    );

    let favorited = false;
    if (existing.rows.length > 0) {
      await query('DELETE FROM favorites WHERE post_slug = $1 AND user_id = $2', [post_slug, user.id]);
    } else {
      await query('INSERT INTO favorites (post_slug, user_id) VALUES ($1, $2)', [post_slug, user.id]);
      favorited = true;
    }

    return NextResponse.json({ favorited });
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
