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
          Your personal account and profile information.
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

      </div>
    </div>
  );
}
