import React, { useState } from 'react';
import { UploadCloud, PenTool, Image as ImageIcon } from 'lucide-react';
import ImageAdjustmentPanel from '../components/ImageAdjustmentPanel';
import DrawingCanvas from '../components/DrawingCanvas';
import DocumentWorkspace from '../components/DocumentWorkspace';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { predictImage, predictSample } from '../services/api';

export default function Recognize({ 
  samples = [], 
  currentUser,
  inputMode = 'upload',
  setInputMode,
  onNewRecognition, 
  activeLoadedDoc, 
  onClearLoadedDoc,
  onShowToast 
}) {
  const [internalMode, setInternalMode] = useState('upload');
  const activeInputMode = setInputMode ? inputMode : internalMode;
  const setActiveInputMode = setInputMode || setInternalMode;

  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // If a saved document was opened from My Documents, display it directly
  const displayResult = activeLoadedDoc || result;

  const handleProcessFile = async (file, sourceName = 'upload') => {
    setError(null);
    setIsProcessing(true);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const data = await predictImage(file);
      setResult(data);
      if (onNewRecognition) {
        onNewRecognition({
          ...data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: sourceName,
          previewUrl: objectUrl
        });
      }
    } catch (err) {
      setError(err.message || 'Recognition failed. Please try again.');
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSample = async (sampleId) => {
    setError(null);
    setIsProcessing(true);
    setResult(null);

    const sample = samples.find((s) => s.id === sampleId);
    setPreviewUrl(sample?.image_url || (sample?.name ? `/samples/${sample.name}` : null));

    try {
      const data = await predictSample(sampleId);
      setResult(data);
      if (onNewRecognition) {
        onNewRecognition({
          ...data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: `sample (${sample?.filename || sampleId})`,
          previewUrl: null
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to process sample image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPreviewUrl(null);
    if (onClearLoadedDoc) onClearLoadedDoc();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title (only show when not viewing a result) */}
      {!displayResult && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeInputMode === 'upload' ? 'Upload Documents' : 'Drawing Canvas'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Transform your documents with intelligent multimodal OCR processing.
            </p>
          </div>
        </div>
      )}

      {/* When result is ready, show Post-OCR Document Workspace; otherwise show input area */}
      {displayResult ? (
        <DocumentWorkspace
          result={displayResult}
          previewUrl={previewUrl}
          currentUser={currentUser}
          onReset={handleReset}
          onShowToast={onShowToast}
          onSaveSuccess={() => {
            if (onShowToast) onShowToast('Saved to My Documents!', 'success');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-8 space-y-6">
            {activeInputMode === 'upload' ? (
              <ImageAdjustmentPanel
                onImageReady={(file) => handleProcessFile(file, 'image_upload')}
                samples={samples}
                onSelectSample={handleSelectSample}
                isProcessing={isProcessing}
              />
            ) : (
              <DrawingCanvas
                onRecognizeCanvas={(file) => handleProcessFile(file, 'drawing_canvas')}
                isProcessing={isProcessing}
              />
            )}
          </div>

          {/* Right Column: Status & Upload Tips Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upload Tips Card Matching Readur Reference */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <span className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  📋
                </span>
                <span>Upload Tips</span>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>For best OCR results, use clear, high-resolution handwriting images.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Ensure handwritten documents are well-lit and clearly oriented.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Supports PNG, JPG, JPEG, and WebP up to 10MB per document.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>You can also test instantly using the Teacher benchmark samples below.</span>
                </li>
              </ul>
            </div>

            {error && (
              <ErrorMessage 
                title="Could Not Transcribe Image" 
                message={error} 
                onRetry={handleReset}
              />
            )}

            {isProcessing && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <LoadingIndicator message="Transcribing handwritten document..." />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
