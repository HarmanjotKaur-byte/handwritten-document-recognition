import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Undo2, 
  Redo2, 
  Search, 
  Save, 
  Eye, 
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import DocumentCategoryBadge from './DocumentCategoryBadge';
import FindReplace from './FindReplace';
import ExportMenu from './ExportMenu';
import DocumentActionTools from './DocumentActionTools';
import { classifyDocument, saveDocumentRecord } from '../services/api';

export default function DocumentWorkspace({ 
  result, 
  previewUrl, 
  currentUser,
  onReset,
  onSaveSuccess,
  onShowToast
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [docName, setDocName] = useState(result?.name || 'Handwritten Document');

  // Baseline original OCR text directly from model
  const originalModelText = result?.recognized_text || '';
  
  // Editable text state
  const [documentText, setDocumentText] = useState(result?.improved_text || originalModelText);
  
  // View toggle: 'editable' vs 'original'
  const [viewMode, setViewMode] = useState('editable'); // 'editable' | 'original'

  // Undo / Redo History
  const [historyStack, setHistoryStack] = useState([result?.improved_text || originalModelText]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Automatic AI Document Category
  const [category, setCategory] = useState(result?.category || 'Detecting...');
  const [categoryConfidence, setCategoryConfidence] = useState(result?.category_confidence || 0);
  const [categoryReason, setCategoryReason] = useState(result?.category_reason || '');

  // Find & Replace Panel Toggle
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Automatically classify when text is available
  useEffect(() => {
    if (originalModelText) {
      classifyDocument(originalModelText)
        .then((res) => {
          setCategory(res.category);
          setCategoryConfidence(res.confidence);
          setCategoryReason(res.reason);
        })
        .catch(() => {
          setCategory('Notes');
        });
    }
  }, [originalModelText]);

  // Update text with undo/redo support
  const handleTextEdit = (newVal) => {
    setDocumentText(newVal);
    const newHistory = historyStack.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    setHistoryStack(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      setDocumentText(historyStack[prev]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      setDocumentText(historyStack[next]);
    }
  };

  // Rollback to original model output
  const handleRollbackToOriginal = () => {
    handleTextEdit(originalModelText);
    setViewMode('editable');
    if (onShowToast) onShowToast('Rolled back text to original model transcription!', 'info');
  };

  const handleSaveDocument = async () => {
    setIsSaving(true);
    try {
      const docPayload = {
        user_id: currentUser?.id,
        name: docName,
        original_ocr_text: originalModelText,
        improved_text: documentText,
        category,
        category_confidence: categoryConfidence,
        category_reason: categoryReason,
        category_is_confirmed: true,
        tags: [category.toLowerCase()],
        provider: result?.provider || 'Google Vision / Gemini',
        processing_time_ms: result?.processing_time_ms || 0
      };
      await saveDocumentRecord(docPayload);
      if (onShowToast) onShowToast('Document saved successfully to My Documents!', 'success');
      if (onSaveSuccess) onSaveSuccess();
    } catch (e) {
      if (onShowToast) onShowToast(`Save failed: ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isModifiedFromOriginal = documentText !== originalModelText;

  return (
    <div className="space-y-4">
      {/* Top Navigation Row: Back to Dashboard without disturbing card layout */}
      {onReset && (
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors space-y-6">
        
        {/* 1. Header Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Document Title & Automatic Category */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500"
              />
              <div className="mt-1">
                <DocumentCategoryBadge
                  category={category}
                  confidence={categoryConfidence}
                  reason={categoryReason}
                />
              </div>
            </div>
          </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSaveDocument}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Document'}</span>
          </button>

          <ExportMenu
            docName={docName}
            originalText={originalModelText}
            improvedText={documentText}
          />

          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Document</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Workspace Body */}
      <div className="px-5 pb-6 space-y-6">
        
        {/* Understanding Tools: Summarize, Key Points, and Clickable Q&A */}
        <DocumentActionTools
          currentText={documentText}
          onShowMessage={onShowToast}
        />

        {/* Side-by-Side Document Inspection Area */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          
          {/* Left Panel: Original Handwriting Document (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Layers className="h-3.5 w-3.5 text-blue-500" />
                Original Document
              </span>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                  className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3 w-3" />
                </button>
                <span className="text-[10px] font-mono w-10 text-center font-bold text-slate-700 dark:text-slate-300">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(250, z + 15))}
                  className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3 w-3" />
                </button>
                <div className="h-3 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 hover:text-slate-900 dark:hover:text-white text-[10px] font-mono cursor-pointer"
                  title="Reset Zoom"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Document Image View */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 p-4 min-h-[380px] max-h-[520px] overflow-auto flex items-center justify-center">
              {previewUrl ? (
                <div 
                  className="relative transition-transform duration-150 inline-block"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                >
                  <img
                    src={previewUrl}
                    alt="Handwritten document"
                    className="max-h-[460px] max-w-full object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-700 select-none"
                  />
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 dark:text-slate-500 p-8">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">Demonstration Sample Document</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Transcribed Text Area with View Toggles and Rollback (7 cols) */}
          <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
            
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                {/* View Toggles: Editable vs Original Model Output */}
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('editable')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'editable'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Editable Text</span>
                  </button>

                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'original'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    <span>Original Output</span>
                  </button>
                </div>

                {/* Rollback & Edit Utilities */}
                <div className="flex items-center gap-1.5">
                  {/* Rollback Button if user made changes */}
                  {isModifiedFromOriginal && (
                    <button
                      onClick={handleRollbackToOriginal}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Discard manual edits and restore the exact text originally produced by the model"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Rollback to Original</span>
                    </button>
                  )}

                  {viewMode === 'editable' && (
                    <>
                      <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Undo"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={handleRedo}
                        disabled={historyIndex >= historyStack.length - 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Redo"
                      >
                        <Redo2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setShowFindReplace(!showFindReplace)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Find and Replace"
                      >
                        <Search className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Inline Find & Replace Panel */}
              {showFindReplace && viewMode === 'editable' && (
                <div className="mb-3">
                  <FindReplace
                    text={documentText}
                    onReplaceText={(newText) => handleTextEdit(newText)}
                    onClose={() => setShowFindReplace(false)}
                  />
                </div>
              )}

              {/* Active Text Area */}
              {viewMode === 'editable' ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Editable transcription</span>
                    {isModifiedFromOriginal && (
                      <span className="text-amber-500 font-medium">Modified from original</span>
                    )}
                  </div>
                  <textarea
                    value={documentText}
                    onChange={(e) => handleTextEdit(e.target.value)}
                    rows={15}
                    className="w-full min-h-[360px] max-h-[480px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-white font-sans text-sm p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none shadow-inner leading-relaxed"
                    placeholder="No text recognized."
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-blue-500 dark:text-blue-400 font-semibold">
                    <span>Original Model Output (Read-Only Reference)</span>
                    <button
                      onClick={handleRollbackToOriginal}
                      className="text-xs text-blue-600 dark:text-blue-400 underline cursor-pointer"
                    >
                      Use this version
                    </button>
                  </div>
                  <textarea
                    value={originalModelText}
                    readOnly
                    rows={15}
                    className="w-full min-h-[360px] max-h-[480px] rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-slate-950 text-slate-300 font-mono text-sm p-4 focus:outline-none resize-none shadow-inner leading-relaxed cursor-not-allowed select-text"
                  />
                </div>
              )}
            </div>

            {/* Character & Word Metrics */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span>
                {documentText.length} characters • {documentText.split(/\s+/).filter(Boolean).length} words
              </span>
              <span>
                Original: {originalModelText.length} characters
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
  );
}
