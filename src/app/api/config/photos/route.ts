import { NextResponse } from 'next/server';
import { getPhotos, savePhotos } from '@/lib/config';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const photos = await getPhotos();
  return NextResponse.json(photos);
}

export async function PUT(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const success = await savePhotos(body);
    
    if (success) {
      return NextResponse.json(body);
    }
    
    return NextResponse.json({ error: 'Failed to save photos' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
