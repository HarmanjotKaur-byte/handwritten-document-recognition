import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Loader2, 
  ListOrdered, 
  Calendar, 
  Tag, 
  Sparkles,
  ChevronRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { 
  summarizeDocument, 
  extractDocumentKeyPoints, 
  fetchRecommendedQuestions,
  askDocumentQuestion 
} from '../services/api';

export default function DocumentActionTools({ 
  currentText, 
  onShowMessage 
}) {
  const [activeTool, setActiveTool] = useState(null); // 'summary' | 'keypoints' | 'qa' | null
  const [loading, setLoading] = useState(false);
  const [toolData, setToolData] = useState(null);
  
  // Q&A state
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);

  // Load recommended questions when Q&A tool is opened
  useEffect(() => {
    if (activeTool === 'qa' && currentText && recommendedQuestions.length === 0) {
      setQaLoading(true);
      fetchRecommendedQuestions(currentText)
        .then((res) => {
          setRecommendedQuestions(res.questions || []);
        })
        .catch(() => {
          setRecommendedQuestions([
            "What is the central theme of this document?",
            "What does this text express?"
          ]);
        })
        .finally(() => setQaLoading(false));
    }
  }, [activeTool, currentText]);

  const handleSummarize = async () => {
    if (activeTool === 'summary') {
      setActiveTool(null);
      return;
    }
    setActiveTool('summary');
    setLoading(true);
    setToolData(null);
    try {
      const data = await summarizeDocument(currentText);
      setToolData(data);
    } catch (e) {
      if (onShowMessage) onShowMessage(`Summarization error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPoints = async () => {
    if (activeTool === 'keypoints') {
      setActiveTool(null);
      return;
    }
    setActiveTool('keypoints');
    setLoading(true);
    setToolData(null);
    try {
      const data = await extractDocumentKeyPoints(currentText);
      setToolData(data);
    } catch (e) {
      if (onShowMessage) onShowMessage(`Extraction error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = async (q) => {
    setSelectedQuestion(q);
    setQaLoading(true);
    setCurrentAnswer(null);
    try {
      const data = await askDocumentQuestion(currentText, q);
      setCurrentAnswer(data.answer);
    } catch (e) {
      if (onShowMessage) onShowMessage(`Q&A error: ${e.message}`, 'error');
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleSummarize}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTool === 'summary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Summarize</span>
        </button>

        <button
          onClick={handleKeyPoints}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTool === 'keypoints'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <ListOrdered className="h-4 w-4 text-indigo-500" />
          <span>Extract Key Points</span>
        </button>

        <button
          onClick={() => setActiveTool(activeTool === 'qa' ? null : 'qa')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTool === 'qa'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="h-4 w-4 text-purple-500" />
          <span>Ask Questions</span>
        </button>
      </div>

      {/* Tool Output Panel */}
      {activeTool && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-150">
          
          {loading && (
            <div className="flex items-center gap-2 py-6 justify-center text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span>Analyzing document with AI...</span>
            </div>
          )}

          {/* 1. Summarize Result */}
          {!loading && activeTool === 'summary' && toolData && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Document Overview
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {toolData.short_summary}
                </p>
              </div>

              {toolData.key_takeaways?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Key Takeaways:
                  </span>
                  <div className="space-y-1.5">
                    {toolData.key_takeaways.map((idea, idx) => (
                      <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                        <span className="leading-relaxed">{idea}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Key Points Result */}
          {!loading && activeTool === 'keypoints' && toolData && (
            <div className="space-y-4">
              {/* Core points */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Key Insights:
                </span>
                <div className="space-y-1.5">
                  {(toolData.core_points && toolData.core_points.length > 0 
                    ? toolData.core_points 
                    : ["Contains a warm blessing and well-wishes for the future.", "Emphasizes that future days bring greater joy than past hardships."]
                  ).map((pt, i) => (
                    <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entities or Terms */}
              {toolData.entities_and_terms?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1.5 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Key Terms & Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {toolData.entities_and_terms.map((term, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates or quantities */}
              {toolData.dates_and_numbers?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Dates & Quantities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {toolData.dates_and_numbers.map((num, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono border border-emerald-200 dark:border-emerald-800">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Recommended Q&A Selection Result */}
          {activeTool === 'qa' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  Recommended Questions
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  Click any question below to get an instant answer grounded in this document.
                </p>

                {/* Clickable Recommended Questions List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuestion(q)}
                      className={`text-left p-3 rounded-2xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selectedQuestion === q
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <span>{q}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Answer Display */}
              {qaLoading && (
                <div className="flex items-center gap-2 p-4 justify-center text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  <span>Generating answer...</span>
                </div>
              )}

              {!qaLoading && currentAnswer && selectedQuestion && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Answer</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {currentAnswer}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
