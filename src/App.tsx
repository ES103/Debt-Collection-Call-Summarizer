/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { summarizeTranscript } from './services/gemini';
import ReactMarkdown from 'react-markdown';
import { Loader2, FileText, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const result = await summarizeTranscript(transcript);
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm">
            <ClipboardList className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Debt Collection Call Summarizer
          </h1>
        </div>
        <p className="text-gray-500 max-w-2xl ml-13">
          Paste your call transcript below to generate structured, compliance-safe internal case notes.
        </p>
      </header>

      <main className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Transcript Input
            </h2>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
              RAW TEXT
            </span>
          </div>
          
          <div className="flex-1 relative">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste call transcript here..."
              className="w-full h-full p-6 resize-none focus:outline-none text-gray-600 font-mono text-sm leading-relaxed placeholder:text-gray-300"
              spellCheck={false}
            />
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button
              onClick={handleSummarize}
              disabled={isLoading || !transcript.trim()}
              className="bg-black text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Generate Summary
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-medium text-gray-700 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              Structured Notes
            </h2>
            {summary && !isLoading && (
              <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                READY
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-white relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                  <p className="text-sm font-medium animate-pulse">Analyzing transcript...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center p-8"
                >
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-2">Generation Failed</h3>
                  <p className="text-gray-500 text-sm max-w-xs">{error}</p>
                </motion.div>
              ) : summary ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm prose-slate max-w-none prose-headings:font-medium prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
                >
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-300"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                    <FileText className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-sm">Summary will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
