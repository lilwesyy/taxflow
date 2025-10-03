import { Send, Paperclip } from 'lucide-react'
import { useState, useRef } from 'react'

interface MessageInputProps {
  message: string
  onMessageChange: (message: string) => void
  onSendMessage: (files: File[]) => Promise<void>
  disabled?: boolean
  sending?: boolean
  placeholder?: string
  showAttachments?: boolean
}

export default function MessageInput({
  message,
  onMessageChange,
  onSendMessage,
  disabled = false,
  sending = false,
  placeholder = 'Scrivi un messaggio...',
  showAttachments = true
}: MessageInputProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || disabled || sending) return

    await onSendMessage(selectedFiles)
    setSelectedFiles([]) // Clear files after send
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Reset file input
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded px-3 py-2">
              <Paperclip className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-gray-500 hover:text-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-3">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
        />

        {/* Attachment button */}
        {showAttachments && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110"
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </button>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          disabled={disabled}
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && selectedFiles.length === 0) || sending || disabled}
          className="flex-shrink-0 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
