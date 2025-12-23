import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface EditorProps {
  initialContent: string;
  onUpdate: (html: string) => void;
}

const Editor = ({ initialContent, onUpdate }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  return (
    <div className="w-full h-full p-4">
      <EditorContent 
        editor={editor} 
        className="prose max-w-none focus:outline-none min-h-[500px]" 
      />
    </div>
  );
};

export default Editor;