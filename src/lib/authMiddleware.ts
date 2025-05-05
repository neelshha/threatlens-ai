import { verifyToken } from '@/lib/auth';

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}