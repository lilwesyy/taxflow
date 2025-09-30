import { FileText, Plus, Search, Filter, DollarSign, Building, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { StatsGrid } from '../../shared/StatsCard'
import InvoiceTable from '../../shared/InvoiceTable'
import InvoiceDetailModal from '../../shared/InvoiceDetailModal'
import InvoiceCreateModal from '../../shared/InvoiceCreateModal'
import { mockInvoices, mockClients } from '../../../../data/mockData'
import type { StatItem } from '../../shared/StatsCard'
import type { Invoice, Client } from '../../../../types/dashboard'
import { calculateInvoiceStats } from '../../../../utils/invoiceUtils'
import Modal from '../../../common/Modal'

export default function Fatturazione() {
  const [activeTab, setActiveTab] = useState('fatture')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewInvoice, setShowNewInvoice] = useState(false)
  // const [showNewClient, setShowNewClient] = useState(false) // Unused for now
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Filter business invoices (forfettario - no IVA)
  const businessInvoices = mockInvoices.filter(invoice => invoice.iva === 0)

  const clienti = mockClients

  const filteredFatture = businessInvoices.filter(fattura => {
    const matchesSearch = fattura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fattura.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fattura.servizio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || fattura.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleCreateInvoice = (formData: any) => {
    console.log('Creating business invoice:', formData)
    setShowNewInvoice(false)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log('Downloading invoice:', invoice.id)
  }

  const handleSendInvoice = (invoice: Invoice) => {
    console.log('Sending invoice:', invoice.id)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    console.log('Editing invoice:', invoice.id)
  }

  const invoiceStats = calculateInvoiceStats(businessInvoices)
  const stats: StatItem[] = [
    { title: 'Fatture Totali', value: invoiceStats.total.toString(), icon: FileText, color: 'text-blue-600' },
    { title: 'Fatturato Totale', value: `€ ${invoiceStats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { title: 'In Attesa Pagamento', value: `€ ${invoiceStats.pending.toLocaleString()}`, icon: Clock, color: 'text-yellow-600' },
    { title: 'Fatture Pagate', value: businessInvoices.filter(f => f.status === 'paid').length.toString(), icon: CheckCircle, color: 'text-green-600' }
  ]

  const renderFattureTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per numero, cliente o servizio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozze</option>
                <option value="sent">Inviate</option>
                <option value="pending">In Attesa</option>
                <option value="paid">Pagate</option>
                <option value="overdue">Scadute</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowNewInvoice(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova Fattura
          </button>
        </div>
      </div>

      {/* Fatture Table */}
      <InvoiceTable
        invoices={filteredFatture}
        onViewInvoice={handleViewInvoice}
        onEditInvoice={handleEditInvoice}
        onDownloadInvoice={handleDownloadInvoice}
        onSendInvoice={handleSendInvoice}
        showClientEmail={false}
        showService={true}
      />
    </div>
  )

  const renderClientiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Anagrafica Clienti</h3>
        <button
          onClick={() => console.log('New client functionality not implemented')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {clienti.map((cliente) => (
            <div key={cliente.id} className="p-6 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900">{cliente.ragioneSociale || cliente.nome}</h4>
                    <p className="text-sm text-gray-600">P.IVA: {cliente.partitaIva || cliente.piva}</p>
                    <p className="text-sm text-gray-600">CF: {cliente.codiceFiscale}</p>
                    <p className="text-sm text-gray-600">{cliente.indirizzo}</p>
                    <div className="flex items-center space-x-4 pt-2">
                      <span className="text-sm text-gray-600">{cliente.email}</span>
                      <span className="text-sm text-gray-600">{cliente.telefono}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedClient(cliente)}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 hover:scale-110 transition-transform duration-200"
                    title="Visualizza dettagli"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'fatture', name: 'Fatture', icon: FileText },
    { id: 'clienti', name: 'Clienti', icon: Building }
  ]

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'fatture' ? renderFattureTab() : renderClientiTab()}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Regime Forfettario - Fatturazione</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Esenzione IVA su tutte le fatture</li>
              <li>• Obbligo fatturazione elettronica sopra € 25.000 annui</li>
              <li>• Possibilità di emettere ricevute per importi minori</li>
              <li>• Conservazione digitale automatica</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invoice Create Modal */}
      <InvoiceCreateModal
        isOpen={showNewInvoice}
        onClose={() => setShowNewInvoice(false)}
        onSubmit={handleCreateInvoice}
        title="Nuova Fattura - Regime Forfettario"
        userRole="business"
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onDownloadInvoice={handleDownloadInvoice}
        onSendInvoice={handleSendInvoice}
        onEditInvoice={handleEditInvoice}
      />

      {/* Client Details Modal */}
      <Modal
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.ragioneSociale || selectedClient?.nome || 'Dettagli Cliente'}
        maxWidth="2xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedClient.ragioneSociale || selectedClient.nome}</h3>
                  <p className="text-gray-600">Cliente #{selectedClient.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dati Fiscali</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Partita IVA</p>
                      <p className="font-medium text-gray-900">{selectedClient.partitaIva || selectedClient.piva}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Codice Fiscale</p>
                      <p className="font-medium text-gray-900">{selectedClient.codiceFiscale}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contatti</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedClient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telefono</p>
                      <p className="font-medium text-gray-900">{selectedClient.telefono}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Indirizzo</h4>
                  <p className="font-medium text-gray-900">{selectedClient.indirizzo}</p>
                </div>
              </div>
            </div>

            {/* Client Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {businessInvoices.filter(f => f.cliente === (selectedClient.ragioneSociale || selectedClient.nome)).length}
                </p>
                <p className="text-sm text-blue-600">Fatture Totali</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  €{businessInvoices.filter(f => f.cliente === (selectedClient.ragioneSociale || selectedClient.nome))
                    .reduce((sum, f) => sum + f.totale, 0).toFixed(2)}
                </p>
                <p className="text-sm text-green-600">Fatturato Totale</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {businessInvoices.filter(f => f.cliente === (selectedClient.ragioneSociale || selectedClient.nome) && f.status === 'paid').length}
                </p>
                <p className="text-sm text-yellow-600">Fatture Pagate</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}