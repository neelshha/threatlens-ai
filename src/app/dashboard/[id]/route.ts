import { NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.report.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}