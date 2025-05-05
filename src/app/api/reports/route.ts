// src/app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}