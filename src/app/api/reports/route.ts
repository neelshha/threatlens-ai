import { NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        iocs: true,
        mitreTags: true,
      },
    });

    const formatted = reports.map((report) => ({
      ...report,
      iocs: report.iocs.map((i) => i.value),
      mitreTags: report.mitreTags.map((t) => t.value),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/reports failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}