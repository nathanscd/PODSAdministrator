import React from 'react';
import { Clock } from 'lucide-react';

interface ReservationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ReservationConfirmModal: React.FC<ReservationConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock size={24} className="text-yellow-600" />
          <h3 className="text-xl font-bold text-slate-900">Solicitar Reserva</h3>
        </div>
        <p className="text-slate-600 mb-6">
          Deseja solicitar a reserva deste ativo? O responsável será notificado para aprovação.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
          >
            Solicitar
          </button>
        </div>
      </div>
    </div>
  );
};
