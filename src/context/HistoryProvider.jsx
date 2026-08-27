import { useCallback, useMemo, useState } from 'react';
import { HistoryContext } from './HistoryContext';
import { clearStoredHistory, getHistory, recordPokemonView } from '../services/historyStorage';

function HistoryProvider({ children }) {
  const [history, setHistory] = useState(getHistory);
  const recordView = useCallback((pokemon) => setHistory(recordPokemonView(pokemon)), []);
  const clearHistory = useCallback(() => {
    if (!clearStoredHistory()) return false;
    setHistory([]);
    return true;
  }, []);
  const value = useMemo(() => ({ history, recordView, clearHistory }), [history, recordView, clearHistory]);
  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export default HistoryProvider;
