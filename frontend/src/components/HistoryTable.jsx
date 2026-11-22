import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  X, 
  Edit3, 
  Search,
  Download
} from 'lucide-react';

export default function HistoryTable({ 
  history = [], 
  onClearHistory, 
  onDeleteHistoryItem, 
  onUpdateHistoryItem,
  onSelectHistoryItem
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleCopyText = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.recognized_text || '');
  };

  const saveEdit = (id) => {
    if (onUpdateHistoryItem) {
      onUpdateHistoryItem(id, editText);
    }
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, recognized_text: editText });
    }
    setEditingId(null);
  };

  const handleDownloadItemTxt = (item) => {
    if (!item?.recognized_text) return;
    const blob = new Blob([item.recognized_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcription_${item.timestamp.replace(/[: ]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter((item) => {
    if (!searchFilter) return true;
    const text = (item.recognized_text || '').toLowerCase();
    const q = searchFilter.toLowerCase();
    return text.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
        {/* Header bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <History className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">My Saved Transcriptions</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {history.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                View, search, edit, or copy previous handwriting transcriptions
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                title="Clear all stored items"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter bar if items exist */}
        {history.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search transcribed text..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              {filteredHistory.length} items
            </span>
          </div>
        )}

        {/* Content */}
        {history.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No transcriptions saved yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Upload a document image or write on the drawing canvas to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Transcribed Text</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-md truncate">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-blue-500 rounded text-xs w-full"
                          />
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span>{item.recognized_text || <span className="text-slate-400 italic">No text</span>}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyText(item.id, item.recognized_text)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadItemTxt(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Download as TXT"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit text"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          title="Open document"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHistoryItem && onDeleteHistoryItem(item.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Inspection & Edit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Transcription Details</h4>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedItem.previewUrl && (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <img
                  src={selectedItem.previewUrl}
                  alt="Snapshot"
                  className="max-h-36 object-contain rounded-xl shadow-2xs"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transcribed Text</span>
                <span className="text-[11px] text-slate-400">Edit below if needed</span>
              </div>
              <textarea
                value={selectedItem.recognized_text || ''}
                onChange={(e) => {
                  const updated = e.target.value;
                  setSelectedItem({ ...selectedItem, recognized_text: updated });
                  if (onUpdateHistoryItem) {
                    onUpdateHistoryItem(selectedItem.id, updated);
                  }
                }}
                rows={6}
                className="w-full p-3.5 rounded-2xl bg-slate-900 text-white font-sans text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="text-xs text-slate-400">
              Transcribed on {selectedItem.timestamp}
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(selectedItem.id, selectedItem.recognized_text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {copiedId === selectedItem.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => handleDownloadItemTxt(selectedItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
