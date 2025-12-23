import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import WorkspacePage from "./WorkspacePage";

export default function HomePage() {
  const { pageId } = useParams<{ pageId: string }>();

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {pageId ? (
          <WorkspacePage />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <h1 className="text-3xl font-bold mb-4 text-gray-200">
              Selecione ou crie uma página
            </h1>
            <p className="text-gray-400">
              Use a barra lateral para navegar em seus documentos.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}