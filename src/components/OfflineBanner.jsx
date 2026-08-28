import { useOnlineStatus } from '../hooks/useOnlineStatus';

function OfflineBanner() {
  const { isOnline, message } = useOnlineStatus();

  // No ocupa espacio cuando la conexión funciona y no hay mensajes pendientes.
  if (!message) return null;

  return (
    <div
      className={`connection-banner ${isOnline ? 'is-online' : 'is-offline'}`}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">{isOnline ? '✓' : '!'}</span>
      {message}
    </div>
  );
}

export default OfflineBanner;
