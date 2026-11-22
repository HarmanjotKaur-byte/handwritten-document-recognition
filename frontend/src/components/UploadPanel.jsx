import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

export default function UploadPanel({ onImageSelected, samples = [], onSelectSample, isProcessing }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onImageSelected(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onImageSelected(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Card */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver 
            ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/bmp,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h4 className="text-base font-semibold text-slate-800">
          Upload Handwritten Image
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Drag and drop a single word or full text line image here, or click to browse files.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Supports PNG, JPG, JPEG, BMP</span>
          <span>•</span>
          <span>Max 10 MB</span>
        </div>

        {selectedFileName && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Selected: {selectedFileName}
          </div>
        )}
      </div>

      {/* Preset Reference Samples */}
      {samples.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold text-slate-800">Quick Test Samples</h4>
            <span className="text-xs text-slate-400 font-normal">Click to test immediately</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {samples.map((s) => (
              <button
                key={s.id}
                disabled={isProcessing}
                onClick={() => onSelectSample(s.id)}
                className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all group disabled:opacity-50"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                    {s.filename}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {s.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.description}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">Ground truth: "{s.ground_truth}"</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
