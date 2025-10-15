import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, Trash2, Edit2, Check } from 'lucide-react'
import RichTextEditor from '../../../common/RichTextEditor'

interface BusinessPlanSectionProps {
  id: string
  title: string
  description: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  isExpanded: boolean
  onToggle: () => void
  onAISuggest?: () => void
  isCustom?: boolean
  onDelete?: () => void
  onTitleChange?: (value: string) => void
}

export default function BusinessPlanSection({
  title,
  description,
  placeholder,
  value,
  onChange,
  isExpanded,
  onToggle,
  onAISuggest,
  isCustom = false,
  onDelete,
  onTitleChange
}: BusinessPlanSectionProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)

  const handleTitleSave = () => {
    if (onTitleChange && editedTitle.trim()) {
      onTitleChange(editedTitle.trim())
      setIsEditingTitle(false)
    }
  }

  // Extract text from HTML for word/char count
  const textContent = value.replace(/<[^>]*>/g, '').trim()
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
  const charCount = textContent.length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1">
              {isCustom && isEditingTitle ? (
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave()
                      if (e.key === 'Escape') {
                        setEditedTitle(title)
                        setIsEditingTitle(false)
                      }
                    }}
                    className="px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleTitleSave}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  {isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsEditingTitle(true)
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {value && (
              <div className="text-xs text-gray-500 mr-2">
                <span className="font-medium">{wordCount}</span> parole
              </div>
            )}

            {isCustom && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('Sei sicuro di voler eliminare questa sezione?')) {
                    onDelete()
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Elimina sezione"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {!isCustom && onAISuggest && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAISuggest()
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Suggerimenti AI"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <RichTextEditor
            content={value}
            onChange={onChange}
            placeholder={placeholder}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-gray-500">
              <span>{charCount} caratteri</span>
              <span className="mx-2">•</span>
              <span>{wordCount} parole</span>
            </div>

            {!isCustom && onAISuggest && (
              <button
                onClick={onAISuggest}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>Migliora con AI</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
