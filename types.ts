export interface TokenData {
  text: string;
  normal: string;
}

export interface LemmaData {
  original: string;
  root: string;
}

export interface StemData {
  original: string;
  stem: string;
}

export interface PosTagData {
  text: string;
  tags: string[];
}

export interface SentimentBreakdown {
  word: string;
  score: number;
}

export interface SentimentData {
  score: number;
  verdict: 'Positive' | 'Negative' | 'Neutral';
  breakdown: SentimentBreakdown[];
}

export interface StopwordData {
  removed: string[];
  cleanText: string;
  removedCount: number;
}

export interface LexicalData {
  sentenceCount: number;
  wordCount: number;
  charCount: number;
  density: number;
  wordFreq: { word: string; count: number }[];
}

export interface AnalysisResult {
  hasData: boolean;
  lexical: LexicalData;
  tokens: string[];
  lemmas: LemmaData[];
  stems: StemData[];
  stopwords: StopwordData;
  pos: PosTagData[];
  sentiment: SentimentData;
}

export type ViewType = 
  | 'lexical' 
  | 'tokenization' 
  | 'lemmatization' 
  | 'stemming' 
  | 'stopwords' 
  | 'pos' 
  | 'sentiment';

export interface User {
  username: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  text: string;
  result: AnalysisResult;
}