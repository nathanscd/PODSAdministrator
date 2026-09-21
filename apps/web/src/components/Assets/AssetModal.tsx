import React from 'react';
import { X } from 'lucide-react';
import { Asset, CommunicationType, UtilityType } from '../../types';
import { mockChips, mockOrcaSystems } from './mockData';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
  formData: Partial<Asset>;
  setFormData: (data: Partial<Asset>) => void;
  formErrors: Record<string, string>;
  onSave: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  editingId,
  formData,
  setFormData,
  formErrors,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingId ? 'Editar Ativo' : 'Novo Ativo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Número de Série *
              </label>
              <input
                type="text"
                value={formData.numeroSerie || ''}
                onChange={(e) =>
                  setFormData({ ...formData, numeroSerie: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.numeroSerie
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="SN-2024-001"
              />
              {formErrors.numeroSerie && (
                <p className="text-red-600 text-xs mt-1">{formErrors.numeroSerie}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                value={formData.modelo || ''}
                onChange={(e) =>
                  setFormData({ ...formData, modelo: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.modelo
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Medidor Inteligente MX-500"
              />
              {formErrors.modelo && (
                <p className="text-red-600 text-xs mt-1">{formErrors.modelo}</p>
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Localização *
              </label>
              <input
                type="text"
                value={formData.localizacao || ''}
                onChange={(e) =>
                  setFormData({ ...formData, localizacao: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.localizacao
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Ex: Laboratório de Testes"
              />
              {formErrors.localizacao && (
                <p className="text-red-600 text-xs mt-1">{formErrors.localizacao}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Responsável *
              </label>
              <input
                type="text"
                value={formData.responsavel || ''}
                onChange={(e) =>
                  setFormData({ ...formData, responsavel: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.responsavel
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Nome do responsável"
              />
              {formErrors.responsavel && (
                <p className="text-red-600 text-xs mt-1">{formErrors.responsavel}</p>
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Sistema Vinculado *
              </label>
              <select
                value={formData.sistemaVinculado || ''}
                onChange={(e) =>
                  setFormData({ ...formData, sistemaVinculado: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.sistemaVinculado
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              >
                <option value="">Selecione um sistema</option>
                {mockOrcaSystems.map((s) => (
                  <option key={s.id} value={s.nome}>
                    {s.nome}
                  </option>
                ))}
              </select>
              {formErrors.sistemaVinculado && (
                <p className="text-red-600 text-xs mt-1">{formErrors.sistemaVinculado}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Tipo de Comunicação
              </label>
              <select
                value={formData.tipoComunicacao || 'outro'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipoComunicacao: e.target.value as CommunicationType,
                  })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="NB">NB-IoT</option>
                <option value="3G">3G</option>
                <option value="4G">4G</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Projeto *
              </label>
              <input
                type="text"
                value={formData.projeto || ''}
                onChange={(e) =>
                  setFormData({ ...formData, projeto: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.projeto
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="Nome do projeto"
              />
              {formErrors.projeto && (
                <p className="text-red-600 text-xs mt-1">{formErrors.projeto}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Utility
              </label>
              <select
                value={formData.utility || 'Água'}
                onChange={(e) =>
                  setFormData({ ...formData, utility: e.target.value as UtilityType })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="Água">Água</option>
                <option value="Energia">Energia</option>
                <option value="Gás">Gás</option>
                <option value="Saneamento">Saneamento</option>
                <option value="Telecomunicações">Telecomunicações</option>
              </select>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Data Inicial *
              </label>
              <input
                type="date"
                value={formData.periodoUsoInicial || ''}
                onChange={(e) =>
                  setFormData({ ...formData, periodoUsoInicial: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.periodoUsoInicial
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {formErrors.periodoUsoInicial && (
                <p className="text-red-600 text-xs mt-1">{formErrors.periodoUsoInicial}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Data Final *
              </label>
              <input
                type="date"
                value={formData.periodoUsoFinal || ''}
                onChange={(e) =>
                  setFormData({ ...formData, periodoUsoFinal: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.periodoUsoFinal
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {formErrors.periodoUsoFinal && (
                <p className="text-red-600 text-xs mt-1">{formErrors.periodoUsoFinal}</p>
              )}
            </div>
          </div>

          {/* Chip Link */}
          {(formData.tipoComunicacao === 'NB' ||
            formData.tipoComunicacao === '3G' ||
            formData.tipoComunicacao === '4G') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Vincular Chip *
              </label>
              <select
                value={formData.chipVinculado || ''}
                onChange={(e) =>
                  setFormData({ ...formData, chipVinculado: e.target.value })
                }
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                  formErrors.chipVinculado
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              >
                <option value="">Selecione um chip</option>
                {mockChips.map((c) => (
                  <option key={c.id} value={`CHIP-${c.id}-${c.operadora}`}>
                    {c.operadora} - {c.numero}
                  </option>
                ))}
              </select>
              {formErrors.chipVinculado && (
                <p className="text-red-600 text-xs mt-1">{formErrors.chipVinculado}</p>
              )}
            </div>
          )}

          {/* Accessories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
              Acessórios
            </label>
            <input
              type="text"
              value={formData.acessorios || ''}
              onChange={(e) =>
                setFormData({ ...formData, acessorios: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Antena, suporte, cabos..."
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Informações adicionais..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-md"
          >
            Salvar Ativo
          </button>
        </div>
      </div>
    </div>
  );
};
