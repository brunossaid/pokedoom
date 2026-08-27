import { useRef } from 'react';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

function ConfirmModal({ title, message, confirmLabel, onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null);
  const modalRef = useRef(null);
  useModalAccessibility(modalRef, cancelButtonRef, onCancel);

  return (
    <div className="confirm-modal-backdrop" onMouseDown={onCancel}>
      <section
        className="confirm-modal"
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="confirm-modal-icon" aria-hidden="true">!</span>
        <h2 id="confirm-modal-title">{title}</h2>
        <p id="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button ref={cancelButtonRef} type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
