import { FileText, Eye, Download, Send, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Invoice } from '../../../types/dashboard'
import { getStatusInfo, formatCurrency } from '../../../utils/invoiceUtils'

interface InvoiceTableProps {
  invoices: Invoice[]
  onViewInvoice?: (invoice: Invoice) => void
  onEditInvoice?: (invoice: Invoice) => void
  onDownloadInvoice?: (invoice: Invoice) => void
  onSendInvoice?: (invoice: Invoice) => void
  showClientEmail?: boolean
  showService?: boolean
  showConsulente?: boolean
}

export default function InvoiceTable({
  invoices,
  onViewInvoice,
  onEditInvoice,
  onDownloadInvoice,
  onSendInvoice,
  showClientEmail = true,
  showService = true,
  showConsulente = false
}: InvoiceTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const totalItems = invoices.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInvoices = invoices.slice(startIndex, endIndex)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Numero</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Cliente</th>
              {showConsulente && (
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Consulente</th>
              )}
              {showService && (
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Servizio</th>
              )}
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Data Emissione</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Scadenza</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Importo</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Totale</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentInvoices.map((invoice) => {
              const statusInfo = getStatusInfo(invoice.status)
              const StatusIcon = statusInfo.icon

              return (
                <tr key={invoice._id || invoice.id || invoice.numero} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-primary-600">{invoice.numero}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.cliente}</p>
                      {showClientEmail && (
                        <p className="text-sm text-gray-500">{invoice.email}</p>
                      )}
                    </div>
                  </td>
                  {showConsulente && (
                    <td className="py-4 px-6">
                      <span className="text-gray-700 font-medium">{(invoice as any).consulente || 'N/A'}</span>
                    </td>
                  )}
                  {showService && (
                    <td className="py-4 px-6">
                      <span className="text-gray-700">{invoice.servizio}</span>
                    </td>
                  )}
                  <td className="py-4 px-6">
                    <span className="text-gray-600">{invoice.dataEmissione}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600">{invoice.dataScadenza}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(invoice.importo)}</p>
                      <p className="text-sm text-gray-500">IVA: {formatCurrency(invoice.iva)}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.totale)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {onViewInvoice && (
                        <button
                          onClick={() => onViewInvoice(invoice)}
                          className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                          title="Visualizza"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {onEditInvoice && invoice.status !== 'paid' && (
                        <button
                          onClick={() => onEditInvoice(invoice)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 hover:scale-110 transition-all duration-200"
                          title="Modifica"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDownloadInvoice && invoice.status === 'paid' && (
                        <button
                          onClick={() => onDownloadInvoice(invoice)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 hover:scale-110 transition-all duration-200"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {onSendInvoice && invoice.status === 'draft' && (
                        <button
                          onClick={() => onSendInvoice(invoice)}
                          className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 hover:scale-110 transition-all duration-200"
                          title="Invia"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={showService ? 9 : 8} className="px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>Mostra</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>di {totalItems} fatture</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'hover:bg-gray-200 text-gray-700 hover:scale-105'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}