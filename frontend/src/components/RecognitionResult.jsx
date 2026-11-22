import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Clock, 
  Gauge, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Cpu,
  Edit3,
  List,
  Layers
} from 'lucide-react';

export default function RecognitionResult({ result, previewUrl, onReset }) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [editableText, setEditableText] = useState(result?.recognized_text || '');
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'blocks' | 'words'

  useEffect(() => {
    if (result?.recognized_text) {
      setEditableText(result.recognized_text);
    }
  }, [result]);

  if (!result) return null;

  const handleCopy = () => {
    if (editableText) {
      navigator.clipboard.writeText(editableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadText = () => {
    if (!editableText) return;
    const blob = new Blob([editableText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `handwriting_transcription_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const paragraphs = result.paragraphs || [];
  const words = result.words || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recognition Results</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
            {result.provider || 'Google Vision'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>{result.processing_time_ms ? `${Math.round(result.processing_time_ms)} ms` : '--'}</span>
          </div>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Recognize Another</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Side-by-side or stacked preview and output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Image Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ImageIcon className="h-3.5 w-3.5" />
                Original Input Image
              </span>
              {result.image_dimensions && (
                <span className="font-mono text-[11px]">
                  {result.image_dimensions.width} × {result.image_dimensions.height} px
                </span>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 flex items-center justify-center min-h-[160px] max-h-[260px] overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Handwriting input"
                  className="max-h-[220px] max-w-full object-contain rounded-lg shadow-2xs"
                />
              ) : (
                <div className="text-center text-xs text-slate-400 dark:text-slate-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                  <span>Demonstration Reference Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Transcribed Text Output Card */}
          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                  Transcribed Output (Editable)
                </span>
                <span className="text-[11px] text-slate-400">
                  Edit before exporting
                </span>
              </div>

              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-white font-mono text-sm sm:text-base p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y shadow-inner"
                placeholder="No text recognized."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadText}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                {downloaded ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Download className="h-4 w-4" />}
                <span>{downloaded ? 'Downloaded' : 'Download as TXT'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Structural Inspection Tabs (Paragraphs & Words) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Paragraph Structure ({paragraphs.length})
            </button>
            <button
              onClick={() => setActiveTab('words')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'words'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Word Breakdown ({words.length})
            </button>
          </div>

          {activeTab === 'text' && (
            <div className="space-y-2">
              {paragraphs.map((p, pIdx) => (
                <div key={pIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  <span className="text-[10px] text-blue-500 font-bold mr-2">¶ {pIdx + 1}</span>
                  {p.text}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'words' && (
            <div className="flex flex-wrap gap-2">
              {words.map((w, wIdx) => (
                <span
                  key={wIdx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono border border-slate-200 dark:border-slate-700"
                >
                  {w.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
