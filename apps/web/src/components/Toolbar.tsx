import { Editor } from "@tiptap/react";
import { 
  Bold, Italic, Underline, Strikethrough, Code, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, 
  Undo, Redo, Link as LinkIcon, Image as ImageIcon, 
  Minus, Eraser, Type, Palette, Heading1, Heading2, Heading3,
  Sun, Moon, Coffee, Terminal, ChevronDown, Subscript as SubIcon,
  Superscript as SuperIcon, Highlighter, CaseSensitive,
  ListCheck
} from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  editor: Editor | null;
  setPageTheme: (theme: string) => void;
  pageTheme: string;
}

const Divider = () => <div className="w-px h-5 bg-border/40 mx-1.5 self-center" />;

const ColorDropdown = ({ icon, color, onSelect, label }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const colors = [
        '#ffffff', '#ff6a00', '#ff0080', '#8a2be2', '#2651dc', 
        '#dc2626', '#10b981', '#f59e0b', '#6366f1', '#a855f7',
        '#ec4899', '#ef4444', '#facc15', '#4ade80', '#2dd4bf'
    ];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={`h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 ${isOpen ? 'bg-muted text-foreground' : ''}`}
                title={label}
            >
                <div className="relative flex items-center justify-center">
                    {icon}
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: color || 'transparent' }} />
                </div>
            </Button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-xl shadow-xl z-[100] grid grid-cols-5 gap-2 backdrop-blur-xl"
                    >
                        {colors.map(c => (
                            <button 
                                key={c}
                                onClick={() => { onSelect(c); setIsOpen(false); }}
                                className="h-6 w-6 rounded-md border border-border/40 hover:scale-110 transition-transform cursor-pointer"
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SelectField = ({ value, options, onChange, icon }: any) => (
    <div className="relative flex items-center gap-1.5 px-3 py-1 bg-muted/40 border border-border/40 rounded-lg hover:border-border transition-all h-9">
        {icon}
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-[11px] font-semibold uppercase tracking-wider text-muted-foreground outline-none cursor-pointer appearance-none pr-3"
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
            ))}
        </select>
        <ChevronDown size={12} className="text-muted-foreground/60 pointer-events-none absolute right-2.5" />
    </div>
);

export default function Toolbar({ editor, setPageTheme, pageTheme }: ToolbarProps) {
  if (!editor) return null;

  const addImage = useCallback(() => {
    const url = window.prompt('URL da imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const ToggleGroupAny = ToggleGroup as any;
  const formattingToggleGroupProps = { type: "multiple" } as any;
  const alignmentToggleGroupProps = { type: "single" } as any;

  return (
    <div className="sticky top-0 z-[60] w-full bg-background/80 backdrop-blur-2xl border-b border-border/40 py-2 px-4 flex justify-start lg:justify-center shadow-sm select-none overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* History Group */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Undo"
          >
            <Undo size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Redo"
          >
            <Redo size={14} />
          </Button>
        </div>

        <Divider />

        {/* Text Style Selectors */}
        <div className="flex items-center gap-2">
            <SelectField 
                icon={<CaseSensitive size={12} className="text-primary" />}
                value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                options={[
                    { label: 'Inter', value: 'Inter' },
                    { label: 'Serif', value: 'ui-serif, Georgia' },
                    { label: 'Mono', value: 'monospace' },
                ]}
                onChange={(font: string) => font === 'Inter' ? editor.chain().focus().unsetFontFamily().run() : editor.chain().focus().setFontFamily(font).run()}
            />
            <SelectField 
                value={editor.getAttributes('textStyle').fontSize || '16px'}
                options={[
                    { label: '12px', value: '12px' },
                    { label: '14px', value: '14px' },
                    { label: '16px', value: '16px' },
                    { label: '24px', value: '24px' },
                    { label: '32px', value: '32px' },
                ]}
                onChange={(size: string) => editor.chain().focus().setFontSize(size).run()}
            />
        </div>

        <Divider />

        {/* Basic Formatting */}
        <ToggleGroupAny type="multiple" className="bg-muted/40 p-1 rounded-xl border border-border/40 gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="h-7 w-7 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Bold"
          >
            <Bold size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Italic"
          >
            <Italic size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Underline"
          >
            <Underline size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Strikethrough"
          >
            <Strikethrough size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Code"
          >
            <Code size={13} />
          </Toggle>
        </ToggleGroupAny>

        {/* Colors & Marks */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/40">
            <ColorDropdown 
                icon={<Palette size={13} />} 
                color={editor.getAttributes('textStyle').color}
                onSelect={(c: string) => editor.chain().focus().setColor(c).run()}
                label="Text Color"
            />
            <ColorDropdown 
                icon={<Highlighter size={13} />} 
                color={editor.getAttributes('highlight').color}
                onSelect={(c: string) => editor.chain().focus().toggleHighlight({ color: c }).run()}
                label="Highlight Color"
            />
            <Toggle
              size="sm"
              pressed={editor.isActive("subscript")}
              onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
              className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
              title="Subscript"
            >
                <SubIcon size={13} />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("superscript")}
              onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
              className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
              title="Superscript"
            >
                <SuperIcon size={13} />
            </Toggle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
              title="Clear Format"
            >
                <Eraser size={13} />
            </Button>
        </div>

        <Divider />

        {/* Headings */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/40">
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="H1"
          >
            <Heading1 size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="H2"
          >
            <Heading2 size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="H3"
          >
            <Heading3 size={13} />
          </Toggle>
        </div>

        <Divider />

        {/* Alignments */}
        <ToggleGroupAny 
          type="single" 
          value={
            editor.isActive({ textAlign: 'center' }) ? 'center' :
            editor.isActive({ textAlign: 'right' }) ? 'right' :
            editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left'
          }
          onValueChange={(val: string) => val && editor.chain().focus().setTextAlign(val).run()}
          className="bg-muted/40 p-1 rounded-xl border border-border/40 gap-0.5"
        >
          <ToggleGroupItem value="left" className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground" title="Left">
            <AlignLeft size={13} />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground" title="Center">
            <AlignCenter size={13} />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground" title="Right">
            <AlignRight size={13} />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground" title="Justify">
            <AlignJustify size={13} />
          </ToggleGroupItem>
        </ToggleGroupAny>

        <Divider />

        {/* Lists & Objects */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/40">
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Bullets"
          >
            <List size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Ordered"
          >
            <ListOrdered size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("taskList")}
            onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Tasks"
          >
            <ListCheck size={13} />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Quote"
          >
            <Quote size={13} />
          </Toggle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Divider"
          >
            <Minus size={13} />
          </Button>
        </div>

        {/* Media */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/40">
          <Toggle
            size="sm"
            pressed={editor.isActive("link")}
            onPressedChange={setLink}
            className="h-7 w-7 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground"
            title="Link"
          >
            <LinkIcon size={13} />
          </Toggle>
          <Button
            variant="ghost"
            size="icon"
            onClick={addImage}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Image"
          >
            <ImageIcon size={13} />
          </Button>
        </div>

        <Divider />

        {/* Theme Switcher */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/40">
          {[
            { id: 'light', icon: <Sun size={13} /> },
            { id: 'sepia', icon: <Coffee size={13} /> },
            { id: 'dark', icon: <Moon size={13} /> },
            { id: 'black', icon: <Terminal size={13} /> },
          ].map((t) => (
            <Button
              key={t.id}
              variant="ghost"
              size="icon"
              onClick={() => setPageTheme(t.id)}
              className={`h-7 w-7 rounded-lg transition-all ${pageTheme === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title={`Theme: ${t.id}`}
            >
              {t.icon}
            </Button>
          ))}
        </div>

      </div>
    </div>
  );
}