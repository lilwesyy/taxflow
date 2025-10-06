import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import type { Document } from '../../../../utils/documentUtils'

interface DocumentStatsProps {
  documents: Document[]
  currentYear?: number
}

export default function DocumentStats({ documents, currentYear = 2025 }: DocumentStatsProps) {
  const elaborati = documents.filter(d => d.status === 'elaborato').length
  const inElaborazione = documents.filter(d => d.status === 'in_elaborazione').length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Totale Documenti</p>
            <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
          </div>
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Elaborati</p>
            <p className="text-2xl font-bold text-green-600">{elaborati}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">In Elaborazione</p>
            <p className="text-2xl font-bold text-blue-600">{inElaborazione}</p>
          </div>
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Anno Corrente</p>
            <p className="text-2xl font-bold text-gray-900">{currentYear}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>
  )
}
