import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Image as ImageIcon, 
  FileCheck2, 
  Play, 
  AlertCircle 
} from 'lucide-react';

export default function ImageAdjustmentPanel({ 
  onImageReady, 
  samples = [], 
  onSelectSample, 
  isProcessing 
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [validationError, setValidationError] = useState(null);

  const validateAndSetFile = (file) => {
    setValidationError(null);
    if (!file) return;

    // Validate size (max 10MB)
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 10) {
      setValidationError(`File size (${sizeMb.toFixed(1)} MB) exceeds 10 MB limit.`);
      return;
    }

    // Validate type (Images + Short/Long PDFs)
    const validTypes = [
      'image/png', 
      'image/jpeg', 
      'image/jpg', 
      'image/bmp', 
      'image/webp',
      'application/pdf'
    ];
    const isPdfByName = file.name.toLowerCase().endsWith('.pdf');
    if (!validTypes.includes(file.type) && !isPdfByName) {
      setValidationError('Unsupported format. Please upload PNG, JPG, JPEG, BMP, WebP or PDF.');
      return;
    }

    setSelectedFile(file);
    setRotationAngle(0);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRotationAngle(0);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rotateImage = (direction) => {
    setRotationAngle((prev) => (prev + (direction === 'cw' ? 90 : -90) + 360) % 360);
  };

  const handleRecognize = () => {
    if (!selectedFile) return;

    // If rotation angle is 0, send file directly
    if (rotationAngle === 0) {
      onImageReady(selectedFile);
      return;
    }

    // Otherwise render rotated image to offscreen canvas and export as new File
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const rads = (rotationAngle * Math.PI) / 180;
      
      const is90or270 = rotationAngle % 180 !== 0;
      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rads);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        if (blob) {
          const rotatedFile = new File([blob], `rotated_${selectedFile.name}`, { type: 'image/png' });
          onImageReady(rotatedFile);
        }
      }, 'image/png');
    };
  };

  return (
    <div className="space-y-6">
      {/* Upload & Drop Card - Purple & White Readur Style */}
      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 ${
            dragOver 
              ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 scale-[0.99]' 
              : 'border-purple-200 dark:border-purple-900/40 hover:border-purple-500 bg-white dark:bg-slate-900 hover:bg-purple-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/bmp,image/webp,application/pdf,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/25">
            <UploadCloud className="h-8 w-8" />
          </div>

          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Drop files here
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            or click to browse your computer
          </p>

          <div className="mt-4">
            <span className="inline-flex items-center px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20">
              Choose Files
            </span>
          </div>

          {/* Formats pill row */}
          <div className="flex items-center justify-center gap-2 mt-5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">PDF (Multi-page)</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">PNG</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Images</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">JPG</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Maximum file size: 10MB • Supports Short & Long Multi-Page PDFs</p>

          {validationError && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
              <AlertCircle className="h-4 w-4" />
              {validationError}
            </div>
          )}
        </div>
      ) : (
        /* Image Adjustment & Preview View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Metadata Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block truncate max-w-xs">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Rotation: {rotationAngle}°
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => rotateImage('ccw')}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                title="Rotate 90° Counter-Clockwise"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => rotateImage('cw')}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="p-6 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center min-h-[160px] overflow-hidden">
            {selectedFile?.name?.toLowerCase().endsWith('.pdf') ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 shadow-xs">
                  <FileCheck2 className="h-8 w-8" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
                  Multi-Page PDF Ready for Transcription
                </span>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
                className="max-h-40 max-w-full object-contain rounded-md shadow-xs transition-transform duration-200"
              />
            )}
          </div>

          {/* Action Row */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium cursor-pointer"
            >
              Replace Document
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/bmp,image/webp,application/pdf,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleRecognize}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Recognize Upload</span>
            </button>
          </div>
        </div>
      )}

      {/* Preset Reference Benchmark Samples */}
      {samples.length > 0 && (
        <div id="teacher-samples-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quick Test Samples for Teacher</h4>
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">Click any sample to test</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Inspect the genuine handwriting image thumbnail below and click it to transcribe instantly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {samples.map((s) => (
              <button
                key={s.id}
                disabled={isProcessing}
                onClick={() => onSelectSample(s.id)}
                className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group disabled:opacity-50 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {s.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shrink-0">
                      Sample
                    </span>
                  </div>

                  {/* Handwriting Image Thumbnail */}
                  <div className="w-full h-20 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden flex items-center justify-center p-1.5 shadow-2xs group-hover:shadow-sm transition-all mb-2.5">
                    <img
                      src={s.image_url || `/samples/${s.name}`}
                      alt={s.name}
                      className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  <span>Transcribe This Sample</span>
                  <span>&rarr;</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
