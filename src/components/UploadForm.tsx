'use client';

 import { useState, useEffect, useRef, useCallback } from 'react';
 import { useRouter } from 'next/navigation';
 import axios from 'axios';
 import toast from 'react-hot-toast';
 import { Send, CheckCircle, AlertTriangle } from 'lucide-react';
 import Link from 'next/link';

 const MAX_HEIGHT = 160;
 const MESSAGE_MAX_WIDTH = '80%'; // Adjusted for better mobile view
 const DESKTOP_MESSAGE_MAX_WIDTH = '70%';

 const UploadForm = () => {
   const [content, setContent] = useState('');
   const [summary, setSummary] = useState('');
   const [loading, setLoading] = useState(false);
   const [sentContent, setSentContent] = useState(''); // To display the sent message
   const router = useRouter();
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const textareaRef = useRef<HTMLTextAreaElement>(null);
   const [isDesktop, setIsDesktop] = useState(false);

   useEffect(() => {
     const handleResize = () => {
       setIsDesktop(window.innerWidth >= 768); // Adjust breakpoint as needed
     };

     handleResize();
     window.addEventListener('resize', handleResize);

     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, []);

   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [summary, sentContent]); // Scroll on new AI response or sent message

   const resizeTextarea = useCallback(() => {
     const textarea = textareaRef.current;
     if (textarea) {
       textarea.style.height = 'auto';
       const scrollHeight = textarea.scrollHeight;
       textarea.style.height = Math.min(scrollHeight, MAX_HEIGHT) + 'px';
     }
   }, []);

   useEffect(() => {
     resizeTextarea();
   }, [resizeTextarea, content]);

   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     setContent(e.target.value);
     resizeTextarea();
   };

   const handleSubmit = async () => {
     if (!content.trim()) {
       toast.error('Please paste a threat report to analyze.');
       return;
     }

     setLoading(true);
     setSentContent(content); // Display the content as sent
     const userMessage = content;
     setContent(''); // Clear the input field

     axios
       .post('/api/parse', { content: userMessage })
       .then((res) => {
         setSummary(res.data.summary);
         toast.success('Report analyzed successfully!', {
           icon: <CheckCircle className="text-green-500 w-5 h-5" />,
         });
       })
       .catch((err) => {
         setSentContent(''); // Clear sent message on error
         let errorMessage = 'An error occurred.';
         if (err instanceof Error) {
           errorMessage = err.message || errorMessage;
         }
         toast.error(`Analysis failed: ${errorMessage}`, {
           icon: <AlertTriangle className="text-red-500 w-5 h-5" />,
         });
       })
       .finally(() => {
         setLoading(false);
       });
   };

   return (
     <section className="min-h-screen flex flex-col items-center justify-end py-6 bg-gray-950">
       <div className="w-full max-w-[90%] flex flex-col h-full">
         <div className="flex-grow overflow-y-auto flex flex-col gap-2 pb-6">
           {sentContent && (
             <div
               className="bg-blue-600 text-white rounded-xl p-4 border border-blue-700 shadow-md self-end"
               style={{ maxWidth: isDesktop ? DESKTOP_MESSAGE_MAX_WIDTH : MESSAGE_MAX_WIDTH }}
             >
               <p className="leading-relaxed text-sm break-words">{sentContent}</p>
             </div>
           )}
           {summary && (
             <div className="bg-none self-start my-3 w-full">
               <div className="flex items-start gap-2">
                 <p className="leading-relaxed text-sm break-words">{summary}</p>
               </div>
               <div ref={messagesEndRef} />
             </div>
           )}
           <div ref={messagesEndRef} /> {/* Ensure latest message is always in view */}
         </div>

         <div className="mt-auto w-full">
           <div className="mb-3">
             <textarea
               ref={textareaRef}
               className={`w-full min-h-[60px] max-h-[${MAX_HEIGHT}px] px-4 py-2 rounded-lg focus:outline-none bg-gray-800 text-white placeholder:text-gray-500 border border-gray-700 shadow-sm transition-all duration-200 text-sm resize-none`}
               placeholder="Paste threat report here..."
               value={content}
               onChange={handleInputChange}
               style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
             />
             <style jsx>{`
               textarea::-webkit-resizer {
                 display: none;
               }
             `}</style>
           </div>
           <div className="flex justify-end">
             <button
               onClick={handleSubmit}
               disabled={loading}
               className={`px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md
                         transition-all duration-200 hover:bg-blue-600
                         active:bg-blue-700 flex items-center gap-2 text-sm ${
                           loading ? 'opacity-50 cursor-not-allowed' : ''
                         }`}
             >
               {loading ? (
                 <>Analyzing...</>
               ) : (
                 <>
                   <Send className="w-4 h-4" />
                   Analyze
                 </>
               )}
             </button>
           </div>
         </div>
       </div>
     </section>
     );
 };

 export default UploadForm;