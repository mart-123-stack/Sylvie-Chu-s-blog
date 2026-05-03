import { NextResponse } from 'next/server';
import { getAboutConfig, saveAboutConfig } from '@/lib/config';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const config = await getAboutConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const success = await saveAboutConfig(body);
    
    if (success) {
      return NextResponse.json(body);
    }
    
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
