import { Search, Filter, TrendingUp, Upload, Users } from 'lucide-react'

interface Client {
  id: string
  nome: string
  azienda?: string
}

interface DocumentFiltersProps {
  searchTerm: string
  filterStatus: string
  filterAnno: string
  availableYears: string[]
  searchPlaceholder?: string
  showClientFilter?: boolean
  clients?: Client[]
  selectedClient?: string
  onSearchChange: (term: string) => void
  onStatusChange: (status: string) => void
  onYearChange: (year: string) => void
  onClientChange?: (clientId: string) => void
  onUpload: () => void
}

export default function DocumentFilters({
  searchTerm,
  filterStatus,
  filterAnno,
  availableYears,
  searchPlaceholder = 'Cerca documenti...',
  showClientFilter = false,
  clients = [],
  selectedClient,
  onSearchChange,
  onStatusChange,
  onYearChange,
  onClientChange,
  onUpload
}: DocumentFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Client Filter (Admin Only) */}
        {showClientFilter && onClientChange && (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti i clienti</option>
              {clients.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.azienda || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="elaborato">Elaborato</option>
            <option value="in_elaborazione">In elaborazione</option>
            <option value="in_attesa">In attesa</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <select
            value={filterAnno}
            onChange={(e) => onYearChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli anni</option>
            {availableYears.filter(y => y !== 'all').map((anno) => (
              <option key={anno} value={anno}>
                Anno {anno}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Button */}
        <button
          onClick={onUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg flex items-center whitespace-nowrap"
        >
          <Upload className="h-4 w-4 mr-2" />
          Carica Documento
        </button>
      </div>
    </div>
  )
}
