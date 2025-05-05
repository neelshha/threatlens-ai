'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { Report } from '@prisma/client';
import { FormattedDate } from '@/components/FormattedDate';
import { Loader2, AlertTriangle, Trash2, Download, FileText, Tag, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { useDebouncedCallback } from 'use-debounce';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast'; // For notifications

const mitreRegex = /^T\d{4}(\.\d{3})?$/;

const ReportPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [editableMitreTags, setEditableMitreTags] = useState<string[]>([]);
  const [editableIOCs, setEditableIOCs] = useState<string[]>([]);
  const iocInputRef = useRef<HTMLInputElement>(null);
  const mitreInputRef = useRef<HTMLInputElement>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null); // New state for saving status

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${params.id}`);
        if (!res.ok) throw new Error((await res.json()).error || 'Report not found');
        const data = await res.json();
        setReport(data);
        setEditableTitle(data.title || '');
        setEditableSummary(data.summary || '');
        setEditableContent(data.content || '');
        setEditableMitreTags(data.mitreTags || []);
        setEditableIOCs(data.iocs || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load report.');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [params.id]);

  const debouncedUpdate = useDebouncedCallback(async () => {
    if (!report) return;
    try {
      await fetch(`/api/reports/${params.id}`, {
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
      mutate(`/api/reports/${params.id}`);
      setSavingStatus('Saved!');
      setTimeout(() => {
        setSavingStatus(null);
      }, 1500);
    } catch (err) {
      console.error('Error updating report:', err);
      toast.error('Failed to update report.', { duration: 2000 });
    }
  }, 1000);

  const handleChangeAndDebounce = (setter: any) => (value: string) => {
    setter(value);
    debouncedUpdate();
  };

  const addTag = (type: 'ioc' | 'mitre', value: string) => {
    const clean = value.trim();
    if (!clean) return;
    if (type === 'ioc' && !editableIOCs.includes(clean)) {
      const updated = [...editableIOCs, clean];
      setEditableIOCs(updated);
      debouncedUpdate();
      iocInputRef.current && (iocInputRef.current.value = '');
    }
    if (type === 'mitre') {
      const upper = clean.toUpperCase();
      if (mitreRegex.test(upper) && !editableMitreTags.includes(upper)) {
        const updated = [...editableMitreTags, upper];
        setEditableMitreTags(updated);
        debouncedUpdate();
        mitreInputRef.current && (mitreInputRef.current.value = '');
      } else if (!mitreRegex.test(upper)) {
        toast.error('Invalid MITRE ATT&CK tag format.', { duration: 2000 });
      }
    }
  };

  const removeTag = (type: 'ioc' | 'mitre', value: string) => {
    if (type === 'ioc') {
      const updated = editableIOCs.filter(i => i !== value);
      setEditableIOCs(updated);
    } else {
      const updated = editableMitreTags.filter(t => t !== value);
      setEditableMitreTags(updated);
    }
    debouncedUpdate();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`/api/reports/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json())?.error || 'Failed to delete.');
      mutate('/api/reports');
      router.push('/');
      router.refresh();
      toast.success('Report deleted successfully!', { duration: 2000 });
    } catch (err: any) {
      toast.error(err.message || 'Delete failed.', { duration: 2000 });
    }
  };

  const handleDownloadDocx = async () => {
    if (!report) return;
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: editableTitle, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(editableSummary),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'IOCs', heading: HeadingLevel.HEADING_2 }),
          ...editableIOCs.map(ioc => new Paragraph(ioc)),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'MITRE ATT&CK Tags', heading: HeadingLevel.HEADING_2 }),
          ...editableMitreTags.map(tag => new Paragraph(tag)),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Raw Content', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(editableContent),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editableTitle || 'ThreatReport'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('DOCX file downloaded!', { duration: 1500 });
  };



  if (loading) return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span>Loading Report...</span>
    </main>
  );

  if (error || !report) {
    const isNotFound = error?.toLowerCase().includes('not found') || !report;
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-neutral-950 text-white">
        <div className={`bg-neutral-800 p-6 rounded-lg shadow max-w-md border ${isNotFound ? 'border-yellow-500/50' : 'border-red-500/50'}`}>
          <AlertTriangle className={`w-8 h-8 mb-3 ${isNotFound ? 'text-yellow-400' : 'text-red-400'}`} />
          <h2 className="text-xl font-semibold mb-2">{isNotFound ? 'Report Not Found' : 'Error Loading Report'}</h2>
          <p className="text-neutral-300 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => router.back()} className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm">Go Back</button>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">Dashboard</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-neutral-950 text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-neutral-800 border border-neutral-700/50 rounded-xl shadow-lg">
        <div className="p-6 sm:p-8">
          <header className="mb-8 border-b border-neutral-700 pb-4 flex items-center justify-between">
            <input
              value={editableTitle}
              onChange={e => handleChangeAndDebounce(setEditableTitle)(e.target.value)}
              className="text-3xl font-bold bg-transparent text-white w-full mb-2 focus:outline-none"
              placeholder="Untitled Report"
            />
            {savingStatus && (
              <div className="flex items-center text-green-500 font-semibold text-sm">
                <CheckCircle className="w-4 h-4 mr-1" /> {savingStatus}
              </div>
            )}
          </header>
          <p className="text-sm text-neutral-400 mb-4">Published on <FormattedDate iso={report.createdAt} /></p>

          {/* ... rest of the component ... */}

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-100 mb-2 flex items-center gap-1"><FileText className="w-5 h-5" /> Summary</h2>
            <textarea
              value={editableSummary}
              onChange={e => handleChangeAndDebounce(setEditableSummary)(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm rounded-md text-white placeholder:text-neutral-500 whitespace-pre-wrap"
              rows={4}
              placeholder="Enter a brief summary of the report..."
            />
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-100 mb-2 flex items-center gap-1"><Tag className="w-5 h-5" /> Indicators of Compromise (IOCs)</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {editableIOCs.map(ioc => (
                <button key={ioc} onClick={() => removeTag('ioc', ioc)} className="bg-neutral-700 hover:bg-red-700 text-white px-3 py-1 rounded-md font-mono transition-all flex items-center gap-1">
                  {ioc} <span className="text-red-500">×</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add IOC (IP, hash, domain...)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('ioc', (e.target as HTMLInputElement).value);
                }
              }}
              ref={iocInputRef}
              className="w-full sm:w-80 bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm rounded-md text-white placeholder:text-neutral-500"
            />
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-100 mb-2 flex items-center gap-1"><Tag className="w-5 h-5" /> MITRE ATT&CK® Tags</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {editableMitreTags.map(tag => (
                <button key={tag} onClick={() => removeTag('mitre', tag)} className="bg-blue-800 hover:bg-red-700 text-white px-3 py-1 rounded-full transition-all flex items-center gap-1">
                  {tag} <span className="text-red-500">×</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add MITRE tag (e.g., T1059.001)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('mitre', (e.target as HTMLInputElement).value);
                }
              }}
              ref={mitreInputRef}
              className="w-full sm:w-80 bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm rounded-md text-white placeholder:text-neutral-500"
            />
          </section>

          <section className="mb-8">
            <details className="bg-neutral-900 rounded-lg border border-neutral-700/50">
              <summary className="cursor-pointer text-neutral-300 px-4 py-2 font-medium hover:text-white flex items-center gap-1"><FileText className="w-5 h-5" /> View Raw Report Content</summary>
              <textarea
                value={editableContent}
                onChange={e => handleChangeAndDebounce(setEditableContent)(e.target.value)}
                className="w-full p-4 text-sm texttext-neutral-400 bg-transparent whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto border-t border-neutral-700"
                rows={10}
                placeholder="Raw content of the report..."
              />
            </details>
          </section>

          <div className="mt-6 border-t border-neutral-700 pt-4 flex justify-end gap-3 flex-wrap">
            <button onClick={handleDownloadDocx} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2">
              <Download className="w-4 h-4" /> Download DOCX
            </button>
            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md shadow-md flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Report
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportPage;