import { useState } from 'react';
import { clearStoredHistory, getHistory } from '../services/historyStorage';

export function useHistory() {
  const [history, setHistory] = useState(getHistory);

  function clearHistory() {
    clearStoredHistory();
    setHistory([]);
  }

  return { history, clearHistory };
}
