import { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

export default function DatabaseCleaner() {
  const [cleaning, setCleaning] = useState(false);

  const cleanDatabase = async () => {
    // Confirmação dupla para segurança
    const confirm1 = confirm("ATENÇÃO: Isso apagará TODAS as oportunidades do banco de dados. Tem certeza?");
    if (!confirm1) return;

    const confirm2 = confirm("Última chance: Essa ação é irreversível. Confirmar limpeza total?");
    if (!confirm2) return;

    setCleaning(true);

    try {
      const colRef = collection(db, "opportunities");
      const snapshot = await getDocs(colRef);
      
      if (snapshot.empty) {
        alert("O banco de dados já está vazio.");
        setCleaning(false);
        return;
      }

      console.log(`Encontrados ${snapshot.size} documentos para deletar...`);

      // O Firestore permite deletar apenas 500 docs por batch.
      // Vamos fazer em lotes seguros de 400.
      const batchSize = 400;
      let batch = writeBatch(db);
      let count = 0;
      let totalDeleted = 0;

      for (const document of snapshot.docs) {
        batch.delete(doc(db, "opportunities", document.id));
        count++;
        totalDeleted++;

        if (count >= batchSize) {
          await batch.commit();
          console.log(`Deletados ${totalDeleted} registros...`);
          batch = writeBatch(db); // Novo batch
          count = 0;
        }
      }

      // Commit final dos restantes
      if (count > 0) {
        await batch.commit();
      }

      alert(`Limpeza concluída! ${totalDeleted} oportunidades foram removidas.`);
      window.location.reload();

    } catch (error) {
      console.error("Erro ao limpar banco:", error);
      alert("Ocorreu um erro durante a limpeza. Verifique o console.");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      <button 
        onClick={cleanDatabase}
        disabled={cleaning}
        className={`flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${cleaning ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {cleaning ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
        <span>{cleaning ? "Limpando..." : "LIMPAR TUDO (RESET)"}</span>
      </button>
    </div>
  );
}