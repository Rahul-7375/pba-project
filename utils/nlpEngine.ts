import nlp from 'compromise';
import { AnalysisResult, SentimentData, StopwordData, LexicalData } from '../types';

// --- Constants ---

const SENTIMENT_DICTIONARY: Record<string, number> = {
  "abandon": -2, "accident": -2, "active": 1, "addicted": -2, "admire": 3, "adorable": 3,
  "afraid": -2, "aggressive": -2, "alarm": -2, "amazing": 4, "anger": -3, "angry": -3,
  "annoy": -2, "anxious": -2, "apologize": -1, "applaud": 2, "appreciate": 2, "arrogant": -2,
  "awesome": 4, "awful": -3, "bad": -3, "beautiful": 3, "beauty": 3, "best": 3, "better": 2,
  "big": 1, "bitch": -5, "bitter": -2, "blame": -2, "bless": 3, "blind": -1, "bliss": 3,
  "block": -1, "bloody": -3, "bored": -2, "bother": -2, "brave": 2, "bright": 1, "brilliant": 4,
  "broken": -1, "bullshit": -4, "care": 2, "celebrate": 3, "challenge": -1, "champion": 2,
  "cheer": 2, "cheerful": 2, "clever": 2, "clown": -2, "comfort": 2, "confident": 2,
  "confused": -2, "congrats": 2, "congratulations": 2, "cool": 1, "coward": -2, "crazy": -2,
  "creative": 2, "crime": -3, "crisis": -3, "criticize": -2, "cruel": -3, "cry": -2, "cute": 2,
  "damage": -3, "danger": -2, "dead": -3, "debt": -2, "defeat": -2, "delight": 3, "depressed": -2,
  "desire": 1, "destruction": -3, "die": -3, "difficult": -1, "disaster": -2, "disgust": -3,
  "dishonest": -2, "dizzy": -1, "doubt": -1, "drop": -1, "dumb": -3, "eager": 2, "easy": 1,
  "effective": 2, "embarrassed": -2, "emergency": -2, "encouraging": 2, "enemy": -2,
  "enjoy": 2, "excited": 3, "exciting": 3, "fail": -2, "failure": -2, "faith": 1, "fake": -3,
  "fantastic": 4, "fear": -2, "fearless": 2, "fight": -1, "fine": 2, "fraud": -4, "free": 1,
  "fresh": 1, "friend": 1, "fuck": -4, "fun": 4, "funny": 4, "generous": 2, "glad": 3,
  "gloomy": -2, "god": 1, "good": 3, "grace": 1, "grand": 3, "great": 3, "greed": -3,
  "grief": -2, "guilty": -3, "happy": 3, "hard": -1, "harm": -2, "hate": -3, "hatred": -3,
  "healthy": 2, "heartbroken": -3, "hell": -4, "help": 2, "hero": 2, "honest": 2, "honor": 2,
  "hope": 2, "hopeful": 2, "horrible": -3, "hurt": -2, "idiot": -3, "ignore": -1, "ill": -2,
  "illegal": -3, "important": 2, "improve": 2, "incompetent": -2, "insane": -2, "inspire": 2,
  "interesting": 2, "ironic": -1, "joke": 2, "jolly": 2, "joy": 3, "justice": 2, "kill": -3,
  "kind": 2, "kiss": 2, "laugh": 1, "lazy": -1, "like": 2, "loss": -3, "love": 3, "lovely": 3,
  "luck": 3, "lucky": 3, "mad": -3, "meaningless": -2, "mess": -2, "miss": -2, "mistake": -2,
  "murder": -3, "nasty": -3, "natural": 1, "nice": 3, "no": -1, "not": -1, "obsessed": 2,
  "offend": -2, "ok": 2, "opportunity": 2, "pain": -2, "panic": -3, "paradise": 3,
  "passion": 1, "perfect": 3, "pleasant": 3, "please": 1, "pleasure": 3, "poison": -2,
  "pollute": -2, "poor": -2, "popular": 3, "power": 1, "powerful": 2, "praise": 3,
  "pretty": 1, "pride": 2, "problem": -2, "profit": 2, "promise": 1, "proud": 2,
  "punish": -2, "racist": -3, "rage": -2, "rape": -4, "ready": 1, "rebel": -2, "regret": -2,
  "relax": 2, "relief": 1, "reject": -1, "rescue": 2, "resign": -1, "resolve": 2,
  "respect": 2, "responsible": 2, "restful": 2, "rich": 2, "reward": 2, "ridiculous": -3,
  "rotten": -3, "sad": -2, "safe": 1, "satisfied": 2, "save": 2, "scared": -2, "secure": 2,
  "serious": -1, "shame": -2, "share": 1, "shock": -2, "shit": -4, "sick": -2, "silly": -1,
  "sin": -2, "smart": 1, "smile": 2, "sorry": -1, "sparkle": 3, "splendid": 3, "stink": -2,
  "stop": -1, "strange": -1, "strength": 2, "strong": 2, "stupid": -2, "success": 3,
  "suffer": -2, "sunshine": 2, "super": 3, "support": 2, "sure": 1, "surprise": 2,
  "sweet": 2, "talent": 2, "terrible": -3, "terrified": -3, "thank": 2, "threat": -2,
  "tired": -2, "top": 2, "torture": -4, "tragedy": -2, "trouble": -2, "trust": 1,
  "ugly": -3, "unbelievable": -1, "unhappy": -2, "useless": -2, "victim": -3, "victory": 3,
  "violence": -3, "vision": 1, "vulnerable": -2, "warm": 1, "waste": -1, "weak": -2,
  "wealth": 3, "weird": -1, "welcome": 2, "well": 2, "win": 4, "winner": 4, "wonderful": 4,
  "worse": -3, "worst": -3, "worth": 2, "wrong": -2, "yes": 1, "yummy": 3
};

const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
  "under", "until", "up", "very",
  "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

// --- Helper Functions ---

function simpleStemmer(word: string): string {
  let stem = word.toLowerCase();
  if (stem.length < 3) return stem;

  if (stem.endsWith('sses')) stem = stem.slice(0, -2);
  else if (stem.endsWith('ies')) stem = stem.slice(0, -2);
  else if (stem.endsWith('ss')) stem = stem;
  else if (stem.endsWith('s')) stem = stem.slice(0, -1);

  if (stem.endsWith('eed')) {
      stem = stem.slice(0, -1);
  } else if (stem.endsWith('ed') && stem.length > 3) {
       stem = stem.slice(0, -2);
  } else if (stem.endsWith('ing') && stem.length > 3) {
       stem = stem.slice(0, -3);
  }

  return stem;
}

export function performAnalysis(text: string): AnalysisResult {
  if (!text.trim()) {
      return {
          hasData: false,
          lexical: { sentenceCount: 0, wordCount: 0, charCount: 0, density: 0, wordFreq: [] },
          tokens: [],
          lemmas: [],
          stems: [],
          stopwords: { removed: [], cleanText: '', removedCount: 0 },
          pos: [],
          sentiment: { score: 0, verdict: 'Neutral', breakdown: [] }
      };
  }

  const doc = nlp(text);
  
  // Use default stopword set
  const mergedStopwords = STOPWORDS;

  // 1. Lexical
  const plainTextTokens: string[] = text.match(/\b\w+\b/g) || [];
  const wordCount = plainTextTokens.length;
  const charCount = text.length;
  const sentenceCount = doc.sentences().length;
  
  const uniqueWords = new Set(plainTextTokens.map(w => w.toLowerCase())).size;
  const density = wordCount > 0 ? (uniqueWords / wordCount) * 100 : 0;
  
  // Word Frequency
  const freqMap: Record<string, number> = {};
  plainTextTokens.forEach(t => {
      const w = t.toLowerCase();
      if (w.length > 2 && !mergedStopwords.has(w)) {
          freqMap[w] = (freqMap[w] || 0) + 1;
      }
  });
  const wordFreq = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

  // 2. Tokenization & POS & Lemmatization
  doc.compute('root');
  
  const posTags: { text: string; tags: string[] }[] = [];
  const lemmas: { original: string; root: string }[] = [];
  const tokens: string[] = [];
  
  doc.termList().forEach((term: any) => {
      tokens.push(term.text);
      
      const tags = Array.from(term.tags as Set<string>);
      posTags.push({ text: term.text, tags });
      
      if (term.text.trim()) {
          const root = term.root || term.normal || term.text;
          lemmas.push({ original: term.text, root });
      }
  });

  // 3. Stemming
  const stems = plainTextTokens.map(word => ({
      original: word,
      stem: simpleStemmer(word)
  }));

  // 4. Stopwords
  const removedStopwords: string[] = [];
  const cleanWords: string[] = [];
  plainTextTokens.forEach(word => {
      if (mergedStopwords.has(word.toLowerCase())) {
          removedStopwords.push(word);
      } else {
          cleanWords.push(word);
      }
  });
  const stopwordsData: StopwordData = {
      removed: removedStopwords,
      cleanText: cleanWords.join(' '),
      removedCount: removedStopwords.length
  };

  // 5. Sentiment
  let totalScore = 0;
  const sentimentBreakdown: { word: string; score: number }[] = [];
  
  plainTextTokens.forEach(word => {
      const lower = word.toLowerCase();
      if (SENTIMENT_DICTIONARY[lower]) {
          const score = SENTIMENT_DICTIONARY[lower];
          totalScore += score;
          sentimentBreakdown.push({ word, score });
      }
  });
  
  let verdict: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
  if (totalScore > 0) verdict = 'Positive';
  if (totalScore < 0) verdict = 'Negative';

  return {
      hasData: true,
      lexical: {
          sentenceCount,
          wordCount,
          charCount,
          density,
          wordFreq
      },
      tokens,
      lemmas,
      stems,
      stopwords: stopwordsData,
      pos: posTags,
      sentiment: {
          score: totalScore,
          verdict,
          breakdown: sentimentBreakdown
      }
  };
}