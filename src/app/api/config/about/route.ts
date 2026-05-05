import { NextResponse } from 'next/server';
import { getAboutConfig, saveAboutConfig } from '@/lib/config';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getAboutConfig();
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('GET /api/config/about error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Saving about config:', JSON.stringify(body).substring(0, 200));
    const success = await saveAboutConfig(body);
    
    if (success) {
      return NextResponse.json(body);
    }
    
    return NextResponse.json({ error: 'Failed to save config to database' }, { status: 500 });
  } catch (error) {
    console.error('PUT /api/config/about error:', error);
    return NextResponse.json({ error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}
