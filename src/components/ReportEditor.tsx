'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { FormattedDate } from '@/components/FormattedDate';
import { useDebouncedCallback } from 'use-debounce';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { toast } from 'react-hot-toast';
import { ReportTags } from '@/components/ReportTags';
import { Download, Trash } from 'lucide-react';

const mitreRegex = /^T\d{4}(\.\d{3})?$/;

interface ReportEditorProps {
  id: string;
}

interface ReportData {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  iocs: string[];
  mitreTags: string[];
}

export default function ReportEditor({ id }: ReportEditorProps) {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [editableIOCs, setEditableIOCs] = useState<string[]>([]);
  const [editableMitreTags, setEditableMitreTags] = useState<string[]>([]);
  const iocInputRef = useRef<HTMLInputElement>(null);
  const mitreInputRef = useRef<HTMLInputElement>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) throw new Error((await res.json()).error || 'Report not found');
        const data = await res.json();
        setReport(data);
        setEditableTitle(data.title);
        setEditableSummary(data.summary);
        setEditableContent(data.content);
        setEditableIOCs(data.iocs);
        setEditableMitreTags(data.mitreTags);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const debouncedUpdate = useDebouncedCallback(async () => {
    if (!report) return;
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editableTitle,
          summary: editableSummary,
          content: editableContent,
          iocs: editableIOCs,
          mitreTags: editableMitreTags,
        }),
      });
      mutate(`/api/reports/${id}`);
      setSavingStatus('Saved!');
      setTimeout(() => setSavingStatus(null), 1500);
    } catch {
      toast.error('Failed to update report.');
    }
  }, 1000);

  const addTag = (type: 'ioc' | 'mitre', value: string) => {
    const clean = value.trim();
    if (!clean) return;
    if (type === 'ioc' && !editableIOCs.includes(clean)) {
      setEditableIOCs([...editableIOCs, clean]);
      debouncedUpdate();
      if (iocInputRef.current) iocInputRef.current.value = '';
    }
    if (type === 'mitre') {
      const upper = clean.toUpperCase();
      if (!mitreRegex.test(upper)) return toast.error('Invalid MITRE tag.');
      if (!editableMitreTags.includes(upper)) {
        setEditableMitreTags([...editableMitreTags, upper]);
        debouncedUpdate();
        if (mitreInputRef.current) mitreInputRef.current.value = '';
      }
    }
  };

  const removeTag = (type: 'ioc' | 'mitre', value: string) => {
    if (type === 'ioc') setEditableIOCs(editableIOCs.filter(i => i !== value));
    else setEditableMitreTags(editableMitreTags.filter(t => t !== value));
    debouncedUpdate();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this report?')) return;
    await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    mutate('/api/reports');
    router.push('/dashboard');
  };

  const handleDownloadDocx = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: editableTitle, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(editableSummary),
          new Paragraph({ text: 'IOCs', heading: HeadingLevel.HEADING_2 }),
          ...editableIOCs.map(ioc => new Paragraph(ioc)),
          new Paragraph({ text: 'MITRE ATT&CK Tags', heading: HeadingLevel.HEADING_2 }),
          ...editableMitreTags.map(tag => new Paragraph(tag)),
          new Paragraph({ text: 'Raw Content', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(editableContent),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editableTitle || 'ThreatReport'}.docx`;
    a.click();
    toast.success('DOCX downloaded!');
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <main className="bg-[#020a18] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto rounded-2xl shadow-xl bg-[#0e1629] border border-[#3942f2] p-6 sm:p-8">
        <div className="mb-6">
          <input
            className="text-2xl sm:text-3xl font-bold bg-transparent w-full text-white border-b border-[#3942f2]/40 pb-2 focus:outline-none"
            value={editableTitle}
            onChange={e => setEditableTitle(e.target.value)}
            onBlur={debouncedUpdate}
            placeholder="Untitled Report"
          />
          {savingStatus && <div className="text-green-400 text-sm mt-1">{savingStatus}</div>}
          {report?.createdAt && (
            <p className="text-sm text-neutral-400 mt-1">
              Published on <FormattedDate iso={report.createdAt} />
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="summary" className="block text-neutral-300 text-sm font-medium mb-1">Summary</label>
          <textarea
            id="summary"
            className="w-full bg-[#121b30] text-white text-sm rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#3942f2]"
            rows={3}
            value={editableSummary}
            onChange={e => setEditableSummary(e.target.value)}
            onBlur={debouncedUpdate}
            placeholder="Provide a brief summary of the report..."
          />
        </div>

        <div className="mb-6">
          <label htmlFor="iocs" className="block text-neutral-300 text-sm font-medium mb-2">Indicators of Compromise (IOCs)</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              ref={iocInputRef}
              id="iocs"
              className="bg-[#121b30] text-white text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#3942f2] flex-grow"
              placeholder="Add IOC (e.g., IP address, domain)"
              onKeyDown={e => e.key === 'Enter' && addTag('ioc', e.currentTarget.value)}
            />
            <button
              onClick={() => iocInputRef.current?.value && addTag('ioc', iocInputRef.current.value)}
              className="bg-[#3942f2] hover:bg-[#4a52f4] text-white rounded-md px-3 py-2 text-sm focus:outline-none"
            >
              Add
            </button>
          </div>
          <ReportTags iocs={editableIOCs} onRemove={removeTag} type="ioc" />
        </div>

        <div className="mb-6">
          <label htmlFor="mitre" className="block text-neutral-300 text-sm font-medium mb-2">MITRE ATT&CK Tags</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              ref={mitreInputRef}
              id="mitre"
              className="bg-[#121b30] text-white text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex-grow"
              placeholder="Add MITRE Txxxx"
              onKeyDown={e => e.key === 'Enter' && addTag('mitre', e.currentTarget.value)}
            />
            <button
              onClick={() => mitreInputRef.current?.value && addTag('mitre', mitreInputRef.current.value)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-md px-3 py-2 text-sm focus:outline-none"
            >
              Add
            </button>
          </div>
          <ReportTags mitreTags={editableMitreTags} onRemove={removeTag} type="mitre" />
        </div>

        <div className="mb-8">
          <label htmlFor="content" className="block text-neutral-300 text-sm font-medium mb-1">Content</label>
          <textarea
            id="content"
            className="w-full bg-[#121b30] text-white text-sm rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#3942f2] min-h-[200px]"
            rows={10}
            value={editableContent}
            onChange={e => setEditableContent(e.target.value)}
            onBlur={debouncedUpdate}
            placeholder="Enter the main content of the report..."
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={handleDownloadDocx}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm focus:outline-none flex items-center"
          >
            <Download className="mr-2" size={16} /> Download DOCX
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm focus:outline-none flex items-center"
          >
            <Trash className="mr-2" size={16} /> Delete
          </button>
        </div>
      </div>
    </main>
  );
}
