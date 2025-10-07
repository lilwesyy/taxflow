import { CheckCircle, Clock, AlertTriangle, Send, Edit, FileText, Download, User, CreditCard, Calendar, DollarSign } from 'lucide-react'
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
        return { label: 'Pagata', color: 'bg-green-500/20 text-green-100 border border-green-400/30', icon: CheckCircle }
      case 'pending':
        return { label: 'In attesa', color: 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30', icon: Clock }
      case 'overdue':
        return { label: 'Scaduta', color: 'bg-red-500/20 text-red-100 border border-red-400/30', icon: AlertTriangle }
      case 'sent':
        return { label: 'Inviata', color: 'bg-blue-500/20 text-blue-100 border border-blue-400/30', icon: Send }
      case 'draft':
        return { label: 'Bozza', color: 'bg-gray-500/20 text-gray-100 border border-gray-400/30', icon: Edit }
      default:
        return { label: status, color: 'bg-gray-500/20 text-gray-100 border border-gray-400/30', icon: FileText }
    }
  }

  const statusDisplay = getStatusDisplay(invoice.status)
  const StatusIcon = statusDisplay.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fattura ${invoice.numero}`}
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* Header with Invoice Info - Similar to Client Modal */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Fattura {invoice.numero}</h2>
                  <p className="text-blue-100 mt-1">{invoice.cliente}</p>
                  {(invoice.clienteEmail || invoice.email) && (
                    <p className="text-blue-100 text-sm mt-0.5">{invoice.clienteEmail || invoice.email}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl ${statusDisplay.color}`}>
                  <StatusIcon className="h-4 w-4 mr-2" />
                  <span>{statusDisplay.label}</span>
                </span>
                <div className="text-sm text-blue-100">
                  <span>Emessa il: {invoice.dataEmissione}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`grid ${invoice.dataScadenza ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mt-6`}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-200 text-sm">Imponibile</p>
                <p className="text-white font-semibold mt-1">{formatCurrency(invoice.importo)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-200 text-sm">IVA</p>
                <p className="text-white font-semibold mt-1">{formatCurrency(invoice.iva)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-200 text-sm">Totale</p>
                <p className="text-white font-semibold mt-1">{formatCurrency(invoice.totale)}</p>
              </div>
              {invoice.dataScadenza && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-200 text-sm">Scadenza</p>
                  <p className="text-white font-semibold mt-1">{invoice.dataScadenza}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-6">
          {/* Informazioni Cliente Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Informazioni Cliente</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome completo</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{invoice.cliente}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{invoice.clienteEmail || invoice.email || 'N/D'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Metodo di pagamento</label>
                <div className="mt-1 flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm font-medium text-gray-900">Carta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dettagli Fattura Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Dettagli Fattura</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data emissione</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{invoice.dataEmissione}</p>
              </div>
              {invoice.dataScadenza && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data scadenza</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{invoice.dataScadenza}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Servizio</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{invoice.servizio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descrizione se presente */}
        {invoice.descrizione && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Descrizione</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{invoice.descrizione}</p>
          </div>
        )}

        {/* Note se presenti */}
        {invoice.note && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Note Importanti</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{invoice.note}</p>
          </div>
        )}

        {/* Riepilogo importi */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Riepilogo Importi</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-600 font-medium">Imponibile:</span>
              <span className="font-semibold text-gray-900 text-lg">{formatCurrency(invoice.importo)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-600 font-medium">IVA:</span>
              <span className="font-semibold text-gray-900 text-lg">{formatCurrency(invoice.iva)}</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl">
                <span className="font-bold text-white text-lg">Totale:</span>
                <span className="font-bold text-white text-2xl">{formatCurrency(invoice.totale)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
          <div className="flex space-x-3">
            {onDownloadInvoice && invoice.status === 'paid' && (
              <button
                onClick={() => onDownloadInvoice(invoice)}
                className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center font-medium"
              >
                <Download className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Scarica PDF
              </button>
            )}
            {onEditInvoice && invoice.status !== 'paid' && (
              <button
                onClick={() => onEditInvoice(invoice)}
                className="group px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center font-medium"
              >
                <Edit className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Modifica
              </button>
            )}
            {onSendInvoice && invoice.status === 'draft' && (
              <button
                onClick={() => onSendInvoice(invoice)}
                className="group px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center font-medium"
              >
                <Send className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Invia al Cliente
              </button>
            )}
          </div>

          {onMarkAsPaid && invoice.status === 'pending' && (
            <button
              onClick={() => onMarkAsPaid(invoice)}
              className="group px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center font-medium"
            >
              <CheckCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Segna come Pagata
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}