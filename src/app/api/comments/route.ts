import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface Comment {
  id: string;
  post_slug: string;
  author_name: string;
  content: string;
  created_at: string;
  user_id?: string | null;
  parent_id?: string | null;
}

const commentsFilePath = path.join(process.cwd(), 'data', 'comments.json');

async function readLocalComments(): Promise<Comment[]> {
  try {
    const data = await fs.readFile(commentsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLocalComments(comments: Comment[]): Promise<void> {
  try {
    await fs.writeFile(commentsFilePath, JSON.stringify(comments, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing comments:', error);
  }
}

export async function GET(request: NextRequest) {
  const postSlug = request.nextUrl.searchParams.get('post_slug');
  if (!postSlug) {
    return NextResponse.json({ error: 'post_slug is required' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT c.*, u.nickname, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.post_slug = $1
       ORDER BY c.created_at DESC`,
      [postSlug]
    );

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error('DB comments read failed:', error);
  }

  const allComments = await readLocalComments();
  return NextResponse.json(allComments.filter(c => c.post_slug === postSlug));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_slug, content, parent_id } = body;
    const user = await getUserFromRequest(request);

    const author_name = body.author_name || user?.nickname || 'Anonymous';
    const user_id = user?.id || null;

    if (!post_slug || !content?.trim()) {
      return NextResponse.json(
        { error: 'post_slug and content are required' },
        { status: 400 }
      );
    }

    const newComment: Comment = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      post_slug,
      author_name,
      content: content.trim(),
      created_at: new Date().toISOString(),
      user_id,
      parent_id: parent_id || null,
    };

    // Save to local JSON
    const comments = await readLocalComments();
    comments.unshift(newComment);
    await writeLocalComments(comments);

    // Try DB
    try {
      const result = await query(
        `INSERT INTO comments (id, post_slug, author_name, content, user_id, parent_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [newComment.id, newComment.post_slug, newComment.author_name, newComment.content, user_id, parent_id || null]
      );
      if (result.rows.length > 0) {
        return NextResponse.json(result.rows[0], { status: 201 });
      }
    } catch (error) {
      console.error('DB comment insert failed:', error);
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
