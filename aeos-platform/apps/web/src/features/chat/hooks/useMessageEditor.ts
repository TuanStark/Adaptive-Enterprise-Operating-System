import { useState, useRef, useEffect } from "react";
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface UseMessageEditorProps {
  channelName: string;
  submitButtonId: string;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function useMessageEditor({ channelName, submitButtonId, onTypingStart, onTypingStop }: UseMessageEditorProps) {
  const [isEmpty, setIsEmpty] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: `Message #${channelName}`,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setIsEmpty(editor.isEmpty);
      onTypingStart?.();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop?.();
      }, 2000);
    },
    editorProps: {
      attributes: {
        class: 'w-full h-full min-h-[40px] outline-none text-[15px] bg-transparent prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none'
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          document.getElementById(submitButtonId)?.click();
          return true;
        }
        return false;
      }
    }
  });

  // Re-run placeholder configuration when channelName changes
  useEffect(() => {
    if (editor) {
      editor.extensionManager.extensions.filter(
        extension => extension.name === 'placeholder'
      )[0].options['placeholder'] = `Message #${channelName}`;
      editor.view.dispatch(editor.state.tr);
    }
  }, [channelName, editor]);

  return { editor, isEmpty, setIsEmpty };
}
