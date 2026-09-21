import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { usePageMutations } from "../hooks/usePageMutations";
import BoardView from "../components/BoardView";
import { Page } from "../types";
import Toolbar from "../components/Toolbar";
import { useLang } from "../contexts/LangContext";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension, GlobalAttributes, RawCommands } from '@tiptap/core'
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image"; 
import Link from "@tiptap/extension-link"; 
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { Instance } from 'tippy.js';
import { Globe, Lock, ChevronLeft, Save, Share2, History, MoreVertical } from "lucide-react";
import { useTitle } from "../hooks/useTitle";
import { motion, AnimatePresence } from "framer-motion";

interface FontSizeOptions { types: string[]; }
interface CustomCommandsOptions { suggestion: Omit<SuggestionOptions, 'editor'>; }

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    }
  }
}

const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize,
          renderHTML: attributes => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
        },
      },
    }] as GlobalAttributes;
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as RawCommands;
  },
});

const CustomCommands = Extension.create<CustomCommandsOptions>({
  name: 'customCommands', 
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => props.command({ editor, range }),
      },
    };
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});

export default function WorkspacePage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { updatePage } = usePageMutations();
  const { t } = useLang();
  const [page, setPage] = useState<Page | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  useTitle(`${localTitle || "Sem Título"}`);

  const extensions = useMemo(() => [
      StarterKit.configure({ 
        bulletList: { HTMLAttributes: { class: 'list-disc ml-6 space-y-2' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal ml-6 space-y-2' } },
        heading: { levels: [1, 2, 3] },
      }),
      Underline, TextStyle, Color, FontFamily, FontSize,
      Subscript, Superscript, 
      Highlight.configure({ multicolor: true }),
      TaskList.configure({ HTMLAttributes: { class: 'space-y-2' } }),
      TaskItem.configure({ HTMLAttributes: { class: 'flex gap-2 items-start' }, nested: true }),
      Image, 
      Link.configure({ openOnClick: false }), 
      CustomCommands.configure({
        suggestion: {
          items: ({ query }) => {
            return [
              { title: "H1 - Large Heading", command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() },
              { title: "H2 - Medium Heading", command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() },
              { title: "Bullet List", command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
              { title: "Task List", command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
              { title: "Blockquote", command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
            ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
          },
          render: () => {
            let component: HTMLDivElement;
            let popup: Instance[];
            return {
              onStart: (props) => {
                component = document.createElement('div');
                component.className = 'bg-black/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] backdrop-blur-2xl z-[100] p-1 animate-in fade-in zoom-in-95 duration-200';
                props.items.forEach((item: any) => {
                  const btn = document.createElement('button');
                  btn.className = 'w-full text-left px-4 py-3 text-[11px] hover:bg-[var(--accent-color)] hover:text-white rounded-xl transition-all text-white/70 font-black uppercase tracking-widest';
                  btn.innerText = item.title;
                  btn.onclick = () => props.command(item);
                  component.appendChild(btn);
                });
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as any,
                  appendTo: () => document.body,
                  content: component,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },
              onUpdate(props) {
                if (!props.items.length) { popup[0].hide(); return; }
                popup[0].setProps({ getReferenceClientRect: props.clientRect as any });
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') { popup[0].hide(); return true; }
                return false;
              },
              onExit() { popup[0].destroy(); component.remove(); },
            };
          },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing...",
        emptyEditorClass: "is-editor-empty before:content-[attr(data-placeholder)] before:text-white/20 before:float-left before:pointer-events-none before:italic before:font-medium",
      }),
    ], []);

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: { 
        class: "prose prose-lg max-w-none focus:outline-none min-h-[70vh] outline-none font-sans [&_p]:text-inherit [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit [&_li]:text-inherit",
      },
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (pageId) {
          await updatePage(pageId, { content: editor.getHTML() });
          setIsSaving(false);
        }
      }, 2000);
    },
  }, [t]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setAuthLoading(false);
      else navigate("/login");
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!pageId || authLoading || !editor) return;
    return onSnapshot(doc(db, "pages", pageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Page;
        setPage(data);
        if (document.activeElement?.id !== "page-title-input") setLocalTitle(data.title);
        if (!editor.isFocused && Math.abs(editor.getHTML().length - (data.content?.length || 0)) > 10) {
             editor.commands.setContent(data.content || "");
        }
      } else {
        navigate("/paginas");
      }
    });
  }, [pageId, editor, authLoading, navigate]);

  const handleTitleChange = (e: any) => {
    const val = e.target.value;
    setLocalTitle(val);
    setIsSaving(true);
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => { 
        if (pageId) {
            await updatePage(pageId, { title: val });
            setIsSaving(false);
        }
    }, 1000);
  };

  const getThemeStyles = (theme: string | undefined) => {
    switch(theme) {
      case 'light': return 'bg-white text-gray-900';
      case 'sepia': return 'bg-[#f8f1e3] text-[#5f4b32]';
      case 'dark': return 'bg-[#0f0f0f] text-[#e0e0e0] prose-invert';
      case 'black': return 'bg-black text-gray-400 prose-invert';
      default: return 'bg-transparent text-[var(--text-primary)]';
    }
  };

  if (authLoading || !page) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--accent-color)]"></div>
    </div>
  );

  return (
    <div className="main !p-0 overflow-hidden flex flex-col h-screen bg-[var(--bg-app)] relative" data-lenis-prevent>
      
      {/* PREMIUM HEADER */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-3xl bg-[var(--bg-app)]/40 z-50 shrink-0">
        <div className="flex items-center w-full">
          <button onClick={() => navigate("/paginas")} className="h-12 w-12 flex items-center justify-center text-[var(--text-primary)] bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center justify-between flex-1">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                   <span className="cursor-pointer text-[var(--accent-color)]/50 hover:text-[var(--accent-color)] transition-all duration-500 ease" onClick={() => navigate("/paginas")}>Workspace</span>
                   <span className="opacity-20 text-[var(--accent-color)]">/</span>
                   <span className="text-[var(--accent-color)]">{page.type === 'board' ? 'Operational Board' : 'Intelligence Report'}</span>
                </div>
                <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight truncate max-w-[400px]">
                    {localTitle || "Untitled Page"}
                </h2>
            </div>

            <div className="flex items-center gap-4">
              <AnimatePresence>
                {isSaving && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] opacity-60"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                    Synchronizing...
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-8 w-px bg-white/10 mx-2" />

              {auth.currentUser?.uid === page.ownerId && (
                <button 
                  onClick={() => updatePage(pageId!, { isPublic: !page.isPublic })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black tracking-[0.2em] border transition-all cursor-pointer uppercase ${
                    page.isPublic ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {page.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                  {page.isPublic ? "Public Access" : "Private Node"}
                </button>
              )}

              <div className="flex items-center gap-2">
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all border border-white/5 cursor-pointer">
                    <Share2 size={16} />
                </button>
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all border border-white/5 cursor-pointer">
                    <History size={16} />
                </button>
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all border border-white/5 cursor-pointer">
                    <MoreVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Editor Content Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar transition-colors duration-500 relative ${getThemeStyles(page.theme)}`}>
        
        {page.type === 'document' && (
            <Toolbar editor={editor} setPageTheme={(t) => updatePage(pageId!, { theme: t })} pageTheme={page.theme || 'light'} />
        )}

        <div className="max-w-[1000px] mx-auto py-20 px-8 md:px-16 min-h-full">
          
          <input 
            id="page-title-input" 
            className="w-full text-5xl md:text-6xl font-black border-none outline-none bg-transparent p-0 leading-tight placeholder:opacity-10 tracking-tighter mb-12 focus:ring-0" 
            value={localTitle} 
            onChange={handleTitleChange} 
            placeholder="NOME DO RELATÓRIO"
            style={{ color: 'inherit' }} 
          />
          
          <div className="w-full min-h-[70vh] cursor-text pb-64" onClick={() => editor?.commands.focus()}>
            {page.type === 'board' ? <BoardView page={page} /> : <EditorContent editor={editor} />}
          </div>

        </div>
      </div>
    </div>
  );
}