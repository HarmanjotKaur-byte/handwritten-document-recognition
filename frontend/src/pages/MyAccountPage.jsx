import React from 'react';
import { User, Mail, Zap } from 'lucide-react';

export default function MyAccountPage({ currentUser, creditsUsed, monthlyLimit }) {
  const remaining = Math.max(0, monthlyLimit - creditsUsed);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          My Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your personal profile and active recognition credits.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Simple Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/25 uppercase shrink-0">
            {currentUser?.name?.[0] || 'U'}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentUser?.name || 'Registered User'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-purple-500" />
              <span>{currentUser?.email}</span>
            </p>
          </div>
        </div>

        {/* Credits Counter Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
              <span>API Credits Used</span>
            </h4>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              {creditsUsed} / {monthlyLimit} units
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (creditsUsed / monthlyLimit) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            You have <strong className="text-purple-600 dark:text-purple-400 font-bold">{remaining} credits</strong> remaining this month under your free tier quota.
          </p>
        </div>

      </div>
    </div>
  );
}
