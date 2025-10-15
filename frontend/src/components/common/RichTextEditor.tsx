import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Extension } from '@tiptap/core'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Highlighter,
  Quote,
  Code,
  Undo,
  Redo,
  Type
} from 'lucide-react'
import { useState } from 'react'

// Custom extension for font size
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showFontSizePicker, setShowFontSizePicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Inizia a scrivere...',
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  if (!editor) {
    return null
  }

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().unsetLink().run()
      setShowLinkInput(false)
      return
    }

    editor.chain().focus().setLink({ href: linkUrl }).run()
    setShowLinkInput(false)
    setLinkUrl('')
  }

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F97316',
    '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6'
  ]

  const highlights = [
    '#FEF3C7', '#FED7AA', '#FECACA', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FCE7F3'
  ]

  const fontSizes = [
    { label: 'Piccolo', value: '12px' },
    { label: 'Normale', value: '14px' },
    { label: 'Medio', value: '16px' },
    { label: 'Grande', value: '18px' },
    { label: 'Molto grande', value: '24px' },
    { label: 'Enorme', value: '32px' },
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Grassetto (Ctrl+B)"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Corsivo (Ctrl+I)"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Sottolineato (Ctrl+U)"
          type="button"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Barrato"
          type="button"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker)
              setShowHighlightPicker(false)
            }}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 flex items-center space-x-1"
            title="Colore testo"
            type="button"
          >
            <div className="w-4 h-4 border border-gray-300 rounded"
                 style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
            ></div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-max">
              <div className="grid grid-cols-5 gap-2 mb-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run()
                      setShowColorPicker(false)
                    }}
                    className="w-7 h-7 rounded border-2 border-gray-300 hover:scale-110 hover:border-blue-500 transition-all"
                    style={{ backgroundColor: color }}
                    type="button"
                    title={color}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run()
                  setShowColorPicker(false)
                }}
                className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                type="button"
              >
                Rimuovi colore
              </button>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker)
              setShowColorPicker(false)
            }}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('highlight') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
            }`}
            title="Evidenziatore"
            type="button"
          >
            <Highlighter className="h-4 w-4" />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-max">
              <div className="grid grid-cols-4 gap-2 mb-2">
                {highlights.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      editor.chain().focus().setHighlight({ color }).run()
                      setShowHighlightPicker(false)
                    }}
                    className="w-7 h-7 rounded border-2 border-gray-300 hover:scale-110 hover:border-blue-500 transition-all"
                    style={{ backgroundColor: color }}
                    type="button"
                    title={color}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  setShowHighlightPicker(false)
                }}
                className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                type="button"
              >
                Rimuovi evidenziazione
              </button>
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFontSizePicker(!showFontSizePicker)
              setShowColorPicker(false)
              setShowHighlightPicker(false)
            }}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 flex items-center space-x-1"
            title="Dimensione carattere"
            type="button"
          >
            <Type className="h-4 w-4" />
          </button>
          {showFontSizePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50 min-w-max">
              <div className="flex flex-col gap-1">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => {
                      editor.chain().focus().setFontSize(size.value).run()
                      setShowFontSizePicker(false)
                    }}
                    className="px-3 py-2 text-left hover:bg-blue-50 rounded transition-colors text-sm whitespace-nowrap"
                    type="button"
                    style={{ fontSize: size.value }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={() => {
                    editor.chain().focus().unsetFontSize().run()
                    setShowFontSizePicker(false)
                  }}
                  className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  Reset dimensione
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Allinea a sinistra"
          type="button"
        >
          <AlignLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Allinea al centro"
          type="button"
        >
          <AlignCenter className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Allinea a destra"
          type="button"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Giustificato"
          type="button"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Elenco puntato"
          type="button"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Elenco numerato"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Quote and Code */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Citazione"
          type="button"
        >
          <Quote className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('code') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
          title="Codice inline"
          type="button"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Link */}
        <div className="relative">
          <button
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run()
              } else {
                setShowLinkInput(!showLinkInput)
              }
            }}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
            }`}
            title="Link"
            type="button"
          >
            <Link2 className="h-4 w-4" />
          </button>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 w-64">
              <input
                type="url"
                placeholder="https://esempio.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setLink()
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={setLink}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  type="button"
                >
                  Aggiungi
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                  type="button"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Annulla (Ctrl+Z)"
          type="button"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Ripeti (Ctrl+Y)"
          type="button"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
