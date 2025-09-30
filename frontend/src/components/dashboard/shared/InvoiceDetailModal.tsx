import { CheckCircle, Clock, AlertTriangle, Send, Edit, FileText, Download } from 'lucide-react'
import Modal from '../../common/Modal'
import type { Invoice } from '../../../types/dashboard'
import { formatCurrency } from '../../../utils/invoiceUtils'

interface InvoiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | null
  onMarkAsPaid?: (invoice: Invoice) => void
  onSendInvoice?: (invoice: Invoice) => void
  onEditInvoice?: (invoice: Invoice) => void
  onDownloadInvoice?: (invoice: Invoice) => void
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onMarkAsPaid,
  onSendInvoice,
  onEditInvoice,
  onDownloadInvoice
}: InvoiceDetailModalProps) {
  if (!invoice) return null

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Pagata', color: 'bg-green-100 text-green-700', icon: CheckCircle }
      case 'pending':
        return { label: 'In attesa', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
      case 'overdue':
        return { label: 'Scaduta', color: 'bg-red-100 text-red-700', icon: AlertTriangle }
      case 'sent':
        return { label: 'Inviata', color: 'bg-blue-100 text-blue-700', icon: Send }
      case 'draft':
        return { label: 'Bozza', color: 'bg-gray-100 text-gray-700', icon: Edit }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: FileText }
    }
  }

  const statusDisplay = getStatusDisplay(invoice.status)
  const StatusIcon = statusDisplay.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fattura ${invoice.numero}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header con status e azioni */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Fattura {invoice.numero}</h3>
            <p className="text-primary-600 font-medium">{invoice.cliente}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusDisplay.label}
            </div>
          </div>
        </div>

        {/* Dettagli fattura in grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informazioni Cliente */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Informazioni Cliente
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Nome completo</label>
                <p className="font-medium text-gray-900">{invoice.cliente}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{invoice.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Metodo di pagamento</label>
                <p className="font-medium text-gray-900 capitalize">{invoice.metodoPagamento}</p>
              </div>
            </div>
          </div>

          {/* Date e servizio */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Dettagli Fattura
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Data emissione</label>
                <p className="font-medium text-gray-900">{invoice.dataEmissione}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Data scadenza</label>
                <p className="font-medium text-gray-900">{invoice.dataScadenza}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Servizio</label>
                <p className="font-medium text-gray-900">{invoice.servizio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descrizione se presente */}
        {invoice.descrizione && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Descrizione</h4>
            <p className="text-gray-700">{invoice.descrizione}</p>
          </div>
        )}

        {/* Note se presenti */}
        {invoice.note && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Note</h4>
            <p className="text-gray-700">{invoice.note}</p>
          </div>
        )}

        {/* Riepilogo importi */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Riepilogo Importi</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Imponibile:</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.importo)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IVA:</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.iva)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-900">Totale:</span>
                <span className="font-bold text-primary-600">{formatCurrency(invoice.totale)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {onDownloadInvoice && (
              <button
                onClick={() => onDownloadInvoice(invoice)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica PDF
              </button>
            )}
            {onEditInvoice && (
              <button
                onClick={() => onEditInvoice(invoice)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-sm"
              >
                Modifica
              </button>
            )}
            {onSendInvoice && invoice.status === 'draft' && (
              <button
                onClick={() => onSendInvoice(invoice)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Invia al Cliente
              </button>
            )}
          </div>

          {onMarkAsPaid && invoice.status === 'pending' && (
            <button
              onClick={() => onMarkAsPaid(invoice)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Segna come Pagata
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}