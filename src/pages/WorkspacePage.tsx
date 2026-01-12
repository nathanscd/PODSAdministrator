import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { usePages } from "../hooks/usePages";
import BoardView from "../components/BoardView";
import { Page } from "../types";
import Toolbar from "../components/Toolbar";

import { useEditor, EditorContent } from "@tiptap/react";
import { Extension, GlobalAttributes, RawCommands } from '@tiptap/core'
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { Instance } from 'tippy.js';
import { Globe, Lock, ChevronLeft } from "lucide-react";

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
  name: 'customCommands', // Nome alterado para evitar conflito
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
  const { updatePage } = usePages();
  const [page, setPage] = useState<Page | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        bulletList: { HTMLAttributes: { class: 'list-disc ml-6 space-y-2' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal ml-6 space-y-2' } },
      }),
      Underline, TextStyle, Color, FontFamily, FontSize,
      CustomCommands.configure({
        suggestion: {
          items: ({ query }) => {
            return [
              { title: 'Título 1', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() },
              { title: 'Título 2', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() },
              { title: 'Lista Bullets', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
              { title: 'Lista Numérica', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
              { title: 'Citação', command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
            ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
          },
          render: () => {
            let component: HTMLDivElement;
            let popup: Instance[];
            return {
              onStart: (props) => {
                component = document.createElement('div');
                component.className = 'bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden min-w-[220px] backdrop-blur-xl z-[100] p-1';
                props.items.forEach((item: any) => {
                  const btn = document.createElement('button');
                  btn.className = 'w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--accent-color)] hover:text-white rounded-xl transition-all text-[var(--text-primary)] font-medium';
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
        placeholder: "Digite '/' para comandos...",
        emptyEditorClass: "is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none before:italic",
      }),
    ],
    editorProps: {
      attributes: { class: "prose prose-lg max-w-none focus:outline-none min-h-[60vh] outline-none text-inherit font-sans" },
    },
    onUpdate: ({ editor }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (pageId) updatePage(pageId, { content: editor.getHTML() });
      }, 1500);
    },
  });

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
        if (!editor.isFocused && data.content !== editor.getHTML()) {
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
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(() => { if (pageId) updatePage(pageId, { title: val }) }, 800);
  };

  if (authLoading || !page) return null;

  return (
    <div className="main ml-10 -mr-10 -mt-10 !p-0 overflow-hidden flex flex-col h-screen bg-[var(--bg-app)]">
      <nav className="h-14 px-8 flex items-center justify-between border-b border-[var(--border-color)] backdrop-blur-md bg-transparent shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/paginas")} className="p-2 hover:bg-[var(--card-bg)] rounded-xl transition-all text-[var(--text-primary)] border-none bg-transparent">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 font-bold text-sm tracking-tighter uppercase opacity-50 text-[var(--text-primary)]">
               <span>{page.type === 'board' ? '📊' : '📄'}</span>
               <span className="truncate max-w-[200px]">{localTitle || "Sem título"}</span>
            </div>

            <button 
              onClick={() => updatePage(pageId!, { isPublic: !page.isPublic })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                page.isPublic ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
              }`}
            >
              {page.isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {page.isPublic ? "Público" : "Privado"}
            </button>
          </div>
        </div>
      </nav>

      {page.type === 'document' && <Toolbar editor={editor} setPageTheme={(t) => updatePage(pageId!, { theme: t })} pageTheme={page.theme || 'light'} />}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-24 py-12">
        <div className="max-w-[900px] mx-auto space-y-12 pb-40">
          <input 
            id="page-title-input" 
            className="w-full text-6xl font-black border-none outline-none bg-transparent focus:ring-0 p-0 leading-tight text-[var(--text-primary)] placeholder:opacity-10 tracking-tighter italic uppercase" 
            value={localTitle} 
            onChange={handleTitleChange} 
            placeholder="Título da Página" 
          />
          <div className="w-full min-h-[60vh] cursor-text" onClick={() => editor?.commands.focus()}>
            {page.type === 'board' ? <BoardView page={page} /> : <EditorContent editor={editor} />}
          </div>
        </div>
      </div>
    </div>
  );
}