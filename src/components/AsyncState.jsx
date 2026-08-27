export function LoadingState({ label, className = 'loading-dots' }) {
  return (
    <div className={className} role="status" aria-label={label}>
      <span>.</span><span>.</span><span>.</span>
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel = 'Try again', className = 'error-state', children }) {
  return (
    <div className={className} role="alert">
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>{retryLabel}</button>}
      {children}
    </div>
  );
}
