import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { lookupIP } from '@/lib/geo';

// ── Record a visit ──
export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'path is required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Skip bots
    if (/bot|crawl|spider|scraper|Headless|Pingdom/i.test(userAgent)) {
      return NextResponse.json({ ok: true });
    }

    const geo = await lookupIP(ip);

    await query(
      `INSERT INTO visits (path, country, city, lat, lon, country_code, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [path, geo?.country || null, geo?.city || null, geo?.lat || null, geo?.lon || null,
       geo?.countryCode || null, ip, userAgent]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Visit tracking failed:', error);
    return NextResponse.json({ ok: true }); // Never expose errors to client
  }
}

// ── Get visitor stats ──
export async function GET() {
  try {
    const total = await query('SELECT COUNT(*) FROM visits');
    const uniqueCountries = await query(
      `SELECT country, country_code, COUNT(*) as count
       FROM visits WHERE country IS NOT NULL
       GROUP BY country, country_code ORDER BY count DESC`
    );
    const recent = await query(
      `SELECT country, city, lat, lon, country_code, path, created_at
       FROM visits WHERE lat IS NOT NULL
       ORDER BY created_at DESC LIMIT 100`
    );
    const todayCount = await query(
      `SELECT COUNT(*) FROM visits WHERE created_at >= CURRENT_DATE`
    );

    return NextResponse.json({
      total: parseInt(total.rows[0]?.count || '0'),
      today: parseInt(todayCount.rows[0]?.count || '0'),
      countries: uniqueCountries.rows,
      recentVisitors: recent.rows,
    });
  } catch (error) {
    console.error('Visit stats failed:', error);
    return NextResponse.json({ total: 0, today: 0, countries: [], recentVisitors: [] });
  }
}
