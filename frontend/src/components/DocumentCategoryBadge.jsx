import React from 'react';
import { Tag } from 'lucide-react';

export default function DocumentCategoryBadge({ 
  category, 
  confidence, 
  reason 
}) {
  const isUnknown = category === "Other / Unknown" || !category;

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          isUnknown
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        }`}
        title={reason || 'Automatically classified by AI'}
      >
        <Tag className="h-3 w-3" />
        <span>{category || "Detecting..."}</span>
        {confidence > 0 && (
          <span className="text-[10px] opacity-75 font-mono">
            ({Math.round(confidence * 100)}%)
          </span>
        )}
      </div>

      {reason && (
        <span className="hidden sm:inline-block text-[11px] text-slate-400 italic">
          {reason}
        </span>
      )}
    </div>
  );
}
