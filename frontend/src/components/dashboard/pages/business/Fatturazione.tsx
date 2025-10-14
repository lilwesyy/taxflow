import { FileText, Plus, Search, Filter, DollarSign, Building, CheckCircle, Clock, Building2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { StatsGrid } from '../../shared/StatsCard'
import InvoiceTable from '../../shared/InvoiceTable'
import InvoiceDetailModal from '../../shared/InvoiceDetailModal'
import InvoiceCreateModal from '../../shared/InvoiceCreateModal'
import ClientCreateModal from '../../shared/ClientCreateModal'
import { mockInvoices, mockClients } from '../../../../data/mockData'
import type { StatItem } from '../../shared/StatsCard'
import type { Invoice, Client } from '../../../../types/dashboard'
import { calculateInvoiceStats } from '../../../../utils/invoiceUtils'
import Modal from '../../../common/Modal'
import api from '../../../../services/api'

export default function Fatturazione() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('fatture')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewInvoice, setShowNewInvoice] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Invoicetronic state
  const [invoicetronicCompany, setInvoicetronicCompany] = useState<any>(null)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [setupData, setSetupData] = useState({
    vat: '',
    fiscalCode: '',
    name: ''
  })

  // Check if user has Invoicetronic company on mount
  useEffect(() => {
    checkInvoicetronicCompany()
  }, [])

  // Prepopulate form with user data
  useEffect(() => {
    if (user && !invoicetronicCompany) {
      setSetupData({
        vat: (user as any).piva || '',
        fiscalCode: (user as any).fiscalCode || '',
        name: (user as any).company || user.name || ''
      })
    }
  }, [user, invoicetronicCompany])

  const checkInvoicetronicCompany = async () => {
    try {
      setLoadingCompany(true)
      const response = await api.getInvoicetronicCompany()
      if (response && response.success) {
        setInvoicetronicCompany(response.company)
      }
    } catch (error: any) {
      console.error('Error checking Invoicetronic company:', error)
    } finally {
      setLoadingCompany(false)
    }
  }

  const handleInvoicetronicSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSetupError(null)
    setSetupLoading(true)

    try {
      const response = await api.createInvoicetronicCompany(setupData)

      if (response.success) {
        setInvoicetronicCompany(response.company)
        setSetupData({ vat: '', fiscalCode: '', name: '' })
      } else {
        throw new Error(response.message || 'Setup fallito')
      }
    } catch (error: any) {
      console.error('Invoicetronic setup error:', error)
      setSetupError(error.message || 'Errore durante la configurazione')
    } finally {
      setSetupLoading(false)
    }
  }

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

  const handleCreateInvoice = (formData: unknown) => {
    console.log('Creating business invoice:', formData)
    setShowNewInvoice(false)
  }

  const handleCreateClient = (formData: unknown) => {
    console.log('Creating new client:', formData)
    setShowNewClient(false)
    // TODO: Integrate with backend API to save client
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
          onClick={() => setShowNewClient(true)}
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
    {
      id: 'fatture',
      name: 'Fatture',
      icon: FileText,
      description: 'Gestisci e monitora le tue fatture'
    },
    {
      id: 'clienti',
      name: 'Clienti',
      icon: Building,
      description: 'Elenco dei tuoi clienti'
    }
  ]

  // Show loading state
  if (loadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento configurazione fatturazione...</p>
        </div>
      </div>
    )
  }

  // Show setup form if not configured
  if (!invoicetronicCompany) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Configura Sistema Fatturazione
            </h2>
            <p className="text-gray-600">
              Per iniziare a emettere fatture elettroniche, configura i tuoi dati fiscali
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Building2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Perché servono questi dati?</p>
                <p>I dati fiscali sono necessari per registrare la tua azienda nel sistema di fatturazione elettronica Invoicetronic e permetterti di emettere fatture valide ai tuoi clienti.</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {setupError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{setupError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleInvoicetronicSetup} className="space-y-6">
            {/* VAT Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partita IVA *
              </label>
              <input
                type="text"
                value={setupData.vat}
                onChange={(e) => setSetupData(prev => ({ ...prev, vat: e.target.value }))}
                placeholder="IT01234567891 (con prefisso paese)"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Inserisci la Partita IVA con il prefisso del paese (es: IT01234567891)
              </p>
            </div>

            {/* Fiscal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice Fiscale *
              </label>
              <input
                type="text"
                value={setupData.fiscalCode}
                onChange={(e) => setSetupData(prev => ({ ...prev, fiscalCode: e.target.value }))}
                placeholder="RSSMRA70A01F205V"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Codice fiscale dell'azienda o del professionista
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ragione Sociale / Nome *
              </label>
              <input
                type="text"
                value={setupData.name}
                onChange={(e) => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mario Rossi Srl"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome completo della società o del professionista
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={setupLoading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {setupLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Configurazione in corso...
                  </>
                ) : (
                  'Configura Sistema Fatturazione'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Invoicetronic Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-1">
              Sistema Fatturazione Configurato
            </h4>
            <p className="text-sm text-green-700">
              <strong>{invoicetronicCompany.name}</strong> - P.IVA: {invoicetronicCompany.vat}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Puoi ora emettere fatture elettroniche ai tuoi clienti
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-2 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-lg text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <tab.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{tab.name}</span>
              </div>
              <p className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {tab.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'fatture' ? renderFattureTab() : renderClientiTab()}

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

      {/* Client Create Modal */}
      <ClientCreateModal
        isOpen={showNewClient}
        onClose={() => setShowNewClient(false)}
        onSubmit={handleCreateClient}
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