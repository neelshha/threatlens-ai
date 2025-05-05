import { prisma } from '@/app/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        iocs: true,
        mitreTags: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...report,
      iocs: report.iocs.map((i) => i.value),
      mitreTags: report.mitreTags.map((t) => t.value),
    });
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const { title, summary, content, iocs = [], mitreTags = [] } = await req.json();

    const updated = await prisma.$transaction(async (tx) => {
      await tx.ioc.deleteMany({ where: { reportId: id } });
      await tx.mitreTag.deleteMany({ where: { reportId: id } });

      return tx.report.update({
        where: { id },
        data: {
          title,
          summary,
          content,
          iocs: {
            create: iocs.filter(Boolean).map((val: string) => ({ value: val })),
          },
          mitreTags: {
            create: mitreTags.filter(Boolean).map((val: string) => ({ value: val })),
          },
        },
        include: {
          iocs: true,
          mitreTags: true,
        },
      });
    });

    return NextResponse.json({
      ...updated,
      iocs: updated.iocs.map((i) => i.value),
      mitreTags: updated.mitreTags.map((t) => t.value),
    });
  } catch (err) {
    console.error('PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}