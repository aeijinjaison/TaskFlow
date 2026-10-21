import { useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    const ok = await onConfirm();
    if (ok !== false) onClose();
    else setBusy(false);
  };

  return (
    <Modal titleId="confirm-title" title={title} onClose={busy ? () => {} : onClose} size="sm">
      <div className="modal-body">
        <p className="muted">{message}</p>
      </div>
      <footer className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy} data-autofocus>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
          {busy && <Spinner />} {confirmLabel}
        </button>
      </footer>
    </Modal>
  );
}
