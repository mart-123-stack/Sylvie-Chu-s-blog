import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Check recent posts (happy if within 3 days)
    const recentPost = await query(
      `SELECT created_at FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 1`
    );
    const lastPostDate = recentPost.rows[0]?.created_at;
    const daysSincePost = lastPostDate
      ? (Date.now() - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    // Check today's visitors (excited if > 5)
    const todayVisitors = await query(
      `SELECT COUNT(DISTINCT ip) as count FROM visits WHERE created_at >= CURRENT_DATE`
    );
    const visitorCount = parseInt(todayVisitors.rows[0]?.count || '0');

    // Check recent comments (happy if today)
    const recentComment = await query(
      `SELECT created_at FROM comments ORDER BY created_at DESC LIMIT 1`
    );
    const lastCommentDate = recentComment.rows[0]?.created_at;
    const hasRecentComment = lastCommentDate
      ? (Date.now() - new Date(lastCommentDate).getTime()) < (1000 * 60 * 60 * 24)
      : false;

    let mood: string;
    if (daysSincePost < 3 || hasRecentComment) {
      mood = 'happy';
    } else if (daysSincePost > 14) {
      mood = 'sleepy';
    } else if (visitorCount > 5) {
      mood = 'excited';
    } else {
      mood = 'idle';
    }

    return NextResponse.json({
      mood,
      daysSincePost: Math.round(daysSincePost),
      visitorsToday: visitorCount,
      totalPosts: recentPost.rows.length > 0 ? undefined : 0, // 0 if no posts
    });
  } catch {
    return NextResponse.json({ mood: 'idle', daysSincePost: 0, visitorsToday: 0 });
  }
}
