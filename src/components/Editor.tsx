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
    <div className="typearea">
      <EditorContent 
        editor={editor} 
        className="typearea" 
      />
    </div>
  );
};

export default Editor;