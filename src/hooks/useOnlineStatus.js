import { useEffect, useRef, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [message, setMessage] = useState(() =>
    navigator.onLine ? '' : 'You are offline. Previously visited content is still available.'
  );
  const restoredTimer = useRef(null);

  useEffect(() => {
    // Mantiene el aviso visible mientras el navegador informa que no hay conexión.
    function handleOffline() {
      if (restoredTimer.current) clearTimeout(restoredTimer.current);
      setIsOnline(false);
      setMessage('You are offline. Previously visited content is still available.');
    }

    // Informa que la conexión volvió y oculta el aviso después de unos segundos.
    function handleOnline() {
      setIsOnline(true);
      setMessage('Connection restored. PokeDoom is online again.');
      restoredTimer.current = setTimeout(() => setMessage(''), 3500);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (restoredTimer.current) clearTimeout(restoredTimer.current);
    };
  }, []);

  return { isOnline, message };
}
