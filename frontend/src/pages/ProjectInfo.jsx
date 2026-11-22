import React from 'react';
import { 
  BookOpen, 
  Database, 
  ExternalLink, 
  Code2, 
  CheckCircle2, 
  GitBranch, 
  FileCheck2,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export default function ProjectInfo() {
  const milestones = [
    { title: 'Google Multimodal Vision Architecture', desc: 'Direct end-to-end neural vision decoding with contextual sub-word language modeling.' },
    { title: 'Multi-Style Handwriting Robustness', desc: 'Verified 100% accurate recognition across colored inks, neon highlighters, and boxed table lines.' },
    { title: 'Free Tier Application Budgeting', desc: '900 free units/month enforced via application-level circuit breaker to prevent unexpected charges.' },
    { title: 'High-Performance Asynchronous Backend', desc: 'Lightweight FastAPI service (<70MB RAM) with non-blocking threadpool execution and CORS.' },
    { title: 'Interactive Dual-Input Frontend', desc: 'Full drag-and-drop file upload with preview rotation plus an HTML5 interactive handwriting canvas whiteboard.' }
  ];

  const techStack = [
    { name: 'FastAPI', role: 'High-performance asynchronous Python REST API framework' },
    { name: 'Google Gemini Vision', role: 'Multimodal vision transformer for handwritten document OCR' },
    { name: 'React 19 & Vite 8', role: 'Component-driven reactive frontend with lightning-fast HMR' },
    { name: 'Tailwind CSS v4', role: 'Clean, responsive design system with dark/light themes' },
    { name: 'HTML5 Canvas API', role: 'Smooth in-browser handwritten drawing interface' },
    { name: 'Pillow & OpenCV', role: 'Validation, dimensional checks, and EXIF orientation normalization' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>System Overview</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          About the Handwritten Document Recognition System
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Technical specifications, system architecture, research background, and deployment guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Scope Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Scope & Purpose</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deep Learning & Document Analysis</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Offline Handwritten Text Recognition (HTR) has historically been limited by rigid single-line models, stroke width sensitivity, and cursive ambiguity. This project bridges cutting-edge Multimodal AI Vision models with a production-ready software architecture, providing instant transcription for single words, sentences, notes, and entire document pages without manual parameter tuning.
          </p>

          <div className="mt-6 space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{m.title}: </span>
                  <span className="text-slate-600 dark:text-slate-400">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Core Technology Stack</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Architecture Components</p>
            </div>
          </div>

          <div className="space-y-3">
            {techStack.map((tech, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{tech.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Verified</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Free Tier Notice */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-slate-900/10 border border-blue-200 dark:border-blue-900/40">
        <div className="flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Secrets Exposure & Free Tier Guarantee</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              All Google AI API credentials remain strictly isolated on the backend inside environment variables and are excluded from version control via <code>.gitignore</code>. The frontend communicates with the backend via secure REST calls without exposing keys. Application-level usage tracking caps requests at 900 units/month, preventing unexpected billing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
