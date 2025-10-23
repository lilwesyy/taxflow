import {
  FileText, Upload, Download, FolderOpen, Building, AlertTriangle, Maximize2, CheckCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import { useToast } from '../../../../context/ToastContext'
import api from '../../../../services/api'
import DocumentTabs, { tabs } from '../../shared/documents/DocumentTabs'
import DocumentStats from '../../shared/documents/DocumentStats'
import DocumentCard from '../../shared/documents/DocumentCard'
import DocumentFilters from '../../shared/documents/DocumentFilters'
import { getAvailableYears } from '../../../../utils/documentUtils'
import type { Document } from '../../../../types'
import { logger } from '../../../../utils/logger'

export default function Documenti() {
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAnno, setFilterAnno] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dichiarazioni')
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [documentsFromApi, setDocumentsFromApi] = useState<Document[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)

  const [uploadForm, setUploadForm] = useState({
    nome: '',
    tipo: 'modello_redditi',
    descrizione: '',
    categoria: 'dichiarazioni',
    anno: new Date().getFullYear().toString(),
    protocollo: '',
    importo: '',
    note: '',
    file: null as File | null
  })

  // Load documents from API
  useEffect(() => {
    loadDocuments()
  }, [])

  // Reload when filters change
  useEffect(() => {
    if (documentsFromApi.length > 0) {
      // Only reload from API if we have API docs loaded
      loadDocuments()
    }
  }, [activeTab])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.getDocuments()
      setDocumentsFromApi(response.documents || [])
    } catch (error) {
      logger.error('Error loading documents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore nel caricamento dei documenti'
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenUploadModal = () => {
    // Genera nome documento basato sulla categoria e data
    const categoryName = tabs.find(t => t.id === activeTab)?.name || 'Documento'
    const today = new Date()
    const formattedDate = today.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const documentName = `${categoryName} - ${formattedDate}`

    // Precompila il form con categoria attiva e nome generato
    setUploadForm({
      nome: documentName,
      tipo: 'modello_redditi',
      descrizione: '',
      categoria: activeTab, // Precompila con la tab attiva
      anno: new Date().getFullYear().toString(),
      protocollo: '',
      importo: '',
      note: '',
      file: null
    })
    setIsUploadModalOpen(true)
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadForm.file) {
      showToast('Seleziona un file da caricare', 'error')
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('nome', uploadForm.nome)
      formData.append('tipo', uploadForm.tipo)
      formData.append('categoria', uploadForm.categoria)
      formData.append('anno', uploadForm.anno)
      if (uploadForm.descrizione) formData.append('descrizione', uploadForm.descrizione)
      if (uploadForm.protocollo) formData.append('protocollo', uploadForm.protocollo)
      if (uploadForm.importo) formData.append('importo', uploadForm.importo)
      if (uploadForm.note) formData.append('note', uploadForm.note)

      await api.uploadDocument(formData)
      showToast('Documento caricato con successo!', 'success')
      setIsUploadModalOpen(false)
      setUploadForm({
        nome: '',
        tipo: 'modello_redditi',
        descrizione: '',
        categoria: 'dichiarazioni',
        anno: new Date().getFullYear().toString(),
        protocollo: '',
        importo: '',
        note: '',
        file: null
      })

      // Reload documents
      await loadDocuments()
    } catch (error) {
      logger.error('Error uploading document:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il caricamento del documento'
      showToast(errorMessage, 'error')
    } finally {
      setUploading(false)
    }
  }

  const getFilteredDocuments = () => {
    // Always use API documents (empty array if no documents loaded yet)
    const allDocs = documentsFromApi

    // Filter by active tab
    const docs = allDocs.filter(doc => doc.categoria === activeTab)

    return docs.filter(doc => {
      if (!doc || !doc.nome) return false
      const matchesSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.descrizione && doc.descrizione.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
      const matchesAnno = filterAnno === 'all' || doc.anno === filterAnno
      return matchesSearch && matchesStatus && matchesAnno
    })
  }

  const togglePdfFullscreen = () => {
    if (!isPdfFullscreen) {
      // Quando apro fullscreen, chiudo il modale normale
      setIsPdfViewerOpen(false)
      setIsPdfFullscreen(true)
    } else {
      // Quando chiudo fullscreen, riapro il modale normale
      setIsPdfFullscreen(false)
      setIsPdfViewerOpen(true)
    }
  }

  const handleOpenDeleteModal = (documento: Document) => {
    setDocumentToDelete(documento)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return

    try {
      await api.deleteDocument(documentToDelete.id)
      showToast('Documento eliminato definitivamente', 'success')
      setIsDeleteModalOpen(false)
      setDocumentToDelete(null)
      await loadDocuments()
    } catch (error) {
      logger.error('Error deleting document:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'eliminazione del documento'
      showToast(errorMessage, 'error')
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDocumentToDelete(null)
  }

  const handleOpenPdfViewerApi = (documento: Document) => {
    if (documento.formato === 'PDF' && documento.fileUrl) {
      // Use API URL for real documents
      const fullUrl = api.getDocumentUrl(documento.fileUrl)
      setPdfUrl(fullUrl)
      setIsPdfViewerOpen(true)
      setIsPdfFullscreen(false)
    } else {
      setSelectedDocument(documento)
    }
  }

  const allDocuments = documentsFromApi
  const currentTabData = tabs.find(t => t.id === activeTab)
  const filteredDocuments = getFilteredDocuments()
  const availableYears = getAvailableYears(allDocuments)

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Il tuo Cassetto Fiscale</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Documenti organizzati come nell'Agenzia delle Entrate</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-8 w-full lg:w-auto justify-around lg:justify-end">
            <div className="text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{allDocuments.length}</p>
              <p className="text-blue-100 text-xs sm:text-sm whitespace-nowrap">Documenti totali</p>
            </div>
            <div className="h-8 sm:h-12 w-px bg-blue-400"></div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{allDocuments.filter(d => d.status === 'elaborato').length}</p>
              <p className="text-blue-100 text-xs sm:text-sm whitespace-nowrap">Elaborati</p>
            </div>
            <div className="h-8 sm:h-12 w-px bg-blue-400 hidden sm:block"></div>
            <div className="text-center hidden sm:block">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{allDocuments.filter(d => d.status === 'in_elaborazione').length}</p>
              <p className="text-blue-100 text-xs sm:text-sm whitespace-nowrap">In lavorazione</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <DocumentStats documents={allDocuments} />

      {/* Tabs Navigation */}
      <DocumentTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Search and Filters */}
      <DocumentFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterAnno={filterAnno}
        availableYears={availableYears}
        onSearchChange={setSearchTerm}
        onStatusChange={setFilterStatus}
        onYearChange={setFilterAnno}
        onUpload={handleOpenUploadModal}
      />

      {/* Current Tab Info */}
      {currentTabData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start space-x-3">
            <currentTabData.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-blue-900">{currentTabData.name}</h3>
              <p className="text-xs sm:text-sm text-blue-700">{currentTabData.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento documenti...</p>
        </div>
      )}

      {/* Documents Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredDocuments.filter(doc => doc && doc.nome).map((documento) => (
          <DocumentCard
            key={documento.id}
            documento={documento}
            onView={handleOpenPdfViewerApi}
            onDelete={handleOpenDeleteModal}
          />
        ))}
      </div>
      )}

      {/* Empty State */}
      {!loading && filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <FolderOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Nessun documento trovato</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Non ci sono documenti in questa categoria o che corrispondono ai filtri selezionati.
          </p>
          <button
            onClick={handleOpenUploadModal}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center justify-center text-xs sm:text-sm"
          >
            <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            Carica il primo documento
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Carica Nuovo Documento"
        maxWidth="xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Categoria *</label>
            <select
              value={uploadForm.categoria}
              onChange={(e) => setUploadForm({...uploadForm, categoria: e.target.value})}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              required
            >
              <option value="dichiarazioni">Dichiarazioni</option>
              <option value="fatturazione">Fatturazione</option>
              <option value="comunicazioni">Comunicazioni</option>
              <option value="versamenti">Versamenti</option>
              <option value="consultazione">Consultazione</option>
              <option value="registri">Registri</option>
              <option value="altri_documenti">Altri Documenti</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nome documento *</label>
              <input
                type="text"
                value={uploadForm.nome}
                onChange={(e) => setUploadForm({...uploadForm, nome: e.target.value})}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                placeholder="Es. Modello Redditi 2025"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tipo documento *</label>
              <select
                value={uploadForm.tipo}
                onChange={(e) => setUploadForm({...uploadForm, tipo: e.target.value})}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                required
              >
                <option value="modello_redditi">Modello Redditi</option>
                <option value="dichiarazione_iva">Dichiarazione IVA</option>
                <option value="modello_730">Modello 730</option>
                <option value="fattura_elettronica">Fattura Elettronica</option>
                <option value="f24">F24</option>
                <option value="cu">Certificazione Unica</option>
                <option value="altro">Altro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anno *</label>
              <input
                type="text"
                value={uploadForm.anno}
                onChange={(e) => setUploadForm({...uploadForm, anno: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Protocollo</label>
              <input
                type="text"
                value={uploadForm.protocollo}
                onChange={(e) => setUploadForm({...uploadForm, protocollo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="DR202500123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Importo</label>
              <input
                type="text"
                value={uploadForm.importo}
                onChange={(e) => setUploadForm({...uploadForm, importo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="€ 1.500,00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
            <textarea
              value={uploadForm.descrizione}
              onChange={(e) => setUploadForm({...uploadForm, descrizione: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrizione opzionale del documento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              value={uploadForm.note}
              onChange={(e) => setUploadForm({...uploadForm, note: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Note aggiuntive..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
            <input
              type="file"
              onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              accept=".pdf,.xml,.doc,.docx,.xls,.xlsx"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Formati supportati: PDF, XML, DOC, DOCX, XLS, XLSX (max 10MB)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Conformità Agenzia delle Entrate</p>
                <p className="text-xs text-blue-800 mt-1">
                  I documenti vengono organizzati secondo la struttura del Cassetto Fiscale AdE per massima conformità e tracciabilità.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm"
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Caricamento...
                </>
              ) : (
                'Carica Documento'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <Modal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          title={selectedDocument.nome}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informazioni Documento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo:</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedDocument.tipo.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Formato:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.formato}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dimensione:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.dimensione}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Anno:</p>
                  <p className="font-medium text-gray-900">{selectedDocument.anno}</p>
                </div>
                {selectedDocument.protocollo && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Protocollo:</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedDocument.protocollo}</p>
                  </div>
                )}
                {selectedDocument.importo && (
                  <div>
                    <p className="text-sm text-gray-600">Importo:</p>
                    <p className="font-medium text-gray-900 text-lg">{selectedDocument.importo}</p>
                  </div>
                )}
              </div>

              {selectedDocument.note && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Note:</p>
                  <p className="text-gray-900">{selectedDocument.note}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Cronologia</h3>
              <div className="space-y-3">
                {selectedDocument.cronologia.map((evento, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{evento.azione}</p>
                      <p className="text-xs text-gray-500">{new Date(evento.data).toLocaleDateString('it-IT')} - {evento.utente}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedDocument(null)}
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                Chiudi
              </button>
              <button className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center text-xs sm:text-sm">
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                Scarica
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF Viewer Modal */}
      {isPdfViewerOpen && !isPdfFullscreen && (
        <Modal
          isOpen={isPdfViewerOpen}
          onClose={() => setIsPdfViewerOpen(false)}
          title="Visualizzatore PDF"
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* PDF Container */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[600px] border-0"
                title="PDF Viewer"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={togglePdfFullscreen}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Schermo intero
              </button>
              <a
                href={pdfUrl}
                download
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF Fullscreen Mode */}
      {isPdfFullscreen && (
        <div className="fixed inset-0 !m-0 !mt-0 bg-gray-900 z-[9999] flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-6 flex items-center justify-between flex-shrink-0 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <h2 className="text-base font-semibold">Visualizzatore PDF - Schermo Intero</h2>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={pdfUrl}
                download
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </a>
              <button
                onClick={togglePdfFullscreen}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chiudi schermo intero
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-900">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Viewer Fullscreen"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && documentToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Conferma eliminazione"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Eliminare definitivamente questo documento?
                </h3>
                <p className="text-gray-600 mb-4">
                  Stai per eliminare <span className="font-semibold">"{documentToDelete.nome}"</span>.
                  Questa azione è <span className="font-semibold text-red-600">irreversibile</span> e il file verrà rimosso permanentemente dal sistema.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium text-gray-900">{documentToDelete.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formato:</span>
                    <span className="font-medium text-gray-900">{documentToDelete.formato}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensione:</span>
                    <span className="font-medium text-gray-900">{documentToDelete.dimensione}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancelDelete}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm"
              >
                Elimina definitivamente
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
