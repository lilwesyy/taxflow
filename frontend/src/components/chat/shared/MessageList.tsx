import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import type { ChatMessage, UserRole } from './types'

interface MessageListProps {
  messages: ChatMessage[]
  userRole: UserRole
  loading?: boolean
  aiLoading?: boolean
  onPreviewFile: (file: { url: string; filename: string; mimeType: string }) => void
  onDownloadFile: (url: string, filename: string) => void
}

export default function MessageList({
  messages,
  userRole,
  loading = false,
  aiLoading = false,
  onPreviewFile,
  onDownloadFile
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const isOwnMessage = (message: ChatMessage) => {
    if (userRole === 'business') {
      return message.mittente === 'user'
    } else {
      return message.mittente === 'consulente'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Caricamento messaggi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Nessun messaggio ancora. Inizia la conversazione!</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={isOwnMessage(msg)}
              onPreviewFile={onPreviewFile}
              onDownloadFile={onDownloadFile}
            />
          ))}

          {/* AI Loading Indicator */}
          {aiLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[70%]">
                <div className="rounded-2xl px-4 py-2 bg-white border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}
