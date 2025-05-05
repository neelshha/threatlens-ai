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
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::\d{2,5})?\b/g, // IPs
    /\b[a-f0-9]{32}\b/gi,                              // MD5
    /\b[a-f0-9]{40}\b/gi,                              // SHA1
    /\b[a-f0-9]{64}\b/gi,                              // SHA256
    /\b(?:hxxp|https?):\/\/[^\s"']+/gi,                // URLs
    /\b(?:[a-z0-9-]+\.)+[a-z]{2,}/gi                   // Domains
  ];
  const matches = patterns.flatMap(p => [...text.matchAll(p)].map(m => m[0]));
  return [...new Set(matches)].filter(ioc => ioc.length > 4);
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing OpenRouter API Key' }, { status: 500 });
  }

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
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const errText = await res.text();
      console.error('❌ OpenRouter API error:', res.status, errText);
      return NextResponse.json({ error: 'OpenRouter API failure', details: errText }, { status: res.status });
    }

    const data = await res.json();
    aiOutput = data.choices?.[0]?.message?.content?.trim() || '';

    if (process.env.NODE_ENV === 'development') {
      console.log('🧠 AI Output:\n', aiOutput);
    }

  } catch (error) {
    console.error('❌ AI service timeout or failure:', error);
    return NextResponse.json({ error: 'AI service timeout/failure' }, { status: 502 });
  }

  const title = aiOutput.match(/^Title[:\-]\s*(.*)/im)?.[1]?.trim() || 'Untitled Report';
  const summary = aiOutput.match(/^Summary[:\-]\s*([\s\S]*?)\nIOCs[:\-]/im)?.[1]?.trim() || 'No summary available.';
  const iocRaw = aiOutput.match(/^IOCs[:\-]\s*([\s\S]*?)\nMITRE[:\-]/im)?.[1] || '';
  const mitreRaw = aiOutput.match(/^MITRE[:\-]\s*([\s\S]*)$/im)?.[1] || '';

  let iocs = cleanListItems(iocRaw, /.+/);
  if (iocs.includes('None Found') || iocs.length === 0) {
    iocs = extractFallbackIOCs(content);
  }

  let mitreTags = cleanListItems(mitreRaw, /^T\d{4}(\.\d{3})?$/);
  if (mitreTags.includes('None Found') || mitreTags.length === 0) {
    mitreTags = [...new Set([...content.matchAll(/\bT\d{4}(?:\.\d{3})?\b/g)].map(m => m[0]))];
  }

  try {
    const report = await prisma.report.create({
      data: {
        title,
        summary,
        content,
        userId,
        iocs: { create: iocs.map(value => ({ value })) },
        mitreTags: { create: mitreTags.map(value => ({ value })) }
      }
    });

    return NextResponse.json({ summary, reportId: report.id });
  } catch (e: any) {
    console.error('❌ Prisma Save Error:', e);
    return NextResponse.json({ error: 'Database error', details: e.message }, { status: 500 });
  }
}