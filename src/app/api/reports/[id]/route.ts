import { prisma } from '@/app/prisma';
import { NextResponse } from 'next/server';

// GET: Fetch a report by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error('GET /api/reports/[id] failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a report by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.report.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/reports/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}

// PATCH: Update title, summary, IOCs, or MITRE tags
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, summary, iocs, mitreTags } = body;

    const updatePayload: any = {};

    if (typeof title === 'string') {
      updatePayload.title = title.trim();
    }

    if (typeof summary === 'string') {
      updatePayload.summary = summary.trim();
    }

    if (Array.isArray(iocs)) {
      updatePayload.iocs = iocs.map(i => i.trim()).filter(i => i);
    }

    if (Array.isArray(mitreTags)) {
      updatePayload.mitreTags = mitreTags.map(t => t.trim()).filter(t => t);
    }

    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: updatePayload,
    });

    return NextResponse.json(updatedReport);
  } catch (err) {
    console.error('PATCH /api/reports/[id] failed:', err);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}