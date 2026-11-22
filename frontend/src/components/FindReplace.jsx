import React, { useState } from 'react';
import { Search, Replace, X, ChevronRight, AlertCircle, Check } from 'lucide-react';

export default function FindReplace({ text, onReplaceText, onClose }) {
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [matchCount, setMatchCount] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const countOccurrences = (query) => {
    if (!query) {
      setMatchCount(null);
      return;
    }
    try {
      const regex = new RegExp(query, 'gi');
      const matches = text.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } catch {
      setMatchCount(0);
    }
  };

  const handleFindChange = (val) => {
    setFindWord(val);
    countOccurrences(val);
    setFeedback(null);
  };

  const handleReplaceOne = () => {
    if (!findWord) return;
    try {
      const regex = new RegExp(findWord, 'i');
      if (!regex.test(text)) {
        setFeedback({ type: 'warning', msg: 'No match found.' });
        return;
      }
      const updated = text.replace(regex, replaceWord);
      onReplaceText(updated);
      setFeedback({ type: 'success', msg: 'Replaced 1 occurrence.' });
      countOccurrences(findWord);
    } catch {
      setFeedback({ type: 'error', msg: 'Invalid search expression.' });
    }
  };

  const handleReplaceAll = () => {
    if (!findWord) return;
    try {
      const regex = new RegExp(findWord, 'gi');
      const matches = text.match(regex);
      if (!matches) {
        setFeedback({ type: 'warning', msg: 'No match found.' });
        return;
      }
      const count = matches.length;
      const updated = text.replace(regex, replaceWord);
      onReplaceText(updated);
      setFeedback({ type: 'success', msg: `Replaced all ${count} occurrences.` });
      setMatchCount(0);
    } catch {
      setFeedback({ type: 'error', msg: 'Invalid search expression.' });
    }
  };

  return (
    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-blue-500" />
          Find & Replace
        </span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="relative">
          <input
            type="text"
            value={findWord}
            onChange={(e) => handleFindChange(e.target.value)}
            placeholder="Find text..."
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {matchCount !== null && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
              {matchCount} match{matchCount === 1 ? '' : 'es'}
            </span>
          )}
        </div>

        <input
          type="text"
          value={replaceWord}
          onChange={(e) => setReplaceWord(e.target.value)}
          placeholder="Replace with..."
          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="text-[11px]">
          {feedback && (
            <span className={`inline-flex items-center gap-1 ${
              feedback.type === 'success' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-500'
            }`}>
              {feedback.type === 'success' ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {feedback.msg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReplaceOne}
            disabled={!findWord}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={!findWord}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
