import { FileText } from 'lucide-react'
import Modal from '../../common/Modal'

interface FilePreviewModalProps {
  isOpen: boolean
  file: { url: string; filename: string; mimeType: string } | null
  onClose: () => void
  onDownload: (url: string, filename: string) => void
}

export default function FilePreviewModal({ isOpen, file, onClose, onDownload }: FilePreviewModalProps) {
  if (!file) return null

  const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'
  }

  const fileUrl = `${getApiBaseUrl()}${file.url}`
  const isPDF = file.mimeType === 'application/pdf'
  const isImage = file.mimeType.startsWith('image/')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={file.filename}
      maxWidth="4xl"
    >
      <div className="p-6">
        {isImage ? (
          <img
            src={fileUrl}
            alt={file.filename}
            className="max-w-full max-h-[70vh] mx-auto rounded"
          />
        ) : isPDF ? (
          <div className="w-full h-[70vh] border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={file.filename}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Anteprima non disponibile per questo tipo di file</p>
            <button
              onClick={() => onDownload(file.url, file.filename)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Scarica File
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onDownload(file.url, file.filename)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Scarica
          </button>
        </div>
      </div>
    </Modal>
  )
}
