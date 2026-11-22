import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingIndicator({ message = 'Processing image through CRNN model...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className="h-9 w-9 text-blue-600 animate-spin mb-3" />
      <h4 className="text-sm font-semibold text-slate-800">{message}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        Resizing to 32px height, passing through 5 CNN layers and 2 BiLSTM layers with CTC BestPath decoding.
      </p>
    </div>
  );
}
