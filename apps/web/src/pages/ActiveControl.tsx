'use client';

import React from 'react';
import { Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { AssetCard } from '../components/Assets/AssetCard';
import { AssetFilters } from '../components/Assets/AssetFilters';
import { AssetModal } from '../components/Assets/AssetModal';
import { DeleteConfirmModal } from '../components/Assets/DeleteConfirmModal';
import { ReservationConfirmModal } from '../components/Assets/ReservationConfirmModal';

export default function EquipmentControl() {
  const {
    reservations,
    isModalOpen,
    setIsModalOpen,
    editingId,
    filters,
    setFilters,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showReservationConfirm,
    setShowReservationConfirm,
    notification,
    formData,
    setFormData,
    formErrors,
    handleAddAsset,
    handleEditAsset,
    handleSaveAsset,
    handleDeleteAsset,
    handleRequestReservation,
    handleApproveReservation,
    filteredAssets,
    uniqueProjects,
    uniqueResponsaveis,
  } = useAssets();

  return (
    <div
      className="min-h-screen p-6 md:p-10"
      style={{
        background: 'linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-to))',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-black mb-2 tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Gestão de Ativos
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Controle e acompanhamento de amostras e equipamentos
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              background: notification.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
              color: 'white',
              border: `1px solid ${notification.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            }}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <AssetFilters
              filters={filters}
              setFilters={setFilters}
              uniqueProjects={uniqueProjects}
              uniqueResponsaveis={uniqueResponsaveis}
            />
          </div>

          {/* Main Content - Assets */}
          <div className="lg:col-span-3">
            {/* Add Button */}
            <button
              onClick={handleAddAsset}
              className="mb-6 w-full md:w-auto px-6 py-3 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
              style={{
                background: 'var(--color-accent)',
                color: 'white',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Plus size={20} />
              Adicionar Ativo
            </button>

            {/* Assets Grid */}
            {filteredAssets.length === 0 ? (
              <div
                className="rounded-2xl border p-12 text-center shadow-sm"
                style={{
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border-color)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-neutral-light)' }} />
                <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Nenhum ativo encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    reservation={reservations.find(
                      (r) => r.assetId === asset.id && r.status === 'pending'
                    )}
                    onEdit={handleEditAsset}
                    onReserve={(id) => setShowReservationConfirm(id)}
                    onDelete={(id) => setShowDeleteConfirm(id)}
                    onApproveReservation={handleApproveReservation}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        onSave={handleSaveAsset}
      />

      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteAsset(showDeleteConfirm)}
      />

      <ReservationConfirmModal
        isOpen={!!showReservationConfirm}
        onClose={() => setShowReservationConfirm(null)}
        onConfirm={() =>
          showReservationConfirm && handleRequestReservation(showReservationConfirm)
        }
      />
    </div>
  );
}
