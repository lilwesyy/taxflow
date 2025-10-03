import { CheckCircle, Paperclip, FileText, Eye } from 'lucide-react'
import type { ChatMessage } from './types'

interface MessageBubbleProps {
  message: ChatMessage
  isOwnMessage: boolean
  onPreviewFile: (file: { url: string; filename: string; mimeType: string }) => void
  onDownloadFile: (url: string, filename: string) => void
}

const formatMessageTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

export default function MessageBubble({ message, isOwnMessage, onPreviewFile, onDownloadFile }: MessageBubbleProps) {
  const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          {!isOwnMessage && (
            <p className="text-xs font-medium mb-1 text-gray-600">{message.nome}</p>
          )}
          {message.testo && <p className="text-sm">{message.testo}</p>}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`${message.testo ? 'mt-2' : ''} space-y-2`}>
              {message.attachments.map((file, idx) => {
                const isImage = file.mimeType.startsWith('image/')
                const isPDF = file.mimeType === 'application/pdf'
                const canPreview = isImage || isPDF

                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      isOwnMessage ? 'bg-primary-700' : 'bg-gray-100'
                    }`}
                  >
                    {isImage ? (
                      <img
                        src={`${getApiBaseUrl()}${file.url}`}
                        alt={file.filename}
                        className="h-24 w-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onPreviewFile(file)}
                      />
                    ) : isPDF ? (
                      <div
                        className="h-24 w-24 bg-red-100 rounded flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors"
                        onClick={() => onPreviewFile(file)}
                      >
                        <FileText className="h-12 w-12 text-red-600" />
                      </div>
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{file.filename}</p>
                      <p className="text-xs opacity-75">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {canPreview && (
                        <button
                          onClick={() => onPreviewFile(file)}
                          className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                            isOwnMessage ? 'bg-primary-800 hover:bg-primary-900' : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          title="Anteprima"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Vedi</span>
                        </button>
                      )}
                      <button
                        onClick={() => onDownloadFile(file.url, file.filename)}
                        className={`text-xs px-2 py-1 rounded ${
                          isOwnMessage ? 'bg-primary-800 hover:bg-primary-900' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        Scarica
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className={`flex items-center justify-between mt-1 ${
            isOwnMessage ? 'text-white' : 'text-gray-500'
          }`}>
            <span className="text-xs opacity-75">{formatMessageTimestamp(message.timestamp)}</span>
            {isOwnMessage && (
              <CheckCircle className="h-3 w-3 ml-2" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
