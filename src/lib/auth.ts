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
