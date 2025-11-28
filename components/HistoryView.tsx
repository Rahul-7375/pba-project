import React from 'react';
import { HistoryEntry } from '../types';
import { Clock, FileText, ChevronRight, Calendar, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoad, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 dark:text-slate-500">
        <Clock size={48} className="mb-4 text-slate-200 dark:text-slate-700" />
        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No History Yet</h3>
        <p className="text-sm mt-1">Analyses you run will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analysis History</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and restore your previous sessions</p>
        </div>
        <button 
          onClick={onClear}
          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div 
            key={entry.id} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onLoad(entry)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium truncate line-clamp-1">
                  {entry.text}
                </p>
                <div className="flex gap-2 mt-2">
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                        {entry.result.lexical.wordCount} words
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                        entry.result.sentiment.verdict === 'Positive' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' :
                        entry.result.sentiment.verdict === 'Negative' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                        {entry.result.sentiment.verdict}
                    </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};