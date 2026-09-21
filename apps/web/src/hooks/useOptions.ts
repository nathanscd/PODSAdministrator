import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const OPTIONS_DOC_ID = "opportunity_options"; // ID do documento de configurações

export function useOptions() {
  const [optionsMap, setOptionsMap] = useState<Record<string, string[]>>({});

  // 1. OUVIR AS OPÇÕES DO FIREBASE EM TEMPO REAL
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", OPTIONS_DOC_ID), (snapshot) => {
      if (snapshot.exists()) {
        setOptionsMap(snapshot.data() as Record<string, string[]>);
      } else {
        // Se não existir, cria o documento vazio
        setDoc(doc(db, "settings", OPTIONS_DOC_ID), {});
      }
    });
    return unsub;
  }, []);

  // 2. ADICIONAR NOVA OPÇÃO (Ex: Criar "COPEL")
  const addOption = async (field: string, value: string) => {
    if (!value) return;
    const ref = doc(db, "settings", OPTIONS_DOC_ID);
    await updateDoc(ref, {
      [field]: arrayUnion(value)
    }).catch(async (err) => {
        // Se der erro (provavelmente documento não existe), cria e tenta de novo
        await setDoc(ref, { [field]: [value] }, { merge: true });
    });
  };

  // 3. REMOVER OPÇÃO
  const removeOption = async (field: string, value: string) => {
    const ref = doc(db, "settings", OPTIONS_DOC_ID);
    await updateDoc(ref, {
      [field]: arrayRemove(value)
    });
  };

  const renameOption = async (field: string, oldValue: string, newValue: string) => {
    if (!newValue) return;
    const ref = doc(db, "settings", OPTIONS_DOC_ID);
    await updateDoc(ref, {
      [field]: arrayRemove(oldValue)
    });
    await updateDoc(ref, {
      [field]: arrayUnion(newValue)
    });
  };

  return { optionsMap, addOption, removeOption, renameOption };
}