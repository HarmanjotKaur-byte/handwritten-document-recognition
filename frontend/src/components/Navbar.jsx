import React from 'react';
import { 
  Sun,
  Moon,
  Zap,
  Search,
  Bell,
  Menu
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ 
  currentUser, 
  creditsUsed = 0,
  monthlyLimit = 900,
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) {
  const { theme, toggleTheme } = useTheme();
  const remaining = Math.max(0, monthlyLimit - creditsUsed);

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-600 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-purple-700" />
            )}
          </button>

          {/* User Avatar */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shadow-purple-500/20">
                {currentUser.name?.[0] || 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden lg:inline">
                {currentUser.name}
              </span>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
