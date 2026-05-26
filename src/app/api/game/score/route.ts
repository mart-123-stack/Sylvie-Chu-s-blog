import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Submit a game score
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Please login to save scores" }, { status: 401 });
  }

  try {
    const { score } = await request.json();
    if (typeof score !== "number" || score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    // Only keep the best score per user — upsert
    await query(
      `INSERT INTO game_scores (user_id, score) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET score = GREATEST(game_scores.score, EXCLUDED.score), created_at = NOW()`,
      [user.id, Math.floor(score)]
    );

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("Failed to save score:", err);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}

// Get leaderboard
export async function GET() {
  try {
    const result = await query(
      `SELECT u.nickname, u.avatar_url, gs.score, gs.created_at
       FROM game_scores gs
       JOIN users u ON gs.user_id = u.id
       ORDER BY gs.score DESC
       LIMIT 20`
    );

    const board = result.rows.map((row, i) => ({
      rank: i + 1,
      nickname: row.nickname,
      avatar_url: row.avatar_url,
      score: row.score,
      date: row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
    }));

    return NextResponse.json(board);
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    // Fallback: return empty board if DB unavailable
    return NextResponse.json([]);
  }
}
