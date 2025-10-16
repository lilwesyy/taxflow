import { FileText, Plus, Search, Filter, DollarSign, Building, CheckCircle, Clock, Building2, AlertCircle, RefreshCw, Edit2, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { StatsGrid } from '../../shared/StatsCard'
import InvoiceTable from '../../shared/InvoiceTable'
import InvoiceDetailModal from '../../shared/InvoiceDetailModal'
import InvoiceCreateModal from '../../shared/InvoiceCreateModal'
import ClientCreateModal from '../../shared/ClientCreateModal'
import type { StatItem } from '../../shared/StatsCard'
import type { Invoice, Client } from '../../../../types/dashboard'
import { calculateInvoiceStats } from '../../../../utils/invoiceUtils'
import Modal from '../../../common/Modal'
import api from '../../../../services/api'
import { buildFatturaOrdinaria, validateInvoiceData, type InvoiceFormData } from '../../../../utils/fatturaElettronicaBuilder'

export default function Fatturazione() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('fatture')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewInvoice, setShowNewInvoice] = useState(false)
  const [showNewClient, setShowNewClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Client search and pagination
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [clientsPerPage] = useState(10)

  // Delete client confirmation
  const [showDeleteClientModal, setShowDeleteClientModal] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)

  // Invoicetronic state
  const [invoicetronicCompany, setInvoicetronicCompany] = useState<any>(null)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [refreshingCompany, setRefreshingCompany] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [setupData, setSetupData] = useState({
    vat: '',
    fiscalCode: '',
    name: ''
  })
  const [isDataSynced, setIsDataSynced] = useState(true)

  // Invoices state
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)
  const [syncingInvoiceId, setSyncingInvoiceId] = useState<string | null>(null)

  // Clients state
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  // Check if user has Invoicetronic company on mount and load fresh user data
  useEffect(() => {
    const loadInitialData = async () => {
      // Step 1: Load fresh user data from API
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api'
        const token = localStorage.getItem('token')

        const profileResponse = await fetch(`${API_URL}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          const freshUser = profileData.user

          // Update user context
          if (updateUser) {
            updateUser(freshUser)
          }

          // Set setup data with fresh values
          if (!invoicetronicCompany) {
            setSetupData({
              vat: (freshUser as any).piva || '',
              fiscalCode: (freshUser as any).fiscalCode || '',
              name: (freshUser as any).company || freshUser.name || ''
            })
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }

      // Step 2: Check company configuration
      checkInvoicetronicCompany()
    }

    loadInitialData()
  }, [])

  // Load invoices when company is configured
  useEffect(() => {
    if (invoicetronicCompany) {
      loadInvoices()
    }
  }, [invoicetronicCompany])

  // Load clients when company is configured
  useEffect(() => {
    if (invoicetronicCompany) {
      loadClients()
    }
  }, [invoicetronicCompany])

  // Check data sync when user or company changes
  useEffect(() => {
    checkDataSync()
  }, [user, invoicetronicCompany])

  // Check if user data is synced with company data
  // Only check MANDATORY fields: ragione_sociale, piva, cfis
  const checkDataSync = () => {
    if (!user || !invoicetronicCompany) {
      setIsDataSynced(true)
      return
    }

    const userCompany = (user as any).company || user.name || ''
    const userPiva = (user as any).piva || ''
    const userCfis = (user as any).fiscalCode || ''

    const companyRagioneSociale = invoicetronicCompany.ragione_sociale || ''
    const companyPiva = (invoicetronicCompany.piva || '').replace(/^IT/i, '')
    const companyCfis = invoicetronicCompany.cfis || ''

    // Normalize P.IVA for comparison
    const normalizedUserPiva = userPiva.replace(/^IT/i, '')

    // Only check mandatory fields
    const isSynced =
      userCompany === companyRagioneSociale &&
      normalizedUserPiva === companyPiva &&
      userCfis === companyCfis

    setIsDataSynced(isSynced)
  }

  const checkInvoicetronicCompany = async () => {
    try {
      setLoadingCompany(true)
      const response = await api.getFatturaElettronicaCompany()
      if (response && response.success) {
        setInvoicetronicCompany(response.company)
      }
    } catch (error: any) {
      console.error('Error checking Fattura Elettronica company:', error)
    } finally {
      setLoadingCompany(false)
    }
  }

  const handleRefreshCompany = async () => {
    try {
      setRefreshingCompany(true)

      // Step 1: Reload user profile to get updated data from Impostazioni
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const token = localStorage.getItem('token')

      const profileResponse = await fetch(`${API_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!profileResponse.ok) {
        throw new Error('Errore nel caricamento del profilo')
      }

      const profileData = await profileResponse.json()
      const updatedUser = profileData.user

      // Step 2: Sync updated data to Fattura Elettronica API
      // Build update payload with ALL mandatory fields
      const updatePayload: any = {
        ragione_sociale: (updatedUser as any).company || 'Azienda',
        piva: (updatedUser as any).piva || '',
        cfis: (updatedUser as any).fiscalCode || '',
        indirizzo: (updatedUser as any).indirizzo || 'Via Roma 1',
        cap: (updatedUser as any).cap || '00100',
        citta: (updatedUser as any).citta || (updatedUser as any).comune || 'Roma',
        provincia: (updatedUser as any).provincia || 'RM',
        paese: 'IT',
        telefono_amministrazione: (updatedUser as any).telefono || (updatedUser as any).phone || '',
        email_amministrazione: updatedUser.email || '',
        forma_giuridica: 'ind',
        tipo_regime_fiscale: 'RF19',
        abilita_ricezione: 1
      }

      if ((updatedUser as any).iban) {
        updatePayload.iban = (updatedUser as any).iban
      }

      // Update company with all fields
      const updateResponse = await api.updateFatturaElettronicaCompany(updatePayload)

      if (updateResponse.success) {
        // Step 3: Refresh company data from API
        await checkInvoicetronicCompany()

        // Step 4: Update user in AuthContext
        if (updateUser) {
          updateUser(updatedUser)
        }

        // Step 5: Mark as synced
        setIsDataSynced(true)

        showToast('Dati aziendali sincronizzati con successo!', 'success')
      } else {
        throw new Error(updateResponse.message || 'Errore nella sincronizzazione')
      }
    } catch (error: any) {
      console.error('Error refreshing company:', error)
      showToast(error.message || 'Errore nell\'aggiornamento dei dati', 'error')
    } finally {
      setRefreshingCompany(false)
    }
  }

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true)
      setInvoiceError(null)
      const response = await api.getInvoices({ page: 1, per_page: 100 })

      if (response.success) {
        // Combine sent and received invoices
        const allInvoices = [...(response.sent || []), ...(response.received || [])]
        setInvoices(allInvoices)
      }
    } catch (error: any) {
      console.error('Error loading invoices:', error)
      setInvoiceError(error.message || 'Errore nel caricamento delle fatture')
    } finally {
      setLoadingInvoices(false)
    }
  }

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      const response = await api.getBusinessClients()

      if (response.success) {
        // Map _id to id for compatibility
        const mappedClients = response.clients.map((client: any) => ({
          ...client,
          id: client._id || client.id
        }))
        setClients(mappedClients)
      }
    } catch (error: any) {
      console.error('Error loading clients:', error)
      showToast(error.message || 'Errore nel caricamento dei clienti', 'error')
    } finally {
      setLoadingClients(false)
    }
  }

  const handleInvoicetronicSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSetupError(null)
    setSetupLoading(true)

    try {
      // Convert to Fattura Elettronica API format with complete company data
      const fatturaData = {
        ragione_sociale: setupData.name,
        piva: setupData.vat,
        cfis: setupData.fiscalCode,
        // Campi aggiuntivi obbligatori dall'anagrafica utente
        indirizzo: (user as any)?.indirizzo || 'Via Roma 1',
        cap: (user as any)?.cap || '00100',
        citta: (user as any)?.citta || (user as any)?.comune || 'Roma',
        provincia: (user as any)?.provincia || 'RM',
        paese: 'IT',
        telefono_amministrazione: (user as any)?.telefono || (user as any)?.phone || '',
        email_amministrazione: user?.email || '',
        forma_giuridica: 'ind', // ind = imprenditore individuale (adatto per forfettario)
        tipo_regime_fiscale: 'RF19', // RF19 = Regime forfettario
        abilita_ricezione: 1 // Abilita ricezione fatture
      }
      const response = await api.createFatturaElettronicaCompany(fatturaData)

      if (response.success) {
        setInvoicetronicCompany(response.company)
        setSetupData({ vat: '', fiscalCode: '', name: '' })

        // Show success message to user
        const message = response.company.id
          ? 'Configurazione completata! Azienda già esistente su Fattura Elettronica API.'
          : 'Configurazione completata! Puoi ora creare la tua prima fattura.'

        showToast(message, 'success')
      } else {
        throw new Error(response.message || 'Setup fallito')
      }
    } catch (error: any) {
      console.error('Fattura Elettronica setup error:', error)
      setSetupError(error.message || 'Errore durante la configurazione')
    } finally {
      setSetupLoading(false)
    }
  }

  // Convert invoices to UI format (supports both database and API formats)
  const convertedInvoices: Invoice[] = invoices.map((inv: any) => {
    // Check if this is from our database (has importo field) or external API (has meta_data)
    const isFromDatabase = inv.importo !== undefined

    if (isFromDatabase) {
      // Database format - use our saved structure
      // Map database status to UI status
      let uiStatus: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' = 'pending'
      switch (inv.status) {
        case 'inviata':
        case 'presa_in_carico':
          uiStatus = 'sent'
          break
        case 'consegnata':
        case 'accettata':
          uiStatus = 'paid'
          break
        case 'non_consegnata':
        case 'errore':
        case 'rifiutata':
          uiStatus = 'overdue'
          break
        case 'in_attesa':
        default:
          uiStatus = 'pending'
          break
      }

      // Look up the actual client to get all details
      const matchedClient = clients.find(c =>
        (c.ragioneSociale || c.nome) === inv.cliente
      )

      return {
        id: inv.id?.toString() || inv._id?.toString() || '',
        conversationId: '',
        businessUserId: user?.id || '',
        adminUserId: '',
        numero: inv.numero || '',
        cliente: inv.cliente || 'Cliente',
        clienteEmail: matchedClient?.email || inv.destinatario?.pec || '',

        // Dettagli completi del cliente dal database
        clientePartitaIva: matchedClient?.partitaIva || matchedClient?.piva || inv.destinatario?.partitaIva || '',
        clienteCodiceFiscale: matchedClient?.codiceFiscale || inv.destinatario?.codiceFiscale || '',
        clienteIndirizzo: matchedClient?.indirizzo || inv.destinatario?.indirizzo || '',
        clienteCap: matchedClient?.cap || inv.destinatario?.cap || '',
        clienteComune: matchedClient?.comune || inv.destinatario?.comune || '',
        clienteProvincia: matchedClient?.provincia || inv.destinatario?.provincia || '',
        clienteNazione: matchedClient?.nazione || inv.destinatario?.nazione || 'IT',
        clienteTelefono: matchedClient?.telefono || '',
        clientePec: matchedClient?.pec || inv.destinatario?.pec || '',
        clienteCodiceDestinatario: matchedClient?.codiceDestinatario || inv.destinatario?.codiceSDI || '0000000',

        azienda: invoicetronicCompany?.ragione_sociale || invoicetronicCompany?.name || '',
        consulente: '',
        servizio: inv.righe && inv.righe.length > 0 ? inv.righe[0].descrizione : 'Servizio',
        tipo: 'Fattura Elettronica',
        importo: inv.importo || 0,
        iva: inv.iva || 0,
        totale: inv.totale || 0,
        status: uiStatus,
        dataEmissione: inv.data || new Date().toISOString().split('T')[0],
        dataScadenza: inv.pagamento?.dataScadenza,
        dataPagamento: inv.status === 'accettata' || inv.status === 'consegnata' ? inv.data : undefined,
        stripePaymentIntentId: '',
        createdAt: new Date(inv.dataInvio || Date.now()),
        updatedAt: new Date(inv.dataInvio || Date.now()),
        descrizione: inv.identificativoSdI ? `SDI: ${inv.identificativoSdI}` : undefined
      } as unknown as Invoice
    } else {
      // External API format - old conversion logic
      const doc = inv.documents && inv.documents.length > 0 ? inv.documents[0] : null

      let importo = 0
      if (inv.meta_data?.importo) {
        importo = parseFloat(inv.meta_data.importo) || 0
      } else if (inv.meta_data?.total_amount) {
        importo = parseFloat(inv.meta_data.total_amount) || 0
      }

      let status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' = 'draft'
      if (inv.identifier) {
        status = 'sent'
      }

      return {
        id: inv.id?.toString() || '',
        conversationId: '',
        businessUserId: user?.id || '',
        adminUserId: '',
        numero: doc?.number || inv.file_name || `#${inv.id}`,
        cliente: inv.committente || 'Cliente',
        clienteEmail: '',
        azienda: inv.company?.ragione_sociale || inv.company?.name || invoicetronicCompany?.ragione_sociale || invoicetronicCompany?.name || '',
        consulente: '',
        servizio: inv.meta_data?.descrizione || inv.format || 'Servizio professionale',
        tipo: 'Fattura',
        importo: importo,
        iva: 0,
        totale: importo,
        status: status,
        dataEmissione: doc?.date ? new Date(doc.date).toISOString().split('T')[0] :
                        (inv.date_sent ? new Date(inv.date_sent).toISOString().split('T')[0] :
                         new Date(inv.created).toISOString().split('T')[0]),
        dataScadenza: undefined,
        dataPagamento: undefined,
        stripePaymentIntentId: '',
        createdAt: new Date(inv.created || Date.now()),
        updatedAt: new Date(inv.last_update || inv.created || Date.now()),
        ...(inv.identifier && { descrizione: `SDI ID: ${inv.identifier}` })
      } as unknown as Invoice
    }
  })

  // Use converted invoices (no mock data)
  const businessInvoices = convertedInvoices

  const filteredFatture = businessInvoices.filter((fattura: any) => {
    const matchesSearch = fattura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fattura.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fattura.servizio && fattura.servizio.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || fattura.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleCreateInvoice = async (formData: any) => {
    try {
      setInvoiceError(null)

      // Check if data is synced
      if (!isDataSynced) {
        throw new Error('Dati non sincronizzati. Clicca "Aggiorna" nel banner arancione per sincronizzare i dati dalle Impostazioni.')
      }

      // Validate we have company data
      if (!invoicetronicCompany) {
        throw new Error('Azienda non configurata')
      }

      // Validate company has required data
      const companyPiva = invoicetronicCompany.piva || invoicetronicCompany.vat
      const companyCfis = invoicetronicCompany.cfis || invoicetronicCompany.fiscalCode

      if (!companyPiva || !companyCfis) {
        throw new Error('Dati fiscali azienda incompleti. Vai su Impostazioni e configura P.IVA e Codice Fiscale, poi clicca "Aggiorna" in questa pagina.')
      }

      // Validate P.IVA is not a placeholder/test value
      if (companyPiva.includes('00000000000')) {
        throw new Error(`⚠️ P.IVA non valida: ${companyPiva}\n\nLa P.IVA configurata è un valore di test. Vai su Impostazioni, inserisci la tua P.IVA reale, salva e torna qui per cliccare "Aggiorna".`)
      }

      // Check if client exists by codice fiscale
      const existingClient = clients.find(c => c.codiceFiscale === formData.codiceFiscaleCliente)

      // If client doesn't exist, create it automatically
      if (!existingClient && formData.codiceFiscaleCliente) {
        try {
          const newClientData = {
            denominazione: formData.cliente,
            codiceFiscale: formData.codiceFiscaleCliente,
            partitaIva: formData.partitaIvaCliente || '',
            indirizzo: formData.indirizzoCliente,
            numeroCivico: formData.numeroCivicoCliente || '',
            cap: formData.capCliente,
            comune: formData.comuneCliente,
            provincia: formData.provinciaCliente,
            nazione: 'IT',
            email: formData.email,
            telefono: '',
            pec: formData.pecCliente || '',
            codiceDestinatario: formData.codiceDestinatario || '0000000',
            note: ''
          }

          // Create client using existing validation
          await handleCreateClient(newClientData)
          showToast('Cliente creato automaticamente!', 'success')
        } catch (clientError: any) {
          // If client creation fails, still try to create invoice but warn user
          console.warn('Warning: Could not auto-create client:', clientError)
          showToast('Attenzione: impossibile salvare il cliente', 'warning')
        }
      }

      // Build invoice data from form
      const invoiceFormData: InvoiceFormData = {
        cliente: {
          denominazione: formData.cliente || '',
          partitaIva: formData.partitaIvaCliente || '',
          codiceFiscale: formData.codiceFiscaleCliente || '',
          indirizzo: formData.indirizzoCliente || 'Via Roma 1',
          numeroCivico: formData.numeroCivicoCliente || '',
          cap: formData.capCliente || '00100',
          comune: formData.comuneCliente || 'Roma',
          provincia: formData.provinciaCliente || 'RM',
          nazione: 'IT',
          codiceDestinatario: formData.codiceDestinatario || '0000000',
          pec: formData.pecCliente
        },
        fornitore: {
          denominazione: invoicetronicCompany.ragione_sociale || invoicetronicCompany.name,
          partitaIva: invoicetronicCompany.piva || invoicetronicCompany.vat,
          codiceFiscale: invoicetronicCompany.cfis || invoicetronicCompany.fiscalCode,
          indirizzo: (user as any)?.indirizzo || 'Via Example 1',
          numeroCivico: (user as any)?.numeroCivico || '',
          cap: (user as any)?.cap || '00100',
          comune: (user as any)?.citta || (user as any)?.comune || 'Roma',
          provincia: (user as any)?.provincia || 'RM',
          nazione: 'IT',
          regimeFiscale: 'RF19'  // Forfettario
        },
        numero: formData.numeroFattura || `${Date.now()}`,
        data: formData.dataEmissione || new Date().toISOString().split('T')[0],
        descrizione: formData.descrizione || formData.servizio || 'Servizio professionale',
        prezzoUnitario: parseFloat(formData.importo) || 0,
        quantita: parseFloat(formData.quantita) || 1,
        unitaMisura: formData.unitaMisura || 'NR',
        aliquotaIVA: parseFloat(formData.iva) || 0,
        metodoPagamento: formData.metodoPagamento || 'MP05',
        iban: formData.iban || '',
        dataScadenza: formData.dataScadenza || ''
      }

      // Validate invoice data (validation is also done in the modal)
      const validation = validateInvoiceData(invoiceFormData)
      if (!validation.valid) {
        // Log validation errors for debugging - this shouldn't happen if modal validation works
        console.warn('Invoice validation errors:', validation.errors)
        return // Stop without showing error banner - modal should handle this
      }

      // Build FatturaOrdinaria
      const fatturaOrdinaria = buildFatturaOrdinaria(invoiceFormData)

      // Debug: log P.IVA mittente
      console.log('📤 Invio fattura con P.IVA mittente:', fatturaOrdinaria.piva_mittente)
      console.log('📋 Dati azienda configurata:', {
        piva: invoicetronicCompany.piva,
        cfis: invoicetronicCompany.cfis,
        ragione_sociale: invoicetronicCompany.ragione_sociale,
        id: invoicetronicCompany.id
      })

      // Send to Invoicetronic
      const response = await api.sendInvoice(fatturaOrdinaria)

      if (response.success) {
        console.log('Invoice sent successfully:', response.invoice)
        // Reload invoices
        await loadInvoices()
        setShowNewInvoice(false)
        showToast('Fattura inviata con successo!', 'success')
      } else {
        throw new Error(response.message || 'Errore nell\'invio della fattura')
      }
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      // Throw error to be caught by modal (don't set page-level error)
      throw error
    }
  }

  const handleCreateClient = async (formData: any): Promise<void> => {
    const clientData = {
      ragioneSociale: formData.denominazione || formData.ragioneSociale || formData.nome,
      partitaIva: formData.partitaIva || formData.piva,
      codiceFiscale: formData.codiceFiscale,
      indirizzo: formData.indirizzo,
      numeroCivico: formData.numeroCivico || '',
      cap: formData.cap,
      comune: formData.comune,
      provincia: formData.provincia,
      nazione: formData.nazione || 'IT',
      email: formData.email,
      telefono: formData.telefono,
      pec: formData.pec,
      codiceDestinatario: formData.codiceDestinatario || '0000000',
      note: formData.note
    }

    let response
    if (editingClient) {
      // Update existing client
      const clientId = (editingClient.id || editingClient._id) as string
      if (!clientId) {
        throw new Error('ID cliente non valido')
      }
      response = await api.updateBusinessClient(clientId, clientData)
      if (!response.success) {
        throw new Error(response.message || 'Errore nell\'aggiornamento del cliente')
      }
      showToast('Cliente aggiornato con successo!', 'success')
    } else {
      // Create new client
      response = await api.createBusinessClient(clientData)
      if (!response.success) {
        throw new Error(response.message || 'Errore nella creazione del cliente')
      }
      showToast('Cliente creato con successo!', 'success')
    }

    await loadClients() // Reload clients list
    setShowNewClient(false)
    setEditingClient(null)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowNewClient(true)
  }

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client)
    setShowDeleteClientModal(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      const clientId = (clientToDelete.id || clientToDelete._id) as string
      if (!clientId) {
        throw new Error('ID cliente non valido')
      }
      const response = await api.deleteBusinessClient(clientId)
      if (response.success) {
        showToast('Cliente eliminato con successo!', 'success')
        setShowDeleteClientModal(false)
        setClientToDelete(null)
        await loadClients()
      }
    } catch (error: any) {
      console.error('Error deleting client:', error)
      showToast(error.message || 'Errore nell\'eliminazione del cliente', 'error')
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const invoiceId = invoice.id
      if (!invoiceId) {
        throw new Error('ID fattura non valido')
      }

      console.log('📥 Downloading PDF for invoice:', invoiceId)
      showToast('Download PDF in corso...', 'info')

      const pdfBlob = await api.getInvoicePdf(invoiceId)

      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fattura_${invoice.numero.replace('/', '_')}.pdf`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('PDF scaricato con successo!', 'success')
    } catch (error: any) {
      console.error('Error downloading invoice PDF:', error)
      showToast(error.message || 'Errore nel download del PDF', 'error')
    }
  }

  const handleSendInvoice = (invoice: Invoice) => {
    console.log('Sending invoice:', invoice.id)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    console.log('Editing invoice:', invoice.id)
  }

  const handleSyncStatus = async (invoice: Invoice) => {
    try {
      const invoiceId = (invoice as any)._id || invoice.id
      if (!invoiceId) {
        throw new Error('ID fattura non valido')
      }

      setSyncingInvoiceId(invoiceId)
      console.log('🔄 Sincronizzazione status per fattura:', invoiceId)

      const response = await api.syncInvoiceStatus(invoiceId)

      if (response.success) {
        console.log('✅ Status sincronizzato:', response.invoice)
        showToast(`Status aggiornato: ${response.invoice.sdiStatoDescrizione || response.invoice.status}`, 'success')

        // Reload invoices to show updated status
        await loadInvoices()
      } else {
        throw new Error(response.message || 'Errore nella sincronizzazione')
      }
    } catch (error: any) {
      console.error('Error syncing invoice status:', error)
      showToast(error.message || 'Errore nell\'aggiornamento dello status', 'error')
    } finally {
      setSyncingInvoiceId(null)
    }
  }

  const invoiceStats = calculateInvoiceStats(businessInvoices)
  const stats: StatItem[] = [
    { title: 'Fatture Totali', value: invoiceStats.total.toString(), icon: FileText, color: 'text-blue-600' },
    { title: 'Fatturato Totale', value: `€ ${invoiceStats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { title: 'In Attesa Pagamento', value: `€ ${invoiceStats.pending.toLocaleString()}`, icon: Clock, color: 'text-yellow-600' },
    { title: 'Fatture Pagate', value: businessInvoices.filter(f => f.status === 'paid').length.toString(), icon: CheckCircle, color: 'text-green-600' }
  ]

  const renderFattureTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Banner */}
      {invoiceError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-red-700">{invoiceError}</p>
              <button
                onClick={() => loadInvoices()}
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 underline mt-1"
              >
                Riprova
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cerca per numero, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-auto min-w-[120px]"
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
            {businessInvoices.length > 0 && filteredFatture.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {filteredFatture.length === businessInvoices.length
                  ? `${businessInvoices.length} ${businessInvoices.length === 1 ? 'fattura' : 'fatture'} totali`
                  : `${filteredFatture.length} di ${businessInvoices.length} ${businessInvoices.length === 1 ? 'fattura' : 'fatture'}`}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowNewInvoice(true)}
            disabled={!isDataSynced}
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center text-xs sm:text-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={!isDataSynced ? 'Aggiorna i dati per creare fatture' : undefined}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            Nuova Fattura
          </button>
        </div>
      </div>

      {/* Fatture Table */}
      {loadingInvoices ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-xs sm:text-sm text-gray-600">Caricamento fatture...</p>
          </div>
        </div>
      ) : filteredFatture.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Nessuna fattura trovata</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia creando la tua prima fattura elettronica'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowNewInvoice(true)}
              className="bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
            >
              Crea Prima Fattura
            </button>
          )}
        </div>
      ) : (
        <InvoiceTable
          invoices={filteredFatture}
          onViewInvoice={handleViewInvoice}
          onEditInvoice={handleEditInvoice}
          onDownloadInvoice={handleDownloadInvoice}
          onSendInvoice={handleSendInvoice}
          onSyncStatus={handleSyncStatus}
          syncingInvoiceId={syncingInvoiceId}
          showClientEmail={false}
          showService={true}
        />
      )}
    </div>
  )

  // Filter and paginate clients
  const filteredClients = clients.filter((cliente) => {
    if (!clientSearchTerm) return true

    const searchLower = clientSearchTerm.toLowerCase()
    const denominazione = (cliente.ragioneSociale || cliente.nome || '').toLowerCase()
    const email = (cliente.email || '').toLowerCase()
    const piva = (cliente.partitaIva || cliente.piva || '').toLowerCase()
    const cf = (cliente.codiceFiscale || '').toLowerCase()
    const telefono = (cliente.telefono || '').toLowerCase()

    return denominazione.includes(searchLower) ||
           email.includes(searchLower) ||
           piva.includes(searchLower) ||
           cf.includes(searchLower) ||
           telefono.includes(searchLower)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage)
  const indexOfLastClient = currentPage * clientsPerPage
  const indexOfFirstClient = indexOfLastClient - clientsPerPage
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient)

  // Reset to page 1 when search changes
  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value)
    setCurrentPage(1)
  }

  const renderClientiTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Search bar and actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cerca per nome, email, P.IVA, codice fiscale, telefono..."
                value={clientSearchTerm}
                onChange={(e) => handleClientSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {clientSearchTerm && (
                <button
                  onClick={() => handleClientSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Cancella ricerca"
                >
                  ✕
                </button>
              )}
            </div>
            {clients.length > 0 && filteredClients.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {filteredClients.length === clients.length
                  ? `${clients.length} ${clients.length === 1 ? 'cliente' : 'clienti'} totali`
                  : `${filteredClients.length} di ${clients.length} ${clients.length === 1 ? 'cliente' : 'clienti'}`}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setEditingClient(null)
              setShowNewClient(true)
            }}
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center text-xs sm:text-sm w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            Nuovo Cliente
          </button>
        </div>
      </div>

      {loadingClients ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-xs sm:text-sm text-gray-600">Caricamento clienti...</p>
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
          <Building className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Nessun cliente trovato</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6">
            Inizia aggiungendo il tuo primo cliente per poter emettere fatture
          </p>
          <button
            onClick={() => {
              setEditingClient(null)
              setShowNewClient(true)
            }}
            className="bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
          >
            Aggiungi Primo Cliente
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
          <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Nessun cliente trovato</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6">
            Nessun cliente corrisponde ai criteri di ricerca "{clientSearchTerm}"
          </p>
          <button
            onClick={() => handleClientSearch('')}
            className="bg-primary-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
          >
            Cancella Ricerca
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {currentClients.map((cliente) => (
              <div key={cliente.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{cliente.ragioneSociale || cliente.nome}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">P.IVA: {cliente.partitaIva || cliente.piva}</p>
                    <p className="text-xs sm:text-sm text-gray-600">CF: {cliente.codiceFiscale}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{cliente.indirizzo}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 pt-2 gap-1">
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{cliente.email}</span>
                      <span className="text-xs sm:text-sm text-gray-600">{cliente.telefono}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditClient(cliente)}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 hover:scale-110 transition-transform duration-200"
                    title="Modifica cliente"
                  >
                    <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(cliente)}
                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 hover:scale-110 transition-transform duration-200"
                    title="Elimina cliente"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedClient(cliente)}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 hover:scale-110 transition-transform duration-200"
                    title="Visualizza dettagli"
                  >
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page info */}
              <div className="text-xs sm:text-sm text-gray-600">
                Mostrando {indexOfFirstClient + 1}-{Math.min(indexOfLastClient, filteredClients.length)} di {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clienti'}
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Precedente
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first page, current page and nearby pages, last page
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
                        className={`w-8 h-8 text-xs sm:text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Successivo
                </button>
              </div>
            </div>
          </div>
        )}
      </>
      )}
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
      <div className="h-full flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Configura Sistema Fatturazione
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Per iniziare a emettere fatture elettroniche, configura i tuoi dati fiscali
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-blue-700">
                <p className="font-semibold mb-1">Perché servono questi dati?</p>
                <p className="mb-2">
                  I dati fiscali sono necessari per emettere fatture elettroniche valide ai tuoi clienti tramite il Sistema di Interscambio (SDI).
                </p>
                <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block">
                  💡 La tua azienda sarà registrata sul sistema di fatturazione elettronica
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {setupError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-red-700">{setupError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleInvoicetronicSetup} className="space-y-4 sm:space-y-6">
            {/* VAT Number */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Partita IVA *
              </label>
              <input
                type="text"
                value={setupData.vat}
                onChange={(e) => setSetupData(prev => ({ ...prev, vat: e.target.value }))}
                placeholder="IT01234567891"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Inserisci la Partita IVA con il prefisso del paese (es: IT01234567891)
              </p>
            </div>

            {/* Fiscal Code */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Codice Fiscale *
              </label>
              <input
                type="text"
                value={setupData.fiscalCode}
                onChange={(e) => setSetupData(prev => ({ ...prev, fiscalCode: e.target.value }))}
                placeholder="RSSMRA70A01F205V"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Codice fiscale dell'azienda o del professionista
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Ragione Sociale / Nome *
              </label>
              <input
                type="text"
                value={setupData.name}
                onChange={(e) => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mario Rossi Srl"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
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
    <div>
      {/* Invoicetronic Status Banner */}
      <div className={`${isDataSynced ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4`}>
        <div className="flex items-start space-x-2 sm:space-x-3">
          {isDataSynced ? (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h4 className={`font-semibold text-sm sm:text-base ${isDataSynced ? 'text-green-900' : 'text-orange-900'}`}>
                {isDataSynced ? 'Sistema Fatturazione Sincronizzato' : 'Dati da Aggiornare'}
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {isDataSynced && invoices.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                    {invoices.length} fatture caricate
                  </span>
                )}
                <button
                  onClick={handleRefreshCompany}
                  disabled={refreshingCompany}
                  className={`flex items-center space-x-1 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDataSynced
                      ? 'text-green-700 hover:text-green-800 hover:bg-green-100'
                      : 'text-orange-700 hover:text-orange-800 hover:bg-orange-100'
                  }`}
                  title="Aggiorna dati aziendali dalle impostazioni"
                >
                  <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshingCompany ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{refreshingCompany ? 'Aggiornamento...' : 'Aggiorna'}</span>
                </button>
              </div>
            </div>
            <p className={`text-xs sm:text-sm mt-1 ${isDataSynced ? 'text-green-700' : 'text-orange-700'}`}>
              <strong className="truncate">{(user as any)?.company || invoicetronicCompany.ragione_sociale || invoicetronicCompany.name}</strong> - P.IVA: {(user as any)?.piva || invoicetronicCompany.piva || invoicetronicCompany.vat}
            </p>
            <p className={`text-xs mt-1 ${isDataSynced ? 'text-green-600' : 'text-orange-600'}`}>
              {isDataSynced
                ? 'Puoi ora emettere fatture elettroniche ai tuoi clienti'
                : 'I dati nelle Impostazioni sono stati modificati. Clicca "Aggiorna" per sincronizzare e poter emettere fatture.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow mb-3 sm:mb-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 sm:p-4 rounded-lg text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm">{tab.name}</span>
              </div>
              <p className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'} line-clamp-1`}>
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
        clients={clients}
        userIvaRate={(user as any)?.aliquotaIva}
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
        onClose={() => {
          setShowNewClient(false)
          setEditingClient(null)
        }}
        onSubmit={handleCreateClient}
        initialData={editingClient ? {
          denominazione: editingClient.ragioneSociale || editingClient.nome,
          codiceFiscale: editingClient.codiceFiscale,
          partitaIva: editingClient.partitaIva || editingClient.piva,
          indirizzo: editingClient.indirizzo,
          numeroCivico: editingClient.numeroCivico || '',
          cap: editingClient.cap,
          comune: editingClient.comune,
          provincia: editingClient.provincia,
          nazione: editingClient.nazione || 'IT',
          email: editingClient.email,
          telefono: editingClient.telefono,
          pec: editingClient.pec,
          codiceDestinatario: editingClient.codiceDestinatario,
          note: editingClient.note
        } : undefined}
        isEditMode={!!editingClient}
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

      {/* Delete Client Confirmation Modal */}
      <Modal
        isOpen={showDeleteClientModal}
        onClose={() => {
          setShowDeleteClientModal(false)
          setClientToDelete(null)
        }}
        title="Conferma Eliminazione Cliente"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sei sicuro di voler eliminare il cliente <strong>{clientToDelete?.ragioneSociale || clientToDelete?.nome}</strong>? Questa azione non può essere annullata.
          </p>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowDeleteClientModal(false)
                setClientToDelete(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={confirmDeleteClient}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Elimina Cliente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}