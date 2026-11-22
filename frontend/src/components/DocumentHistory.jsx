import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2, 
  Search, 
  Tag, 
  Star, 
  ExternalLink, 
  Download, 
  ChevronRight,
  Filter,
  Check,
  Calendar
} from 'lucide-react';
import { listSavedDocuments, deleteDocumentRecord, updateDocumentRecord } from '../services/api';
import ExportMenu from './ExportMenu';

export default function DocumentHistory({ currentUser, onOpenDocument, onShowToast }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await listSavedDocuments({
        user_id: currentUser?.id,
        search: search || undefined,
        category: selectedCategory || undefined
      });
      setDocuments(data.documents || []);
    } catch (e) {
      if (onShowToast) onShowToast(`Failed to load documents: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [search, selectedCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocumentRecord(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (onShowToast) onShowToast('Document deleted', 'info');
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (e) {
      if (onShowToast) onShowToast(`Delete failed: ${e.message}`, 'error');
    }
  };

  const handleToggleFavorite = async (doc) => {
    const updatedFav = !doc.is_favorite;
    try {
      await updateDocumentRecord(doc.id, { is_favorite: updatedFav });
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, is_favorite: updatedFav } : d))
      );
    } catch (e) {
      if (onShowToast) onShowToast(`Could not update favorite: ${e.message}`, 'error');
    }
  };

  const categories = [
    "All Categories",
    "Notes",
    "Assignment",
    "Question Paper / Exam Paper",
    "Letter",
    "Application",
    "Report",
    "Resume / CV",
    "Invoice / Bill",
    "Receipt",
    "Form",
    "Timetable / Schedule",
    "Meeting Minutes",
    "Study Material",
    "Other / Unknown"
  ];

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved documents by name, content, or tag..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === "All Categories" ? "" : e.target.value)}
            className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid / List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="py-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No saved documents found.</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Transcribe handwriting and click "Save Document" to store and organize them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[180px]">
                      {doc.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(doc)}
                    className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                    title={doc.is_favorite ? 'Favorited' : 'Add to favorites'}
                  >
                    <Star className={`h-4 w-4 ${doc.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* Snippet */}
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {doc.improved_text || doc.original_ocr_text || '(Empty text)'}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <ExportMenu
                  docName={doc.name}
                  originalText={doc.original_ocr_text}
                  improvedText={doc.improved_text}
                />

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenDocument(doc)}
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Open in Workspace"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
