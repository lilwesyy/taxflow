import { FileText, Eye, Download, Trash2, Users } from 'lucide-react'
import type { Document } from '../../../../utils/documentUtils'
import { getStatusColor, getStatusText, getStatusIcon } from '../../../../utils/documentUtils'
import api from '../../../../services/api'

interface DocumentCardProps {
  documento: Document
  showClientInfo?: boolean
  canDeleteAll?: boolean
  onView: (doc: Document) => void
  onDelete: (doc: Document) => void
}

export default function DocumentCard({
  documento,
  showClientInfo = false,
  canDeleteAll = false,
  onView,
  onDelete
}: DocumentCardProps) {
  const canDelete = canDeleteAll || documento.status !== 'elaborato'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-3 bg-blue-50 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">{documento.nome}</h3>
            <p className="text-sm text-gray-600 mb-2">{documento.descrizione}</p>

            {showClientInfo && documento.cliente && (
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-600">{documento.cliente.nome}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{documento.formato}</span>
              <span>•</span>
              <span>{documento.dimensione}</span>
              <span>•</span>
              <span>Anno {documento.anno}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(documento.status)}`}>
          {getStatusIcon(documento.status)}
          <span className="ml-1">{getStatusText(documento.status)}</span>
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {documento.protocollo && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Protocollo:</span>
            <span className="text-gray-900 font-mono text-xs">{documento.protocollo}</span>
          </div>
        )}
        {documento.importo && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Importo:</span>
            <span className="text-gray-900 font-semibold">{documento.importo}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Data:</span>
          <span className="text-gray-900">{documento.dataCaricamento}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(documento)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          Visualizza
        </button>
        <div className="flex items-center space-x-2">
          {documento.fileUrl && (
            <a
              href={api.getDocumentUrl(documento.fileUrl)}
              download
              className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(documento)}
              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
              title="Elimina"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
