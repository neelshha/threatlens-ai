'use client';

import React from 'react';
import { FileText } from 'lucide-react';

const WelcomeMessage: React.FC = () => (
  <div className="text-center py-10 px-4 text-neutral-500 flex flex-col items-center">
    <FileText className="w-12 h-12 text-neutral-600 mb-4" />
    <p className="text-lg font-medium text-neutral-300 mb-2">Ready to Analyze</p>
    <p className="text-sm max-w-md">
      Paste the content of a threat intelligence report below. I'll extract the title, summary, IOCs, and MITRE ATT&CK techniques.
    </p>
    <p className="text-xs mt-4">Use Run (⌘+⏎) to start the analysis.</p>
  </div>
);

export default WelcomeMessage; 