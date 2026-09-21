import { useState, useEffect, useRef, useCallback } from 'react';
import { Opportunity } from '../types';

export const useOpportunityForm = (
  opp: Opportunity,
  onUpdate: (id: string, updates: Partial<Opportunity>) => void
) => {
  const [formData, setFormData] = useState<Opportunity>(opp);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setFormData(opp);
    setHasChanges(false);
    setIsSaving(false);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [opp.id]);

  // Debounce save only after user stops typing for 1.2s
  const handleChange = useCallback(
    (field: keyof Opportunity, value: any) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };
        const updates: Partial<Opportunity> = { [field]: value };

        // Domain logic: Reset status if stage is terminal
        if (
          field === 'businessStages' &&
          ['Post Sales', 'Archived', 'Lost'].includes(value)
        ) {
          newData.status = '';
          updates.status = '';
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setIsSaving(true);
        setHasChanges(true);

        saveTimeoutRef.current = setTimeout(() => {
          onUpdate(opp.id, newData);
          setIsSaving(false);
          setHasChanges(false);
        }, 1200);

        return newData;
      });
    },
    [opp.id, onUpdate]
  );

  const handleNumberChange = (field: keyof Opportunity, stringValue: string) => {
    const numValue = stringValue === '' ? 0 : Number(stringValue);
    handleChange(field, numValue);
  };

  const manualSave = () => {
    if (hasChanges) {
      onUpdate(opp.id, formData);
      setHasChanges(false);
      setIsSaving(false);
    }
  };

  return {
    formData,
    isSaving,
    hasChanges,
    handleChange,
    handleNumberChange,
    manualSave,
  };
};
