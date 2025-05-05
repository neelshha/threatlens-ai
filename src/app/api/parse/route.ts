import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-7b-instruct';

const cleanListItems = (text: string | undefined | null, pattern: RegExp): string[] => {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map(item => item.trim().replace(/^[-\s]*/, ''))
    .filter(item => item && pattern.test(item));
};

const extractFallbackIOCs = (text: string): string[] => {
  const patterns = [
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d{2,5})?\b/g,
    /\b[a-f0-9]{32}\b/gi,
    /\b[a-f0-9]{40}\b/gi,
    /\b[a-f0-9]{64}\b/gi,
    /\b(?:hxxp|https?):\/\/[^\s"']+/gi,
    /\b(?:[a-z0-9-]+\.)+[a-z]{2,}/gi
  ];
  return [...new Set(patterns.flatMap(p => [...text.matchAll(p)].map(m => m[0])))]
    .filter(ioc => ioc.length > 4);
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!API_KEY) return NextResponse.json({ error: 'Missing OpenRouter API Key' }, { status: 500 });

  let content = '';
  try {
    const body = await req.json();
    content = typeof body.content === 'string' ? body.content : JSON.stringify(body.content);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!content || content.length < 50) {
    return NextResponse.json({ error: 'Report too short or empty' }, { status: 400 });
  }

  const prompt = `You are a precise cybersecurity analyst. Analyze the following threat report text and extract ONLY the following information:

Title: <Title>
Summary: <Summary>
IOCs:
- <ioc>
MITRE:
- <Txxxx>

Report Text:\n"""\n${content}\n"""`;

  let aiOutput = '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ OpenRouter error:', res.status, errText);
      return NextResponse.json({ error: 'OpenRouter API failed', details: errText }, { status: res.status });
    }

    const data = await res.json();
    aiOutput = data.choices?.[0]?.message?.content?.trim() || '';

    if (!aiOutput) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }
  } catch (err) {
    console.error('❌ AI timeout or fetch error:', err);
    return NextResponse.json({ error: 'AI service timeout/failure' }, { status: 502 });
  }

  const title = aiOutput.match(/^Title[:\-]\s*(.*)/im)?.[1]?.trim() || 'Untitled Report';
  const summary = aiOutput.match(/^Summary[:\-]\s*([\s\S]*?)\nIOCs[:\-]/im)?.[1]?.trim() || 'No summary available.';
  const iocRaw = aiOutput.match(/^IOCs[:\-]\s*([\s\S]*?)\nMITRE[:\-]/im)?.[1] || '';
  const mitreRaw = aiOutput.match(/^MITRE[:\-]\s*([\s\S]*)$/im)?.[1] || '';

  let iocs = cleanListItems(iocRaw, /.+/);
  if (iocs.length === 0 || iocs.includes('None Found')) {
    iocs = extractFallbackIOCs(content);
  }

  let mitreTags = cleanListItems(mitreRaw, /^T\d{4}(\.\d{3})?$/);
  if (mitreTags.length === 0 || mitreTags.includes('None Found')) {
    mitreTags = [...new Set([...content.matchAll(/\bT\d{4}(?:\.\d{3})?\b/g)].map(m => m[0]))];
  }

  try {
    console.log('📌 Saving report with:', {
      title,
      summary,
      content: content.slice(0, 150) + '...', // avoid logging full content
      userId,
      iocs,
      mitreTags
    });

    const report = await prisma.report.create({
      data: {
        title,
        summary,
        content,
        userId,
        iocs: iocs.length > 0 ? { create: iocs.map(value => ({ value })) } : undefined,
        mitreTags: mitreTags.length > 0 ? { create: mitreTags.map(value => ({ value })) } : undefined
      }
    });

    return NextResponse.json({ summary, reportId: report.id });
  } catch (e: any) {
    console.error('❌ DB save error:', JSON.stringify(e, null, 2));
    return NextResponse.json({
      error: 'Database error',
      details: e?.message || 'Unknown DB error'
    }, { status: 500 });
  }
}