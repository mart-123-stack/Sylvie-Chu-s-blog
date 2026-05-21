import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, nickname } = await request.json();
    const result = await registerUser(email, password, nickname);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
