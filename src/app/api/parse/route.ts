import { NextResponse } from 'next/server';
import { prisma } from '@/app/prisma';

const API_KEY = process.env.OPENROUTER_API_KEY!;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: Request) {
  const { content } = await req.json();

  const aiResponse = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct',
      messages: [
        {
          role: 'user',
          content: `Summarize this threat report and identify any IOCs or MITRE ATT&CK techniques:\n\n${content}`,
        },
      ],
    }),
  });

  const data = await aiResponse.json();
  const summary = data.choices?.[0]?.message?.content ?? 'No summary';

  // TODO: extract IOCs and MITRE tags with regex or AI (simulate for now)
  const fakeIOCs = ['192.168.1.1', 'abc123hash'];
  const fakeTTPs = ['T1059', 'T1566'];

  // Save to PostgreSQL
  const report = await prisma.report.create({
    data: {
      content,
      summary,
      iocs: fakeIOCs,
      mitreTags: fakeTTPs,
    },
  });

  return NextResponse.json({ summary, report });
}