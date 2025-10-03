import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: string) => void
  title: string
  placeholder?: string
  confirmButtonText?: string
  confirmButtonColor?: 'green' | 'red'
}

export default function NoteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder = 'Aggiungi una nota...',
  confirmButtonText = 'Conferma',
  confirmButtonColor = 'green'
}: NoteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [note, setNote] = useState('')

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      setNote('')
      onClose()
    }, 200)
  }

  const handleConfirm = () => {
    onConfirm(note.trim())
    handleClose()
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      // Focus textarea when modal opens
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    } else {
      setIsClosing(false)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const buttonColorClasses = {
    green: 'bg-green-600 hover:bg-green-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white'
  }

  const modalContent = (
    <>
      {/* Background overlay */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity bg-gray-900 bg-opacity-50 ${
          isClosing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
        onClick={handleClose}
      ></div>

      {/* Modal container */}
      <div className="fixed inset-0 z-[9999] overflow-y-auto pointer-events-none">
        <div className="flex items-center justify-center min-h-full p-4">
          {/* Modal panel */}
          <div
            ref={modalRef}
            className={`relative w-full max-w-md bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden pointer-events-auto ${
              isClosing ? 'animate-scale-out' : 'animate-scale-in'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg transition-colors ${buttonColorClasses[confirmButtonColor]}`}
              >
                {confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}
