import React from 'react';
import { AnalysisResult, PosTagData } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { Smile, Frown, Meh, Trash2, CheckCircle, Brain, Tag, Cloud } from 'lucide-react';

interface ViewProps {
  data: AnalysisResult;
  isDarkMode?: boolean;
}

// Helper for POS colors (Dark mode aware)
const getPosColor = (tags: string[]) => {
  const tagSet = new Set(tags);
  if (tagSet.has('Noun')) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
  if (tagSet.has('Verb')) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
  if (tagSet.has('Adjective')) return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
  if (tagSet.has('Adverb')) return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
  return 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
};

// Helper for POS Labels
const getTagLabel = (tags: string[]) => {
  const t = new Set(tags);
  if (t.has('Noun')) return 'Noun';
  if (t.has('Verb')) return 'Verb';
  if (t.has('Adjective')) return 'Adj';
  if (t.has('Adverb')) return 'Adv';
  if (t.has('Preposition')) return 'Prep';
  if (t.has('Conjunction')) return 'Conj';
  if (t.has('Determiner')) return 'Det';
  if (t.has('Pronoun')) return 'Pron';
  return null;
};

export const LexicalView: React.FC<ViewProps> = ({ data, isDarkMode }) => {
  const stats = [
    { label: 'Sentences', value: data.lexical.sentenceCount, color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' },
    { label: 'Words', value: data.lexical.wordCount, color: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' },
    { label: 'Characters', value: data.lexical.charCount, color: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' },
    { label: 'Density', value: `${data.lexical.density.toFixed(1)}%`, color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' },
  ];

  // Logic for Word Cloud sizing
  const maxFreq = Math.max(...data.lexical.wordFreq.map(d => d.count), 1);
  const minFreq = Math.min(...data.lexical.wordFreq.map(d => d.count), 0);
  
  const getWordSize = (count: number) => {
    const minSize = 0.8; // rem
    const maxSize = 2.5; // rem
    if (maxFreq === minFreq) return 1.5;
    return minSize + ((count - minFreq) / (maxFreq - minFreq)) * (maxSize - minSize);
  };

  const getWordColor = (index: number) => {
     // A palette of blues/purples/teals that work in both modes
     const hues = [210, 220, 230, 250, 260, 190];
     const hue = hues[index % hues.length];
     return isDarkMode 
        ? `hsl(${hue}, 80%, 70%)` 
        : `hsl(${hue}, 70%, 45%)`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lexical Analysis</h2>
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">General Statistics</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${stat.color} transition-transform hover:scale-[1.02]`}>
            <div className="text-xs font-semibold uppercase opacity-70 mb-2">{stat.label}</div>
            <div className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
                <BarChart className="w-4 h-4" /> Frequency Distribution
            </h3>
            <div className="h-64 w-full flex-1">
            {data.lexical.wordFreq.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data.lexical.wordFreq} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis type="number" hide />
                    <YAxis 
                    dataKey="word" 
                    type="category" 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                    width={80} 
                    />
                    <Tooltip 
                    cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
                    contentStyle={{ 
                        borderRadius: '8px', 
                        border: isDarkMode ? '1px solid #334155' : 'none', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                        color: isDarkMode ? '#f1f5f9' : '#0f172a'
                    }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.lexical.wordFreq.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 5}, ${isDarkMode ? '60%' : '70%'}, ${isDarkMode ? '60%' : '50%'})`} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
                    No data available.
                </div>
            )}
            </div>
        </div>

        {/* Word Cloud */}
        <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
                <Cloud className="w-4 h-4" /> Word Cloud
            </h3>
            <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-x-4 gap-y-2 min-h-[250px] p-4">
                {data.lexical.wordFreq.length > 0 ? (
                    data.lexical.wordFreq.map((item, i) => (
                        <span 
                            key={i}
                            style={{ 
                                fontSize: `${getWordSize(item.count)}rem`,
                                color: getWordColor(i),
                                opacity: 0.9
                            }}
                            className="font-bold leading-none transition-all hover:scale-110 cursor-default select-none"
                            title={`${item.word}: ${item.count}`}
                        >
                            {item.word}
                        </span>
                    ))
                ) : (
                    <div className="text-slate-400 dark:text-slate-600 text-sm">
                        Not enough words to generate cloud.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export const TokenizationView: React.FC<ViewProps> = ({ data }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tokenization</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Text split into individual tokens (words and punctuation).</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {data.tokens.map((token, i) => (
        <span key={i} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          {token}
        </span>
      ))}
    </div>
  </div>
);

export const LemmatizationView: React.FC<ViewProps> = ({ data }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lemmatization</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reducing words to their dictionary base form (lemma).</p>
    </div>
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      <div className="overflow-auto min-h-[300px] max-h-[450px] w-full custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 shadow-sm">
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 px-4 md:px-6 font-semibold text-slate-600 dark:text-slate-300 text-sm whitespace-nowrap">Original Token</th>
              <th className="py-2 px-4 md:px-6 font-semibold text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">Lemma (Root)</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {data.lemmas.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-4 md:px-6 text-slate-700 dark:text-slate-300">{item.original}</td>
                <td className="py-2 px-4 md:px-6 text-blue-600 dark:text-blue-400 font-medium">{item.root}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const StemmingView: React.FC<ViewProps> = ({ data }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Stemming</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Heuristic process of removing suffixes to find the word stem.</p>
    </div>
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      <div className="overflow-auto min-h-[300px] max-h-[450px] w-full custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 shadow-sm">
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <th className="py-2 px-4 md:px-6 font-semibold text-slate-600 dark:text-slate-300 text-sm whitespace-nowrap">Original Token</th>
              <th className="py-2 px-4 md:px-6 font-semibold text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">Stem</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {data.stems.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-4 md:px-6 text-slate-700 dark:text-slate-300">{item.original}</td>
                <td className="py-2 px-4 md:px-6 text-blue-600 dark:text-blue-400 font-medium">{item.stem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const StopwordsView: React.FC<ViewProps> = ({ data }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Stopword Elimination</h2>
      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
        {data.stopwords.removedCount} removed
      </span>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-red-50 dark:bg-red-900/10 p-4 md:p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
        <h3 className="font-semibold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Removed Words
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.stopwords.removed.map((word, i) => (
            <span key={i} className="bg-white/60 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs line-through border border-red-100 dark:border-red-800/50">
              {word}
            </span>
          ))}
          {data.stopwords.removed.length === 0 && (
            <span className="text-red-400 dark:text-red-500/70 text-sm italic">No stopwords found.</span>
          )}
        </div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/10 p-4 md:p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
        <h3 className="font-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Remaining Text
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-green-100 dark:border-green-900/20">
          {data.stopwords.cleanText || <span className="text-slate-400 dark:text-slate-600 italic">Result text will appear here...</span>}
        </p>
      </div>
    </div>
  </div>
);

export const PosView: React.FC<ViewProps> = ({ data }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Part-of-Speech Tagging</h2>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">Noun</span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">Verb</span>
        <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded border border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800">Adj</span>
        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">Adv</span>
      </div>
    </div>
    <div className="text-lg leading-loose bg-slate-50 dark:bg-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
      {data.pos.map((item, i) => {
        const label = getTagLabel(item.tags);
        return (
            <div key={i} className="relative group inline-block mx-1 my-1">
                <span 
                    className={`inline-flex items-baseline gap-1.5 px-3 py-1 rounded-lg text-base border cursor-help transition-colors ${getPosColor(item.tags)}`}
                >
                    <span className="font-medium">{item.text}</span>
                    {label && <span className="text-[10px] uppercase font-bold opacity-60 select-none">{label}</span>}
                </span>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white dark:bg-slate-700 text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg pointer-events-none">
                    {item.tags.join(', ') || 'Term'}
                </span>
            </div>
        );
      })}
    </div>
  </div>
);

export const SentimentView: React.FC<ViewProps> = ({ data }) => {
  const { score, verdict, breakdown } = data.sentiment;
  let color = 'text-slate-600 dark:text-slate-400';
  let bgColor = 'bg-slate-400 dark:bg-slate-600';
  let Icon = Meh;

  if (verdict === 'Positive') {
    color = 'text-green-600 dark:text-green-400';
    bgColor = 'bg-green-500';
    Icon = Smile;
  } else if (verdict === 'Negative') {
    color = 'text-red-600 dark:text-red-400';
    bgColor = 'bg-red-500';
    Icon = Frown;
  }

  // Normalize score for bar width (simple clamp for demo)
  const barWidth = Math.max(5, Math.min(95, 50 + (score * 5)));

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-4">Sentiment Analysis</h2>
      
      <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <Icon className={`w-24 h-24 mb-4 ${color} transition-all duration-500 hover:scale-110 drop-shadow-sm`} />
        <h3 className={`text-3xl font-bold mb-2 ${color}`}>{verdict}</h3>
        
        <div className="w-full max-w-md bg-gray-200 dark:bg-slate-800 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${bgColor}`} 
            style={{ width: `${barWidth}%` }}
          />
        </div>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-4 py-1 rounded-full">
          Net Score: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{score}</span>
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6">
        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4" /> Influential Words
        </h4>
        <div className="flex flex-wrap gap-2">
          {breakdown.map((item, i) => (
            <span 
                key={i} 
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${item.score > 0 ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}
            >
              {item.word} <span className="opacity-70 ml-1">({item.score > 0 ? '+' : ''}{item.score})</span>
            </span>
          ))}
          {breakdown.length === 0 && (
            <span className="text-slate-400 dark:text-slate-600 text-sm italic">No sentiment-carrying words detected.</span>
          )}
        </div>
      </div>
    </div>
  );
};