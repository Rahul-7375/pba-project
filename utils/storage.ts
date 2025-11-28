import { HistoryEntry, AnalysisResult, User } from '../types';

const HISTORY_KEY = 'textscope_history';
const USERS_KEY = 'textscope_users';

// --- History ---

export const historyService = {
  save: (username: string, text: string, result: AnalysisResult) => {
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    if (!allHistory[username]) {
      allHistory[username] = [];
    }
    
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      text,
      result
    };
    
    // Prepend and limit to last 50 entries to save space
    allHistory[username] = [entry, ...allHistory[username]].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  },

  get: (username: string): HistoryEntry[] => {
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return allHistory[username] || [];
  },

  clear: (username: string) => {
    const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    allHistory[username] = [];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  }
};

export const auth = {
  signup: (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (users[username]) {
      return false;
    }
    users[username] = { password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  },

  login: (username: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (users[username] && users[username].password === password) {
      return { username };
    }
    return null;
  }
};