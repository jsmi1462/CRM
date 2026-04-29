import { useState, useEffect } from 'react';
import type { Lead } from '../types';
import { useStore } from '../stores/useStore';

interface AIActionModalProps {
  lead: Lead;
  action: 'draft' | 'summarize';
  onClose: () => void;
}

export default function AIActionModal({ lead, action, onClose }: AIActionModalProps) {
  const { generateFollowUp, summarizeNotes } = useStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function runAction() {
      setLoading(true);
      setError('');
      try {
        let result = '';
        if (action === 'draft') {
          result = await generateFollowUp(lead.id);
        } else {
          result = await summarizeNotes(lead.id);
        }
        setContent(result);
      } catch (err) {
        setError(String(err));
        // Fallback for demo/development if backend not ready
        if (String(err).includes('command not found') || String(err).includes('unknown variant')) {
          setTimeout(() => {
             if (action === 'draft') {
               setContent(`Hi ${lead.name.split(' ')[0]},\n\nIt was great connecting with you recently. I wanted to follow up on our conversation regarding PubMetric and see if you had any further questions.\n\nBest regards,\n[Your Name]`);
             } else {
               setContent(lead.notes ? `Summary: ${lead.notes.substring(0, 50)}...` : 'No notes to summarize.');
             }
             setLoading(false);
          }, 1000);
          return;
        }
      } finally {
        setLoading(false);
      }
    }
    runAction();
  }, [action, lead, generateFollowUp, summarizeNotes]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const title = action === 'draft' ? 'Draft Follow-up' : 'Summarize Notes';
  const icon = action === 'draft' ? <MagicIcon /> : <SummaryIcon />;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-cozy-border bg-warm-50/50">
          <div className="flex items-center gap-2">
            <span className="text-warm-600">{icon}</span>
            <h2 className="text-lg font-semibold text-cozy-text">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-cozy-muted hover:text-cozy-text transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin"></div>
              <p className="text-sm text-cozy-muted animate-pulse">Consulting Claude...</p>
            </div>
          ) : error && !content ? (
            <div className="py-8 text-center">
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-64 p-4 rounded-xl border border-cozy-border bg-white text-sm text-cozy-text focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent resize-none leading-relaxed"
                  placeholder="AI output will appear here..."
                />
                <div className="absolute top-2 right-2 flex gap-2">
                   {/* Optional: Add a "Regenerate" button here later */}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-cozy-muted">
                  You can edit this text before copying.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-cozy-border text-cozy-text text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-warm-600 hover:bg-warm-700 text-white'
                    }`}
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function MagicIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 1.912 4.912L18.824 9.824 13.912 11.736 12 16.648 10.088 11.736 5.176 9.824 10.088 7.912 12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
