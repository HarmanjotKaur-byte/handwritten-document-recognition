import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Recognize from './pages/Recognize';
import DocumentHistory from './components/DocumentHistory';
import MyAccountPage from './pages/MyAccountPage';
import LandingAuthPage from './pages/LandingAuthPage';
import { ThemeProvider } from './context/ThemeContext';
import { fetchSamples, fetchUsage } from './services/api';

const USER_STORAGE_KEY = 'hw_ai_active_user';

function AppContent() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('recognize'); // 'recognize' | 'history' | 'account'
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'canvas'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [samples, setSamples] = useState([]);
  const [activeLoadedDoc, setActiveLoadedDoc] = useState(null);
  const [toast, setToast] = useState(null);

  // Credit Usage Tracking State
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(900);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadUsage = async () => {
    try {
      const stats = await fetchUsage();
      if (stats) {
        setCreditsUsed(stats.used_units ?? 0);
        setMonthlyLimit(stats.monthly_limit ?? 900);
      }
    } catch {}
  };

  useEffect(() => {
    loadUsage();
    async function loadSamples() {
      try {
        const samplesData = await fetchSamples();
        if (samplesData?.samples) {
          setSamples(samplesData.samples);
        }
      } catch {}
    }
    loadSamples();
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {}
    showToast('Signed out successfully', 'info');
  };

  const handleOpenSavedDocument = (doc) => {
    setActiveLoadedDoc({
      ...doc,
      recognized_text: doc.original_ocr_text,
      improved_text: doc.improved_text
    });
    setActiveTab('recognize');
    showToast(`Loaded "${doc.name}" in Workspace`, 'info');
  };

  // If user is not signed in, show the Feature Introduction & Sign In/Sign Up landing page
  if (!currentUser) {
    return (
      <LandingAuthPage
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />
    );
  }

  // Once authenticated, show Purple & White dashboard with left Sidebar
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        creditsUsed={creditsUsed}
        monthlyLimit={monthlyLimit}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          inputMode={inputMode}
          setInputMode={setInputMode}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Workspace / Feature Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {activeTab === 'recognize' && (
            <Recognize
              samples={samples}
              activeLoadedDoc={activeLoadedDoc}
              currentUser={currentUser}
              inputMode={inputMode}
              setInputMode={setInputMode}
              onClearLoadedDoc={() => setActiveLoadedDoc(null)}
              onNewRecognition={() => {
                loadUsage(); // refresh credits counter
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'history' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Saved Documents
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Persistent SQLite database: Search, organize, and export your handwritten documents.
                  </p>
                </div>
              </div>

              <DocumentHistory
                currentUser={currentUser}
                onOpenDocument={handleOpenSavedDocument}
                onShowToast={showToast}
              />
            </div>
          )}

          {activeTab === 'account' && (
            <MyAccountPage
              currentUser={currentUser}
              creditsUsed={creditsUsed}
              monthlyLimit={monthlyLimit}
            />
          )}

        </main>
      </div>

      <Footer />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
