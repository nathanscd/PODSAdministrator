import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { usePages } from "../hooks/usePages";
import { Page, Task, Column } from "../types";
import { ArrowLeft, Plus, Layout } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function TodoPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { updatePage } = usePages();
  const [boardTitle, setBoardTitle] = useState("");
  const [boardData, setBoardData] = useState<{ tasks: Record<string, Task>; columns: Record<string, Column>; columnOrder: string[]; } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!pageId) return;
    return onSnapshot(doc(db, "pages", pageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Page;
        setBoardTitle(data.title || "");
        setBoardData({
          tasks: data.tasks || {},
          columns: data.columns || { "col-1": { id: "col-1", title: "A Fazer", taskIds: [] }, "col-2": { id: "col-2", title: "Em Andamento", taskIds: [] }, "col-3": { id: "col-3", title: "Concluído", taskIds: [] } },
          columnOrder: data.columnOrder || ["col-1", "col-2", "col-3"],
        });
      }
    });
  }, [pageId]);


  if (!boardData) return null;

  return (
    <PageTransition>
      <div className="main flex flex-col ml-10 -mt-10 h-screen transition-colors duration-300">
        
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => navigate("/todo")} className="!p-2 hover:opacity-70 border-none shadow-none bg-transparent">
              <ArrowLeft size={20} className="text-[var(--text-primary)]" />
            </button>
            <input 
              className="text-4xl font-black bg-transparent border-none outline-none w-full text-[var(--text-primary)] italic uppercase tracking-tighter placeholder:opacity-20"
              value={boardTitle}
              onChange={(e) => { setBoardTitle(e.target.value); updatePage(pageId!, { title: e.target.value }); }}
              placeholder="Sem título"
            />
          </div>
          <div className="bg-[var(--accent-color)] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Layout size={12} /> BOARD
          </div>
        </header>

        <main className="flex-1 overflow-x-auto custom-scrollbar flex gap-8 items-start p-2">
          <DragDropContext onDragEnd={() => {}}>
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex gap-8">
                  {boardData.columnOrder.map((columnId, index) => {
                    const column = boardData.columns[columnId];
                    const tasks = column.taskIds.map(id => boardData.tasks[id]).filter(Boolean);
                    return (
                      <Draggable key={column.id} draggableId={column.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className="w-[300px] flex flex-col">
                            <div className="flex items-center justify-between mb-6 px-2" {...provided.dragHandleProps}>
                              <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">{column.title}</h3>
                              <span className="text-[10px] font-bold opacity-30 text-[var(--text-primary)]">{tasks.length}</span>
                            </div>

                            <Droppable droppableId={column.id} type="task">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 min-h-[50px]">
                                  {tasks.map((task, idx) => (
                                    <Draggable key={task.id} draggableId={task.id} index={idx}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                          onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                          className="bg-[var(--card-bg)] p-5 mb-4 rounded-3xl border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all cursor-pointer backdrop-blur-md"
                                        >
                                          <p className="text-sm font-medium leading-relaxed text-[var(--text-primary)]">{task.content}</p>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  <button onClick={() => {}} className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl border border-dashed border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] bg-transparent shadow-none">
                                    <Plus size={18} /> Novo Item
                                  </button>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </main>
      </div>
    </PageTransition>
  );
}