import { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor | null;
  setPageTheme: (theme: string) => void;
  pageTheme: string;
}

const ToolbarButton = ({ onClick, isActive, children, title }: any) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-primary)] flex items-center justify-center ${
      isActive ? "bg-[var(--bg-sidebar)] text-[var(--accent-color)] shadow-sm" : ""
    }`}
    title={title}
    type="button"
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[var(--border-color)] mx-2 opacity-40" />;

const SelectField = ({ onChange, value, options }: any) => (
  <select
    value={value}
    onChange={onChange}
    className="bg-[var(--bg-sidebar)] text-[var(--text-primary)] text-xs border border-[var(--border-color)] rounded-lg px-2 py-1.5 outline-none hover:border-[var(--accent-color)] transition-colors cursor-pointer"
  >
    {options.map((opt: any) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export default function Toolbar({ editor, setPageTheme, pageTheme }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-12 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-app)]/80 backdrop-blur-md px-4 py-2.5 flex justify-center transition-all select-none">
      <div className="flex items-center flex-wrap gap-1.5 max-w-6xl">
        
        {/* Histórico */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
          </ToolbarButton>
        </div>

        <Divider />

        {/* Tipografia e Tamanho */}
        <div className="flex items-center gap-2">
          <SelectField 
            options={[
              { label: 'Inter', value: 'Inter' },
              { label: 'Serif', value: 'Serif' },
              { label: 'Mono', value: 'Monospace' },
            ]}
            onChange={(e: any) => {
              const font = e.target.value;
              font === 'Inter' ? editor.chain().focus().unsetFontFamily().run() : editor.chain().focus().setFontFamily(font).run();
            }}
          />
          
          <SelectField 
            value={editor.getAttributes('textStyle').fontSize || '16px'}
            options={[
              { label: '12px', value: '12px' },
              { label: '14px', value: '14px' },
              { label: '16px', value: '16px' },
              { label: '18px', value: '18px' },
              { label: '20px', value: '20px' },
              { label: '24px', value: '24px' },
              { label: '32px', value: '32px' },
            ]}
            onChange={(e: any) => editor.chain().focus().setFontSize(e.target.value).run()}
          />
        </div>

        <Divider />

        {/* Cabeçalhos */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive("paragraph")} title="Parágrafo">
            <span className="text-xs font-bold">P</span>
          </ToolbarButton>
          {[1, 2, 3].map((level) => (
            <ToolbarButton 
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()} 
              isActive={editor.isActive("heading", { level })}
            >
              <span className="text-xs font-bold">H{level}</span>
            </ToolbarButton>
          ))}
        </div>

        <Divider />

        {/* Estilo e Cor */}
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
            <span className="font-bold text-sm">B</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
            <span className="italic font-serif text-sm">I</span>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")}>
            <span className="underline text-sm">U</span>
          </ToolbarButton>
          
          <div className="w-8 h-8 rounded-lg border border-[var(--border-color)] overflow-hidden relative hover:border-[var(--accent-color)] transition-colors">
            <input 
              type="color" 
              className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
              onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()}
            />
          </div>
        </div>

        <Divider />

        {/* Alinhamento e Listas */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16" /></svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M4 18h16" /></svg>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/><path d="M9 6h11M9 12h11M9 18h11"/></svg>
          </ToolbarButton>
        </div>
        
        <Divider />

        {/* Tema da Página */}
        <div className="flex items-center gap-2.5 ml-2">
           <div className="flex bg-[var(--bg-sidebar)] p-1 rounded-xl border border-[var(--border-color)] gap-1">
             {['light', 'sepia', 'dark', 'black'].map((t) => (
               <button 
                  key={t}
                  onClick={() => setPageTheme(t)}
                  className={`w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110 ${pageTheme === t ? 'ring-2 ring-[var(--accent-color)]' : ''}`} 
                  style={{ backgroundColor: t === 'light' ? '#fff' : t === 'sepia' ? '#f8f1e3' : t === 'dark' ? '#191919' : '#000' }}
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}