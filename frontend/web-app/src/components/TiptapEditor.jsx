import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

import Underline from "@tiptap/extension-underline";

import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { Plugin } from "@tiptap/pm/state";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Quote,
  Code2,
} from "lucide-react";

import { useEffect } from "react";
import { sendCursorEvent } from "../websocket/websocketService";

const createCursorPlugin = (cursorUsers) => {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations = [];

        Object.entries(cursorUsers || {}).forEach(([email, position]) => {
          const cursor = document.createElement("span");

          cursor.className = "remote-cursor";

          cursor.innerHTML = `🟢 ${email}`;

          decorations.push(
            Decoration.widget(
              position,

              cursor,
            ),
          );
        });

        return DecorationSet.create(
          state.doc,

          decorations,
        );
      },
    },
  });
};

function TiptapEditor({
  content,

  onChange,
  editable = true,
  documentId,
  userEmail,
  cursorUsers,
}) {
  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      Underline,
    ],

    content,

    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none min-h-[600px] focus:outline-none",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    onSelectionUpdate({ editor }) {
      sendCursorEvent({
        documentId,

        userEmail,

        position: editor.state.selection.anchor,
      });
    },
  });
  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.registerPlugin(createCursorPlugin(cursorUsers));
  }, [editor]);
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const buttonClass = (active) =>
    `p-3 rounded-xl transition ${
      active ? "bg-[#5B5BD6] text-white" : "hover:bg-gray-100"
    }`;

  return (
    <div>
      {/* TOOLBAR */}

      {editable && (
        <div className="sticky top-[88px] z-40 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-2 mb-8 flex gap-2 shadow-sm flex-wrap">
          {/* BOLD */}

          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={buttonClass(editor.isActive("bold"))}
          >
            <Bold size={18} />
          </button>

          {/* ITALIC */}

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={buttonClass(editor.isActive("italic"))}
          >
            <Italic size={18} />
          </button>

          {/* UNDERLINE */}

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={buttonClass(editor.isActive("underline"))}
          >
            <UnderlineIcon size={18} />
          </button>

          {/* BULLET LIST */}

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClass(editor.isActive("bulletList"))}
          >
            <List size={18} />
          </button>

          {/* ORDERED LIST */}

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={buttonClass(editor.isActive("orderedList"))}
          >
            <ListOrdered size={18} />
          </button>

          {/* H1 */}

          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 1,
                })
                .run()
            }
            className={buttonClass(
              editor.isActive("heading", {
                level: 1,
              }),
            )}
          >
            <Heading1 size={18} />
          </button>

          {/* BLOCKQUOTE */}

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={buttonClass(editor.isActive("blockquote"))}
          >
            <Quote size={18} />
          </button>

          {/* CODE BLOCK */}

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={buttonClass(editor.isActive("codeBlock"))}
          >
            <Code2 size={18} />
          </button>
        </div>
      )}

      {/* EDITOR */}

      <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default TiptapEditor;
