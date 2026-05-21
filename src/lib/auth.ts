import { SignJWT, jwtVerify } from 'jose';
import { query } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'fallback_dev_secret_do_not_use_in_prod'
);

export interface UserPayload {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
}

export async function signToken(user: UserPayload): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, nickname: user.nickname })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      nickname: payload.nickname as string,
    };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request): Promise<UserPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7));
}

// Admin password auth (kept from Phase 0)
export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || '@smartz3950';
  return password === adminPassword;
}

export function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  const adminPassword = process.env.ADMIN_PASSWORD || '@smartz3950';
  return token === adminPassword;
}

// User registration
export async function registerUser(email: string, password: string, nickname: string): Promise<{ user: UserPayload; token: string } | { error: string }> {
  if (!email || !password || !nickname) return { error: 'email, password, and nickname are required' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (existing.rows.length > 0) return { error: 'Email already registered' };

    const crypto = await import('crypto');
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');

    const result = await query(
      `INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname`,
      [email, password_hash, nickname]
    );

    if (result.rows.length === 0) return { error: 'Failed to create user' };

    const user: UserPayload = result.rows[0];
    const token = await signToken(user);
    return { user, token };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Registration failed. Database may not be available.' };
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: UserPayload; token: string } | { error: string }> {
  if (!email || !password) return { error: 'email and password are required' };

  try {
    const crypto = await import('crypto');
    const password_hash = crypto.createHash('sha256').update(password).digest('hex');

    const result = await query(
      'SELECT id, email, nickname FROM users WHERE email = $1 AND password_hash = $2 LIMIT 1',
      [email, password_hash]
    );

    if (result.rows.length === 0) return { error: 'Invalid email or password' };

    const user: UserPayload = result.rows[0];
    const token = await signToken(user);
    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed. Database may not be available.' };
  }
}
