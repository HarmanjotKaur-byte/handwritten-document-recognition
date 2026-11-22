import React from 'react';
import { 
  ArrowRight, 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Layers,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Database
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function Home({ 
  onStartRecognition, 
  modelInfo, 
  modelHealthy, 
  usageStats,
  totalRecognitions, 
  recentRecognitions = [] 
}) {
  const providerName = modelInfo?.provider || "Google DeepMind";
  const modelName = modelInfo?.model_name || "gemini-3.5-flash-lite";
  const usedUnits = usageStats?.used_units ?? 0;
  const limitUnits = usageStats?.monthly_limit ?? 900;
  const remainingUnits = usageStats?.remaining_units ?? (limitUnits - usedUnits);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-slate-800/80">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Handwritten Document Recognition System • Next-Gen AI Vision</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Handwritten Document Recognition System
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            A production AI-powered OCR application delivering state-of-the-art transcription of handwritten notes, cursive lines, forms, and documents with instant cloud inference and free tier protection.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartRecognition}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Start Recognition</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-slate-300 backdrop-blur-xs">
              <span className={`h-2 w-2 rounded-full ${modelHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{modelHealthy ? `API Connected: ${modelName}` : 'Connecting to API...'}</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Google Vision API Status"
          value={modelHealthy ? "Connected (Ready)" : "Connecting..."}
          subtext={`Provider: ${providerName}`}
          icon={ShieldCheck}
          trend={modelHealthy ? "Online" : "Connecting"}
          isPositive={modelHealthy}
        />
        <DashboardCard
          title="Monthly Application Usage"
          value={`${usedUnits} / ${limitUnits}`}
          subtext="Free tier quota tracked"
          icon={Activity}
          trend={`${Math.round((usedUnits / limitUnits) * 100)}% Used`}
          isPositive={usedUnits < limitUnits * 0.8}
        />
        <DashboardCard
          title="Remaining Allowance"
          value={`${remainingUnits} Units`}
          subtext="Guaranteed zero overage"
          icon={Zap}
          trend="Free Tier Active"
          isPositive={true}
        />
        <DashboardCard
          title="Total Session Recognitions"
          value={totalRecognitions}
          subtext="Processed in current session"
          icon={TrendingUp}
          trend="Session Active"
          isPositive={true}
        />
      </div>

      {/* Features & Architecture Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Neural Vision Engine</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Multimodal Document OCR Specification</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              v2.0 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Architecture</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Multimodal Neural Vision Transformer</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-resolution document feature extraction with sub-word language modeling.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Supported Mediums</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Cursive, Print & Sketches</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Resilient against colored inks, ruled notebook lines, and highlighters.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Application Budget</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">900 Free Units / Month</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Application-level circuit breaker safeguards against unexpected billing.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Input Interfaces</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Upload & HTML5 Canvas</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag-and-drop scans or draw handwriting directly on interactive whiteboard.</p>
            </div>
          </div>
        </div>

        {/* Recent Session Activity */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Current Session History</p>
              </div>
            </div>

            {recentRecognitions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No recognitions in this session yet.</p>
                <p className="mt-1">Upload an image or draw on canvas to start!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecognitions.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono font-medium truncate max-w-[180px] text-slate-800 dark:text-slate-200">
                      "{item.text}"
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {item.latency ? `${Math.round(item.latency)}ms` : 'Instant'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onStartRecognition}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open Recognition Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
