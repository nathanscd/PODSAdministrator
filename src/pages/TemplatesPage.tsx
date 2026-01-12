import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { 
  Zap
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { PageType } from "../types";

interface Template {
  id: string;
  title: string;
  description: string;
  type: PageType;
  data: any; 
}

const TEMPLATES: Template[] = [
  {
    id: "task-tracker",
    title: "Task Tracker",
    description: "Gerenciamento completo de tarefas com colunas personalizadas.",
    type: "board",
    data: {
      columns: {
        "col-1": { id: "col-1", title: "Backlog", taskIds: [] },
        "col-2": { id: "col-2", title: "Em Execução", taskIds: [] },
        "col-3": { id: "col-3", title: "Revisão", taskIds: [] },
        "col-4": { id: "col-4", title: "Finalizado", taskIds: [] }
      },
      columnOrder: ["col-1", "col-2", "col-3", "col-4"]
    }
  },
  {
    id: "crm-vendas",
    title: "Pipeline de Vendas",
    description: "Acompanhe leads e oportunidades em cada estágio do funil.",
    type: "board",
    data: {
      columns: {
        "lead": { id: "lead", title: "Prospecção", taskIds: [] },
        "qualif": { id: "qualif", title: "Qualificação", taskIds: [] },
        "prop": { id: "prop", title: "Proposta Enviada", taskIds: [] },
        "nego": { id: "nego", title: "Negociação", taskIds: [] },
        "ganho": { id: "ganho", title: "Fechado Ganho", taskIds: [] }
      },
      columnOrder: ["lead", "qualif", "prop", "nego", "ganho"]
    }
  },
  {
    id: "docs-report",
    title: "Relatório Mensal",
    description: "Template de documento com estrutura para reports de performance.",
    type: "document",
    data: {
      content: "<h1>Relatório de Performance</h1><p>Insira aqui os principais KPIs do mês...</p><h2>Destaques</h2><ul><li></li></ul>"
    }
  }
];

export default function TemplatesPage() {
  const { createPage } = usePages();
  const navigate = useNavigate();

  const handleUseTemplate = async (template: Template) => {
    const id = await createPage(template.title, template.type, template.data);
    if (id) {
      const route = template.type === "board" ? "todo" : "page";
      navigate(`/${route}/${id}`);
    }
  };

  return (
    <PageTransition>
      <div className="main !p-0 bg-[var(--bg-app)] min-h-screen custom-scrollbar">
        <header className="pt-20 pb-12 px-8 lg:px-24">
          <div className="flex items-center gap-3 text-[var(--accent-color)] mb-4">
            <Zap size={20} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Energy Hub Templates</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-[0.8] mb-6">
            Galeria de <br /> <span className="text-[var(--accent-color)]">Efetividade</span>
          </h1>
          <p className="text-[var(--text-secondary)] opacity-60 font-medium max-w-md">Selecione uma estrutura pré-configurada para otimizar seu tempo de resposta operacional.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 lg:px-24 pb-40">
          {TEMPLATES.map((template) => (
            <div 
              key={template.id}
              onClick={() => handleUseTemplate(template)}
              className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all duration-500 cursor-pointer flex flex-col items-start"
            >
              <div className="p-5 bg-[var(--bg-app)] rounded-3xl text-[var(--accent-color)] mb-8 group-hover:scale-110 transition-transform">
              </div>
              
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{template.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-60 mb-8">{template.description}</p>

              <div className="mt-auto w-full flex justify-between items-center pt-6 border-t border-[var(--border-color)]">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{template.type}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)]">Utilizar</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}