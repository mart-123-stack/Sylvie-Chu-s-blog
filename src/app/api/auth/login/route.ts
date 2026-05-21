import { NextResponse } from 'next/server';
import { verifyPassword, loginUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password, email } = await request.json();

    // User login (email + password)
    if (email) {
      const result = await loginUser(email, password);
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }
      return NextResponse.json(result);
    }

    // Admin login (password only)
    if (password) {
      if (verifyPassword(password)) {
        return NextResponse.json({
          success: true,
          token: process.env.ADMIN_PASSWORD || '@smartz3950',
          admin: true,
        });
      }
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: 'email or password required' }, { status: 400 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
