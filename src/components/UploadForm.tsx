'use client';

import React from 'react'; // Explicit React import
import { useState, useEffect, useRef, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Plus, Command, CornerDownLeft, Loader2, AlertCircle, Send, FileText, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

const MAX_HEIGHT = 160;
type MessageStatus = 'pending' | 'complete' | 'error';
interface Message { id: string; type: 'user' | 'ai'; text: string; status?: MessageStatus; reportId?: string; }
const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Components (ThinkingIndicator, WelcomeMessage, ReportLink - No changes needed) ---
const ThinkingIndicator = () => ( <div className="flex items-center space-x-1.5 p-1"> <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span> <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span> <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span> </div> );
const WelcomeMessage = () => ( <div className="text-center py-10 px-4 text-neutral-500 flex flex-col items-center"> <FileText className="w-12 h-12 text-neutral-600 mb-4" /> <p className="text-lg font-medium text-neutral-300 mb-2">Ready to Analyze</p> <p className="text-sm max-w-md"> Paste the content of a threat intelligence report below. I'll extract the title, summary, IOCs, and MITRE ATT&CK techniques. </p> <p className="text-xs mt-4">Use Run (⌘+⏎) to start the analysis.</p> </div> );
const ReportLink = ({ reportId }: { reportId: string }) => ( <Link href={`/dashboard/${reportId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline mt-3 font-medium group" > View Full Report <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" /> </Link> );
// --- End Components ---

const UploadForm = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // console.log('Resizing...'); // Debug log
      textarea.style.height = 'auto'; // Reset first
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 40;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, MAX_HEIGHT));
      // console.log(`ScrollHeight: ${scrollHeight}, New Height: ${newHeight}`); // Debug log
      textarea.style.height = `${newHeight}px`;
    }
  }, []); // Dependencies are correct (none)

  // Effect to resize textarea when input changes
  useEffect(() => {
    // console.log('Input changed, calling resize.'); // Debug log
    resizeTextarea();
  }, [input, resizeTextarea]); // Correct dependencies

  // Effect to scroll chat to bottom
  useEffect(() => {
    // console.log('Messages updated, scrolling.'); // Debug log
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // Correct dependency

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // console.log('Input change event'); // Debug log
    setInput(e.target.value);
    // Resizing is handled by the useEffect watching 'input'
  };

  const handleSubmit = useCallback(async () => { // Wrap in useCallback
    // console.log('handleSubmit triggered'); // Debug log
    const trimmedInput = input.trim();

    // Check conditions *before* setting loading (important!)
    if (!trimmedInput || isLoading) {
        console.log(`Submit blocked: trimmedInput empty=${!trimmedInput}, isLoading=${isLoading}`); // Debug log
        return;
    }

    console.log('Setting loading TRUE'); // Debug log
    setIsLoading(true);
    const interactionId = generateId();
    const userMessage: Message = { id: `${interactionId}-user`, type: 'user', text: trimmedInput };
    const aiPlaceholderMessage: Message = { id: `${interactionId}-ai`, type: 'ai', text: '', status: 'pending' };

    // IMPORTANT: Use functional update if clearing based on previous state (though here we replace)
    setMessages([userMessage, aiPlaceholderMessage]);
    setInput('');
    // Use requestAnimationFrame to ensure DOM updates happen before resize/scroll
    requestAnimationFrame(() => {
        resizeTextarea(); // Resize *after* clearing input
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    try {
      console.log('Sending request to /api/parse'); // Debug log
      const res = await axios.post<{ summary: string; reportId: string }>('/api/parse', { content: trimmedInput });
      console.log('Received response:', res.data); // Debug log

      if (!res.data?.summary || !res.data?.reportId) {
        console.error('Incomplete data received:', res.data); // Debug log
        throw new Error('Incomplete analysis data received.');
      }
      const { summary, reportId } = res.data;

      setMessages(prev => prev.map(msg => msg.id === aiPlaceholderMessage.id ? { ...msg, text: summary, status: 'complete', reportId: reportId } : msg ));
      console.log('Messages updated with success'); // Debug log

    } catch (error: unknown) {
      console.error("Analysis error in handleSubmit:", error); // Debug log
      let errorText = 'An unknown error occurred.';
       if (axios.isAxiosError(error)) { const axiosError = error as AxiosError<{ error?: string; details?: string[] }>; const serverError = axiosError.response?.data?.error; const serverDetails = axiosError.response?.data?.details; if (serverError) { errorText = serverError + (serverDetails ? ` (${serverDetails.join(', ')})` : ''); } else if (axiosError.message) { errorText = axiosError.message; } else { errorText = `Request failed with status ${axiosError.response?.status || 'unknown'}`; } } else if (error instanceof Error) { errorText = error.message; }

      setMessages(prev => prev.map(msg => msg.id === aiPlaceholderMessage.id ? { ...msg, text: `⚠️ Analysis Failed: ${errorText}`, status: 'error' } : msg ));
      setInput(trimmedInput); // Restore input on error
      requestAnimationFrame(resizeTextarea); // Re-resize required after restoring input

      console.log('Messages updated with error'); // Debug log

    } finally {
      console.log('Setting loading FALSE'); // Debug log
      setIsLoading(false); // CRITICAL: Ensure this always runs
    }
  // Add dependencies for useCallback
  }, [input, isLoading, resizeTextarea]);

  const handleNewChat = useCallback(() => { // Wrap in useCallback
    // console.log('handleNewChat triggered'); // Debug log
    setMessages([]);
    setInput('');
    setIsLoading(false);
    requestAnimationFrame(resizeTextarea);
  }, [resizeTextarea]); // Dependency

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => { // Wrap in useCallback
    // console.log('Key Down Event:', { key: e.key, meta: e.metaKey, ctrl: e.ctrlKey, isLoading }); // Debug log
    // Check modifier FIRST, then Enter key, then loading state
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        console.log('Cmd/Ctrl+Enter detected'); // Debug log
      e.preventDefault(); // Prevent newline ONLY if submitting
      if (!isLoading && input.trim()) { // Also check input trim here
          console.log('Calling handleSubmit from keydown'); // Debug log
          handleSubmit();
      } else {
          console.log(`Submit via keydown blocked: isLoading=${isLoading}, input empty=${!input.trim()}`); // Debug log
      }
    }
  // Add dependencies for useCallback
  }, [isLoading, input, handleSubmit]);


  return (
    <section className="min-h-screen flex flex-col bg-neutral-950 text-white" aria-busy={isLoading}>
      {/* Chat History Area */}
      <div className="flex-grow overflow-y-auto px-4 pt-6 pb-28 w-full max-w-5xl mx-auto relative" aria-live="polite" >
        {messages.length === 0 && !isLoading ? ( <WelcomeMessage /> ) : (
            messages.map((msg) => (
                <div key={msg.id} className={`mb-5 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-xl py-2 px-3 max-w-[85%] shadow-md relative ${ msg.type === 'user' ? 'bg-blue-600 text-white' : msg.status === 'error' ? 'bg-red-800/90 border border-red-600/50 text-red-100' : 'bg-neutral-700 text-white' }`}>
                        {msg.type === 'ai' && msg.status === 'pending' ? ( <ThinkingIndicator /> ) : (
                            <>
                                <div className={`prose prose-sm prose-invert max-w-none [&>p]:my-0 break-words whitespace-pre-wrap`}>
                                    <ReactMarkdown components={{ a: (props: React.ComponentPropsWithoutRef<'a'>) => ( <a target="_blank" rel="noopener noreferrer" {...props} /> ) }}>
                                        {msg.type === 'ai' && msg.status === 'complete' ? `**Analysis Summary:**\n\n${msg.text}` : msg.text}
                                    </ReactMarkdown>
                                </div>
                                {msg.type === 'ai' && msg.status === 'complete' && msg.reportId && ( <ReportLink reportId={msg.reportId} /> )}
                           </>
                        )}
                    </div>
                </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Wrapper (Sticky) */}
       <div className="w-full px-4 pb-4 sticky bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent z-10">
         <div className="w-full max-w-5xl mx-auto flex items-end gap-2 p-2 bg-neutral-800 rounded-xl shadow-lg border border-neutral-700/50">
           {/* Textarea */}
           <textarea
             ref={textareaRef}
             className="flex-grow bg-transparent text-neutral-200 placeholder:text-neutral-500 resize-none border-none focus:outline-none focus:ring-0 text-sm px-3 py-2 min-h-[40px] leading-snug" // Ensure min-h is set
             placeholder="Paste report content here..."
             value={input}
             onChange={handleInputChange}
             onKeyDown={handleKeyDown} // Correct prop name
             // Removed rows={1} - rely on min-h and JS resize
             style={{
               maxHeight: `${MAX_HEIGHT}px`,
               scrollbarWidth: 'none',
               msOverflowStyle: 'none',
             }}
             disabled={isLoading}
             aria-label="Threat report input"
           />
           <style jsx>{`textarea::-webkit-scrollbar { display: none; }`}</style>
           {/* Buttons */}
           <button
             onClick={handleNewChat} // Use direct function ref
             title="New Chat"
             className="p-2 rounded-lg text-neutral-400 bg-neutral-700/60 hover:bg-neutral-700 hover:text-neutral-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-800 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
             disabled={isLoading}
             aria-label="Start new chat"
           >
              <Plus className="w-5 h-5" />
           </button>
           <button
             onClick={handleSubmit} // Use direct function ref
             disabled={isLoading || !input.trim()}
             title="Run Analysis (Cmd+Enter)"
             className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-700/80 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${isLoading ? 'cursor-wait' : ''}`}
             aria-label={isLoading ? "Analyzing..." : "Run Analysis"}
           >
              {isLoading ? ( <Loader2 className="w-4 h-4 animate-spin" /> ) : ( input.trim() ? ( <> <span>Run</span> <Command className="w-4 h-4 opacity-80" /> <CornerDownLeft className="w-4 h-4 opacity-80" /> </> ) : ( <Send className="w-4 h-4" /> ) )}
            </button>
         </div>
       </div>
    </section>
  );
};

export default UploadForm;