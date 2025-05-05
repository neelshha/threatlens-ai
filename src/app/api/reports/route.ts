// src/app/api/reports/route.ts
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        iocs: true,
        mitreTags: true,
      },
    });

    return NextResponse.json(
      reports.map((r) => ({
        ...r,
        iocs: r.iocs.map((i) => i.value),
        mitreTags: r.mitreTags.map((t) => t.value),
      }))
    );
  } catch (err) {
    console.error('GET /api/reports failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}