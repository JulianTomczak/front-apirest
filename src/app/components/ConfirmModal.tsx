interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-fade-slide-up text-center">
        <p className="mb-4 text-foreground">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn-important"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
