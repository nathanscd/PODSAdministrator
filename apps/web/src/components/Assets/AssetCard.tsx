import React from 'react';
import { Edit2, Clock, Trash2 } from 'lucide-react';
import { Asset, Reservation } from '../../types';

interface AssetCardProps {
  asset: Asset;
  reservation?: Reservation;
  onEdit: (asset: Asset) => void;
  onReserve: (id: string) => void;
  onDelete: (id: string) => void;
  onApproveReservation: (id: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  reservation,
  onEdit,
  onReserve,
  onDelete,
  onApproveReservation,
}) => {
  const isReserved = reservation !== undefined && reservation.status === 'pending';

  return (
    <div
      className="rounded-2xl p-6 transition-shadow"
      style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Número de Série
          </p>
          <p className="font-mono font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {asset.numeroSerie}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Modelo
          </p>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {asset.modelo}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Localização
          </p>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {asset.localizacao}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Responsável
          </p>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {asset.responsavel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Sistema Vinculado
          </p>
          <p className="text-slate-900 font-semibold text-sm">
            {asset.sistemaVinculado}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Comunicação
          </p>
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'var(--color-info)', color: 'white' }}
          >
            {asset.tipoComunicacao}
          </span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Projeto
          </p>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {asset.projeto}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Utility
          </p>
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'var(--color-accent)', color: 'white' }}
          >
            {asset.utility}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
            Período de Uso
          </p>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {asset.periodoUsoInicial} até {asset.periodoUsoFinal}
          </p>
        </div>
        {asset.chipVinculado && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-neutral-600)' }}>
              Chip Vinculado
            </p>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {asset.chipVinculado}
            </p>
          </div>
        )}
      </div>

      {asset.observacoes && (
        <div
          className="mb-6 p-4 rounded-lg"
          style={{ background: 'var(--color-bg-app)', border: '1px solid var(--color-border-color)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-neutral-600)' }}>
            Observações
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{asset.observacoes}</p>
        </div>
      )}

      {isReserved && (
        <div
          className="mb-6 p-4 rounded-lg flex items-start gap-3"
          style={{ background: 'var(--color-warning)', border: '1px solid var(--color-warning)' }}
        >
          <Clock size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: 'white' }}>
              Solicitação de Reserva Pendente
            </p>
            <p className="text-xs mt-1" style={{ color: 'white', opacity: 0.9 }}>
              Aguardando aprovação do responsável
            </p>
          </div>
          {reservation && (
            <button
              onClick={() => onApproveReservation(reservation.id)}
              className="px-3 py-1 text-xs font-bold rounded transition-colors flex-shrink-0"
              style={{ background: 'var(--color-warning)', color: 'white' }}
            >
              Aprovar
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onEdit(asset)}
          className="flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-semibold"
          style={{ background: 'var(--color-info)', color: 'white' }}
        >
          <Edit2 size={16} />
          Editar
        </button>

        <button
          onClick={() => onReserve(asset.id)}
          disabled={isReserved}
          className="flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-warning)', color: 'white', opacity: isReserved ? 0.5 : 1 }}
        >
          <Clock size={16} />
          Reservar
        </button>

        <button
          onClick={() => onDelete(asset.id)}
          className="flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-semibold"
          style={{ background: 'var(--color-danger)', color: 'white' }}
        >
          <Trash2 size={16} />
          Remover
        </button>
      </div>
    </div>
  );
};
