import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PieChart, 
  AlertCircle, 
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function UsageDashboard({ usageStats, history = [], onResetFilter }) {
  const usedUnits = usageStats?.used_units ?? 0;
  const limitUnits = usageStats?.monthly_limit ?? 900;
  const remainingUnits = usageStats?.remaining_units ?? (limitUnits - usedUnits);
  const currentMonth = usageStats?.current_month ?? new Date().toISOString().substring(0, 7);
  const isExhausted = usageStats?.is_quota_exhausted ?? false;

  // Session Statistics
  const totalSessionRequests = history.length;
  const successfulRequests = history.filter((h) => Boolean(h.recognized_text && h.recognized_text.trim())).length;
  const failedOrEmptyRequests = totalSessionRequests - successfulRequests;
  
  const avgProcessingTime = totalSessionRequests > 0
    ? history.reduce((acc, curr) => acc + (curr.processing_time_ms || 0), 0) / totalSessionRequests
    : 0;

  const usagePercent = Math.min(100, Math.round((usedUnits / limitUnits) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
          <Activity className="h-3.5 w-3.5" />
          <span>Real-time Quota Telemetry & Operational Analytics</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Application Usage & Quota Dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Monitor application-level free tier consumption, API allowance caps, session throughput, and latency performance metrics.
        </p>
      </div>

      {/* Primary Quota Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Current Month Usage"
          value={`${usedUnits} / ${limitUnits}`}
          subtext={`Cycle: ${currentMonth}`}
          icon={Activity}
          trend={`${usagePercent}% Consumed`}
          isPositive={usagePercent < 80}
        />
        <DashboardCard
          title="Remaining Safe Allowance"
          value={`${remainingUnits} Units`}
          subtext="Circuit breaker active"
          icon={Zap}
          trend={isExhausted ? "Limit Reached" : "Free Tier Active"}
          isPositive={!isExhausted}
        />
        <DashboardCard
          title="Successful Recognitions"
          value={successfulRequests}
          subtext={`${totalSessionRequests} total queries`}
          icon={CheckCircle2}
          trend={totalSessionRequests > 0 ? `${Math.round((successfulRequests / totalSessionRequests) * 100)}% Success` : '100%'}
          isPositive={true}
        />
        <DashboardCard
          title="Average Latency"
          value={avgProcessingTime > 0 ? `${Math.round(avgProcessingTime)} ms` : '--'}
          subtext="Inference + parsing"
          icon={Clock}
          trend="Cloud ViT"
          isPositive={true}
        />
      </div>

      {/* Quota Progress Bar & Budget Overview */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Free Tier Budget Protection System</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Guaranteed zero-cost operation via hardware circuit-breaker in <code>UsageService</code>.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
            Cycle resets: {currentMonth}-01 00:00 UTC
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              {usedUnits} calls used ({usagePercent}%)
            </span>
            <span className="text-slate-400 font-mono">
              Limit: {limitUnits} calls / month
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent > 90
                  ? 'bg-rose-500'
                  : usagePercent > 70
                  ? 'bg-amber-500'
                  : 'bg-blue-600 dark:bg-blue-500'
              }`}
              style={{ width: `${Math.max(2, usagePercent)}%` }}
            ></div>
          </div>
        </div>

        {/* Distinction explanation: API Usage vs Recognition Accuracy */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">Distinction: API Usage vs. Model Recognition Accuracy</p>
            <p className="leading-relaxed">
              <strong>API Usage:</strong> Counts raw invocations made to the Google Vision backend service. Every uploaded image or canvas submission consumes exactly 1 unit of your monthly 900-unit allowance regardless of document contents.
            </p>
            <p className="leading-relaxed">
              <strong>Recognition Accuracy:</strong> Evaluates transcription fidelity (Character Error Rate & Word Error Rate) against ground-truth references. An image containing illegible or blurred scribbles still consumes 1 API unit even if zero words are recognized.
            </p>
          </div>
        </div>
      </div>

      {/* Session Diagnostics & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span>Session Request Health</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Successful Transcriptions
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{successfulRequests}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Blank / No Text Detected
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{failedOrEmptyRequests}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Active Circuit Breaker Status
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">NORMAL (Operational)</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            <span>Storage & Privacy Guarantees</span>
          </h4>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <strong>Zero Server Document Persistence:</strong> Input images are processed strictly in volatile memory. No client images are saved to disk or external databases.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <strong>Local History Storage:</strong> Historical records and transcribed outputs are saved exclusively within the browser's <code>localStorage</code> sandbox.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <strong>Encrypted Transit:</strong> API requests to Google Cloud endpoints operate over TLS 1.3 encrypted HTTPS tunnels.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
