import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnalysisResult, HistoryEntry } from './types';
import { performAnalysis } from './utils/nlpEngine';
import { historyService } from './utils/storage';
import { HistoryView } from './components/HistoryView';
import {
  LexicalView, TokenizationView, LemmatizationView,
  StemmingView, StopwordsView, PosView, SentimentView
} from './components/AnalysisViews';
import {
  LayoutDashboard, FileText, Scissors, Database,
  Filter, Tag, Smile, Brain, Menu, X, Play, RotateCcw, FileInput,
  ChevronRight, Trash2, History, Moon, Sun, Upload
} from 'lucide-react';

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Programming is amazing and fun, but debugging can be terrible and frustrating! Text mining reveals patterns in unstructured data. I love building beautiful web applications.";

const USER_ID = 'guest'; // Single user mode

// Add type definition for global mammoth
declare global {
  interface Window {
    mammoth: any;
  }
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App State
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Data State
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [result, setResult] = useState<AnalysisResult>({
    hasData: false,
    lexical: { sentenceCount: 0, wordCount: 0, charCount: 0, density: 0, wordFreq: [] },
    tokens: [],
    lemmas: [],
    stems: [],
    stopwords: { removed: [], cleanText: '', removedCount: 0 },
    pos: [],
    sentiment: { score: 0, verdict: 'Neutral', breakdown: [] }
  });

  // Load data and theme on mount
  useEffect(() => {
    setHistory(historyService.get(USER_ID));
    
    // Check local storage or system preference for theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleAnalysis = () => {
    if (!inputText.trim()) return;
    const data = performAnalysis(inputText);
    setResult(data);
    
    // Save to history
    historyService.save(USER_ID, inputText, data);
    setHistory(historyService.get(USER_ID)); // Refresh history
  };

  const handleClear = () => {
    setInputText('');
    setResult({ ...result, hasData: false });
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
  };

  const handleLoadHistory = (entry: HistoryEntry) => {
    setInputText(entry.text);
    setResult(entry.result);
    navigate('/lexical');
  };

  const handleClearHistory = () => {
    historyService.clear(USER_ID);
    setHistory([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle DOCX files specially
    if (file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          if (window.mammoth) {
             const result = await window.mammoth.extractRawText({ arrayBuffer });
             if (result.value) {
                setInputText(result.value);
                if (fileInputRef.current) fileInputRef.current.value = '';
             }
          } else {
             alert("Document processor is not ready. Please check internet connection.");
          }
        } catch (error) {
           console.error(error);
           alert("Error reading .docx file. It might be corrupted.");
        }
      };
      reader.onerror = () => alert("Error reading file");
      reader.readAsArrayBuffer(file);
      return;
    }

    // Handle Plain Text files
    // Check if file type is text-based (rough check)
    if (!file.type.match('text.*') && 
        !file.name.endsWith('.json') && 
        !file.name.endsWith('.md') && 
        !file.name.endsWith('.csv') && 
        !file.name.endsWith('.xml') &&
        !file.name.endsWith('.html') &&
        !file.name.endsWith('.js') &&
        !file.name.endsWith('.ts')
    ) {
      alert("Please upload a supported text file or Word document (.docx)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputText(content);
        // Clear input value so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      alert("Error reading file");
    };
    reader.readAsText(file);
  };

  const NavItem = ({ path, label, icon: Icon }: { path: string; label: string; icon: any }) => {
    // Check if active based on current path
    const isActive = location.pathname === path || (path === '/lexical' && location.pathname === '/');
    
    return (
      <button
        onClick={() => {
          navigate(path);
          setIsSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <Icon className={`text-lg ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} size={20} />
        {label}
        {isActive && <ChevronRight className="ml-auto opacity-50" size={16} />}
      </button>
    );
  };

  // Wrapper for analysis views that should show the input section
  const AnalysisLayout = ({ children }: { children: React.ReactNode }) => (
    <>
      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6 transition-all hover:shadow-md mb-6">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <label className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-lg">
            <FileInput className="text-blue-600 dark:text-blue-500" size={20} /> Source Text
          </label>
          <div className="flex gap-2">
             <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.md,.json,.csv,.xml,.html,.docx,.js,.ts"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
                <Upload size={14} /> Upload File
            </button>
            <button 
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
            >
                <RotateCcw size={14} /> Load Sample
            </button>
            <button 
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-colors"
            >
                <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-slate-700 dark:text-slate-300 leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm md:text-base"
          placeholder="Enter or paste text here to analyze..."
        />
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleAnalysis}
            disabled={!inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Play size={18} fill="currentColor" /> Analyze Text
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-8 min-h-[400px] transition-all">
        {!result.hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-20 animate-fadeIn">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Brain size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Ready to Analyze</p>
            <p className="text-sm mt-2 max-w-xs text-center leading-relaxed">Enter your text above and click the Analyze button to see insights.</p>
          </div>
        ) : (
          <div className="h-full w-full">
            {children}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={`h-screen flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-30 relative transition-colors">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Brain size={18} />
            </div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100">TextScope<span className="text-blue-600 dark:text-blue-500">.ai</span></h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600 dark:text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-30 h-full transition-all duration-300 shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <Brain size={24} />
          </div>
          <h1 className="font-bold text-2xl tracking-tight text-slate-800 dark:text-slate-100">TextScope<span className="text-blue-600 dark:text-blue-500">.ai</span></h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Analysis Modules</div>
          <NavItem path="/lexical" label="Lexical Analysis" icon={LayoutDashboard} />
          <NavItem path="/tokenization" label="Tokenization" icon={FileText} />
          <NavItem path="/lemmatization" label="Lemmatization" icon={Database} />
          <NavItem path="/stemming" label="Stemming" icon={Scissors} />
          <NavItem path="/stopwords" label="Stopword Removal" icon={Filter} />
          <NavItem path="/pos" label="POS Tagging" icon={Tag} />
          <NavItem path="/sentiment" label="Sentiment Analysis" icon={Smile} />

          <div className="mt-4 px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">App</div>
          <NavItem path="/history" label="History" icon={History} />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                  G
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Guest User</span>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
            <Routes>
                {/* Redirect root to lexical */}
                <Route path="/" element={<Navigate to="/lexical" replace />} />
                
                {/* History Route */}
                <Route 
                    path="/history" 
                    element={
                        <HistoryView 
                            history={history} 
                            onLoad={handleLoadHistory} 
                            onClear={handleClearHistory} 
                        />
                    } 
                />

                {/* Analysis Routes - wrapped in AnalysisLayout */}
                <Route path="/lexical" element={<AnalysisLayout><LexicalView data={result} isDarkMode={isDarkMode} /></AnalysisLayout>} />
                <Route path="/tokenization" element={<AnalysisLayout><TokenizationView data={result} isDarkMode={isDarkMode} /></AnalysisLayout>} />
                <Route path="/lemmatization" element={<AnalysisLayout><LemmatizationView data={result} isDarkMode={isDarkMode} /></AnalysisLayout>} />
                <Route path="/stemming" element={<AnalysisLayout><StemmingView data={result} isDarkMode={isDarkMode} /></AnalysisLayout>} />
                <Route path="/stopwords" element={<AnalysisLayout><StopwordsView data={result} isDarkMode={isDarkMode} /></AnalysisLayout>} />
                <Route path="/pos" element={<AnalysisLayout><PosView data={result} isDarkMode={isDarkMode} /></AnalysisLayout>} />
                <Route path="/sentiment" element={<AnalysisLayout><SentimentView data={result} isDarkMode={isDarkMode} /></AnalysisLayout>} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/lexical" replace />} />
            </Routes>
        </div>
      </main>
    </div>
  );
}