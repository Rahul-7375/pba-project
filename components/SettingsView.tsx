import React, { useState } from 'react';
import { Plus, X, Trash2, Settings as SettingsIcon } from 'lucide-react';

interface SettingsViewProps {
  customStopwords: string[];
  onAdd: (word: string) => void;
  onRemove: (word: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ customStopwords, onAdd, onRemove }) => {
  const [newWord, setNewWord] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim()) {
      onAdd(newWord);
      setNewWord('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="text-slate-600" />
            Configuration
        </h2>
        <p className="text-slate-500 text-sm mt-1">Manage your analysis preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Custom Stopwords</h3>
        <p className="text-slate-600 text-sm mb-6">
          Add words here that you want to be ignored during text analysis. These will be used in addition to the default English stopword list.
        </p>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Enter a word to ignore..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={!newWord.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Custom List</h4>
            {customStopwords.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    No custom stopwords added yet.
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                {customStopwords.map((word, i) => (
                    <span 
                        key={i} 
                        className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm border border-slate-200 flex items-center gap-2 group hover:border-red-200 hover:bg-red-50 transition-colors"
                    >
                    {word}
                    <button 
                        onClick={() => onRemove(word)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                    </span>
                ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};