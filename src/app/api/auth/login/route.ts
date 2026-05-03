import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (verifyPassword(password)) {
      return NextResponse.json({ 
        success: true, 
        token: process.env.ADMIN_PASSWORD || 'admin123' 
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
