import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

// GET /api/reports/[id]
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userId = await getUserId();

  if (!id || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const report = await prisma.report.findFirst({
      where: {
        id,
        userId, // 👈 restrict access to owner
      },
      include: {
        iocs: true,
        mitreTags: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      ...report,
      iocs: report.iocs.map((i) => i.value),
      mitreTags: report.mitreTags.map((t) => t.value),
    });
  } catch (err) {
    console.error('GET /api/reports/[id] failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/reports/[id]
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userId = await getUserId();

  if (!id || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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
            create: (iocs as string[]).filter(Boolean).map((value) => ({ value })),
          },
          mitreTags: {
            create: (mitreTags as string[]).filter(Boolean).map((value) => ({ value })),
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
    console.error('PATCH /api/reports/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

// DELETE /api/reports/[id]
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userId = await getUserId();

  if (!id || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/reports/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}