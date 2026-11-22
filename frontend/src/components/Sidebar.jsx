import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  PenTool, 
  History, 
  User, 
  Sparkles, 
  LogOut, 
  FileText,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  inputMode, 
  setInputMode, 
  currentUser, 
  onLogout 
}) {
  const navItems = [
    {
      id: 'upload',
      label: 'Upload Document',
      icon: UploadCloud,
      category: 'RECOGNITION',
      onClick: () => {
        setActiveTab('recognize');
        setInputMode('upload');
      },
      isActive: activeTab === 'recognize' && inputMode === 'upload'
    },
    {
      id: 'canvas',
      label: 'Drawing Canvas',
      icon: PenTool,
      category: 'RECOGNITION',
      onClick: () => {
        setActiveTab('recognize');
        setInputMode('canvas');
      },
      isActive: activeTab === 'recognize' && inputMode === 'canvas'
    },
    {
      id: 'samples',
      label: 'Quick Test Samples',
      icon: Sparkles,
      category: 'RECOGNITION',
      onClick: () => {
        setActiveTab('recognize');
        setInputMode('upload');
        // Smooth scroll to samples section
        setTimeout(() => {
          document.getElementById('teacher-samples-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      isActive: false
    },
    {
      id: 'history',
      label: 'Saved Documents',
      icon: History,
      category: 'DOCUMENT MANAGEMENT',
      onClick: () => {
        setActiveTab('history');
      },
      isActive: activeTab === 'history'
    },
    {
      id: 'account',
      label: 'My Account',
      icon: User,
      category: 'ACCOUNT',
      onClick: () => {
        setActiveTab('account');
      },
      isActive: activeTab === 'account'
    }
  ];

  const categories = ['RECOGNITION', 'DOCUMENT MANAGEMENT', 'ACCOUNT'];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-colors min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        
        {/* App Title inside Sidebar */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
              Handwriting AI
            </h1>
            <p className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
              Document Platform
            </p>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-6">
          {categories.map((cat) => {
            const items = navItems.filter((i) => i.category === cat);
            return (
              <div key={cat} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {cat}
                </p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                          item.isActive
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50/70 dark:hover:bg-purple-950/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${item.isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.isActive && <ChevronRight className="h-3.5 w-3.5 text-white/80" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Card at bottom of sidebar */}
      {currentUser && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs uppercase border border-purple-200 dark:border-purple-800">
                {currentUser.name?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
