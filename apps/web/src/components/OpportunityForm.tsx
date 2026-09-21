'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Briefcase, Trash2, AlertTriangle, Save } from 'lucide-react';
import { Opportunity } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useOptions } from '../hooks/useOptions';
import { useOpportunityForm } from '../hooks/useOpportunityForm';
import { useState } from 'react';
import { useLang } from "../contexts/LangContext";
import {
  BasicInfoSection,
  SpecsSection,
  MetricsSection,
  AdditionalInfoSection,
} from './Opportunities/OpportunityFormSections';

interface Props {
  opp: Opportunity;
  onUpdate: (id: string, updates: Partial<Opportunity>) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  allOpportunities: Opportunity[];
}

export default function OpportunityForm({ opp, onUpdate, onClose, onDelete }: Props) {
  const { t } = useLang();
  const { isAdmin } = useAuth();
  const { optionsMap, addOption, removeOption, renameOption } = useOptions();

  const { formData, isSaving, hasChanges, handleChange, handleNumberChange, manualSave } = useOpportunityForm(opp, onUpdate);

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const tryClose = () => (hasChanges ? setShowUnsavedModal(true) : onClose());
  const confirmClose = () => onClose();
  const cancelClose = () => setShowUnsavedModal(false);

  const commonProps = { formData, handleChange, optionsMap, addOption, removeOption, renameOption, isAdmin };

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end" data-lenis-prevent>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={tryClose}
      />

      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-[var(--bg-app)] h-full border-l border-[var(--border-color)] flex flex-col shadow-2xl"
      >
        {/* Header Corporativo */}
        <header className="flex justify-between items-center px-8 py-6 border-b border-[var(--border-color)] bg-[var(--card-bg)] shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[var(--border-color)]/30 rounded text-[var(--text-secondary)]">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Edit Opportunity</h2>
              <p className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-medium">{opp.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => manualSave()}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-app)] text-xs font-bold rounded hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={tryClose}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
          <input
            className="w-full bg-transparent border-none outline-none text-4xl font-semibold text-[var(--text-primary)] placeholder-[var(--text-secondary)]/20"
            value={formData.description || ''}
            placeholder="Untitled Opportunity"
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <div className="space-y-10">
            <BasicInfoSection {...commonProps} />
            <SpecsSection {...commonProps} />
            <MetricsSection {...commonProps} handleNumberChange={handleNumberChange} />
            <AdditionalInfoSection {...commonProps} />
          </div>

          <div className="pt-10 border-t border-[var(--border-color)]">
            <button
              onClick={() => confirm('Delete this opportunity?') && onDelete(opp.id)}
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} /> Delete permanently
            </button>
          </div>
        </div>

        {/* Modal de confirmação */}
        <AnimatePresence>
          {showUnsavedModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[10001] flex items-center justify-center bg-[var(--bg-app)]/80 backdrop-blur-sm p-4"
            >
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-lg shadow-xl max-w-sm w-full">
                <AlertTriangle className="text-amber-500 mb-4" size={32} />
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Unsaved changes</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">You have unsaved changes. Do you want to save them before leaving?</p>
                <div className="flex gap-3">
                  <button onClick={() => { manualSave(); onClose(); }} className="flex-1 py-2 bg-[var(--text-primary)] text-[var(--bg-app)] text-xs font-bold rounded">Save & Leave</button>
                  <button onClick={confirmClose} className="flex-1 py-2 bg-transparent border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold rounded">Discard</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}