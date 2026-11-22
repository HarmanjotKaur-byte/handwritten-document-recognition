import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  RotateCcw, 
  Trash2, 
  Download, 
  Play, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function DrawingCanvas({ onRecognizeCanvas, isProcessing }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(4);
  const [history, setHistory] = useState([]); // snapshot of canvas imageData for undo
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas with pure white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set display resolution vs internal coordinate buffer
    canvas.width = 700;
    canvas.height = 160;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    // Save initial blank state
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imageData]); // keep last 15 states
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#000000';
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    saveState();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    saveState();
  };

  const undoLastStroke = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const previousState = newHistory[newHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      // Check if canvas is basically blank
      setHasDrawn(newHistory.length > 1);
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `handwriting_canvas_${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const handleRecognize = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Convert canvas to a File object with proper MIME type
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `canvas_drawing_${Date.now()}.png`, { type: 'image/png' });
        onRecognizeCanvas(file);
      }
    }, 'image/png');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-slate-800">Drawing Whiteboard</h4>
          <span className="text-xs text-slate-400">• Draw horizontal words or text lines</span>
        </div>

        {/* Thickness Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Stroke:</span>
          {[2, 4, 6].map((size) => (
            <button
              key={size}
              onClick={() => setLineWidth(size)}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                lineWidth === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {size === 2 ? 'Fine' : size === 4 ? 'Medium' : 'Thick'}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="p-4 bg-slate-100/60 flex items-center justify-center">
        <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white touch-none w-full max-w-2xl">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-40 cursor-crosshair block"
          />

          {!hasDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-sm italic font-serif">
              Write text here using mouse or stylus...
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={undoLastStroke}
            disabled={history.length <= 1 || isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo
          </button>
          <button
            onClick={clearCanvas}
            disabled={!hasDrawn || isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            onClick={handleExportPNG}
            disabled={!hasDrawn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Save PNG
          </button>
        </div>

        <button
          onClick={handleRecognize}
          disabled={!hasDrawn || isProcessing}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Recognize Drawing</span>
        </button>
      </div>
    </div>
  );
}
