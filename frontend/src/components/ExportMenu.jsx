import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { exportDocumentFile } from '../services/api';

export default function ExportMenu({ docName, originalText, improvedText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [version, setVersion] = useState('improved'); // 'original' | 'improved' | 'both'
  const [downloading, setDownloading] = useState(null);
  const [copied, setCopied] = useState(false);

  const getTargetText = () => {
    if (version === 'original') return originalText || '';
    if (version === 'improved') return improvedText || originalText || '';
    return `--- ORIGINAL OCR OUTPUT ---\n${originalText}\n\n--- IMPROVED TEXT ---\n${improvedText || originalText}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getTargetText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format) => {
    setDownloading(format);
    try {
      await exportDocumentFile({
        docName: docName || 'document',
        originalText,
        improvedText,
        version,
        format
      });
    } catch (e) {
      alert(`Export failed: ${e.message}`);
    } finally {
      setDownloading(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export</span>
        <ChevronDown className="h-3 w-3 opacity-70 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-4 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                1. Select Version to Export
              </span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  onClick={() => setVersion('improved')}
                  className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    version === 'improved'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Improved
                </button>
                <button
                  onClick={() => setVersion('original')}
                  className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    version === 'original'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setVersion('both')}
                  className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    version === 'both'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Both
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                2. Choose Format
              </span>

              <div className="space-y-1">
                <button
                  onClick={() => handleExport('txt')}
                  disabled={downloading !== null}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Plain Text (.txt)
                  </span>
                  {downloading === 'txt' && <span className="text-[10px] text-blue-500">Saving...</span>}
                </button>

                <button
                  onClick={() => handleExport('docx')}
                  disabled={downloading !== null}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Word Document (.docx)
                  </span>
                  {downloading === 'docx' && <span className="text-[10px] text-blue-500">Saving...</span>}
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  disabled={downloading !== null}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-rose-500" />
                    PDF Document (.pdf)
                  </span>
                  {downloading === 'pdf' && <span className="text-[10px] text-blue-500">Saving...</span>}
                </button>

                <button
                  onClick={() => handleExport('json')}
                  disabled={downloading !== null}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-emerald-500" />
                    Structured Data (.json)
                  </span>
                  {downloading === 'json' && <span className="text-[10px] text-blue-500">Saving...</span>}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCopy}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
