
import { useState, useEffect, useMemo } from 'react';
import { Asset, Reservation, FilterOptions, UtilityType, CommunicationType } from '../types';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  setDoc
} from 'firebase/firestore';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showReservationConfirm, setShowReservationConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Asset>>({
    numeroSerie: '',
    modelo: '',
    localizacao: '',
    responsavel: '',
    sistemaVinculado: '',
    tipoComunicacao: 'outro',
    projeto: '',
    utility: 'Água',
    periodoUsoInicial: '',
    periodoUsoFinal: '',
    acessorios: '',
    observacoes: '',
    chipVinculado: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Firestore listeners for assets and reservations
  useEffect(() => {
    const unsubAssets = onSnapshot(collection(db, 'assets'), (snapshot) => {
      setAssets(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Asset)
      );
    });
    const unsubReservations = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      setReservations(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Reservation)
      );
    });
    return () => {
      unsubAssets();
      unsubReservations();
    };
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.numeroSerie?.trim()) errors.numeroSerie = 'Número de série obrigatório';
    if (!formData.modelo?.trim()) errors.modelo = 'Modelo obrigatório';
    if (!formData.localizacao?.trim()) errors.localizacao = 'Localização obrigatória';
    if (!formData.responsavel?.trim()) errors.responsavel = 'Responsável obrigatório';
    if (!formData.sistemaVinculado?.trim()) errors.sistemaVinculado = 'Sistema vinculado obrigatório';
    if (!formData.projeto?.trim()) errors.projeto = 'Projeto obrigatório';
    if (!formData.periodoUsoInicial?.trim()) errors.periodoUsoInicial = 'Data inicial obrigatória';
    if (!formData.periodoUsoFinal?.trim()) errors.periodoUsoFinal = 'Data final obrigatória';

    if (
      (formData.tipoComunicacao === 'NB' ||
        formData.tipoComunicacao === '3G' ||
        formData.tipoComunicacao === '4G') &&
      !formData.chipVinculado?.trim()
    ) {
      errors.chipVinculado = 'Chip obrigatório para este tipo de comunicação';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAsset = () => {
    setEditingId(null);
    setFormData({
      numeroSerie: '',
      modelo: '',
      localizacao: '',
      responsavel: '',
      sistemaVinculado: '',
      tipoComunicacao: 'outro',
      projeto: '',
      utility: 'Água',
      periodoUsoInicial: '',
      periodoUsoFinal: '',
      acessorios: '',
      observacoes: '',
      chipVinculado: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingId(asset.id);
    setFormData(asset);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSaveAsset = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        // Update existing asset
        const assetRef = doc(db, 'assets', editingId);
        await updateDoc(assetRef, {
          ...formData,
        });
        showNotification('success', 'Ativo atualizado com sucesso');
      } else {
        // Add new asset
        const newAsset = {
          ...formData,
          dataCriacao: new Date().toISOString(),
        };
        await addDoc(collection(db, 'assets'), newAsset);
        showNotification('success', 'Ativo cadastrado com sucesso');
      }
      setIsModalOpen(false);
    } catch (error) {
      showNotification('error', 'Erro ao salvar ativo');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'assets', id));
      setShowDeleteConfirm(null);
      showNotification('success', 'Ativo removido com sucesso');
    } catch (error) {
      showNotification('error', 'Erro ao remover ativo');
    }
  };

  const handleRequestReservation = async (assetId: string) => {
    const existingReservation = reservations.find(
      (r) => r.assetId === assetId && r.status === 'pending'
    );
    if (existingReservation) {
      showNotification('error', 'Já existe uma solicitação de reserva pendente');
      return;
    }
    try {
      await addDoc(collection(db, 'reservations'), {
        assetId,
        solicitanteName: 'Técnico de Manutenção',
        status: 'pending',
        dataSolicitacao: new Date().toISOString(),
      });
      showNotification('success', 'Solicitação de reserva enviada');
      setShowReservationConfirm(null);
    } catch (error) {
      showNotification('error', 'Erro ao solicitar reserva');
    }
  };

  const handleApproveReservation = async (reservationId: string) => {
    try {
      const reservationRef = doc(db, 'reservations', reservationId);
      await updateDoc(reservationRef, { status: 'approved' });
      showNotification('success', 'Reserva aprovada');
    } catch (error) {
      showNotification('error', 'Erro ao aprovar reserva');
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (filters.utility && asset.utility !== filters.utility) return false;
      if (filters.tipoComunicacao && asset.tipoComunicacao !== filters.tipoComunicacao)
        return false;
      if (filters.projeto && !asset.projeto.toLowerCase().includes(filters.projeto.toLowerCase()))
        return false;
      if (filters.responsavel && !asset.responsavel.toLowerCase().includes(filters.responsavel.toLowerCase()))
        return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          asset.numeroSerie.toLowerCase().includes(term) ||
          asset.modelo.toLowerCase().includes(term) ||
          asset.localizacao.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [assets, filters]);

  const uniqueProjects = Array.from(new Set(assets.map((a) => a.projeto)));
  const uniqueResponsaveis = Array.from(new Set(assets.map((a) => a.responsavel)));

  return {
    assets,
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
  };
};
