import { NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';
import { Parser } from 'json2csv';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const fields = ['id', 'title', 'summary', 'iocs', 'mitreTags', 'createdAt'];
    const transforms = (item: any) => ({
      ...item,
      iocs: item.iocs?.join(', ') || '',
      mitreTags: item.mitreTags?.join(', ') || '',
    });

    const parser = new Parser({ fields });
    const csv = parser.parse(reports.map(transforms));

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="threat-reports.csv"',
      },
    });
  } catch (error) {
    console.error('❌ CSV Export Error:', error);
    return NextResponse.json({ error: 'Failed to generate CSV.' }, { status: 500 });
  }
}