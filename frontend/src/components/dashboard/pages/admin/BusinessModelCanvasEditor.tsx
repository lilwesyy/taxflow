import { ChevronDown, ChevronUp, Grid3x3 } from 'lucide-react'
import { BusinessModelCanvasData } from '../../../../types/businessPlan'

interface BusinessModelCanvasEditorProps {
  data: BusinessModelCanvasData
  onChange: (data: BusinessModelCanvasData) => void
  isExpanded: boolean
  onToggle: () => void
}

const CANVAS_BLOCKS = [
  {
    key: 'keyPartners' as const,
    title: 'Partner Chiave',
    subtitle: 'Key Partners',
    placeholder: 'Chi sono i nostri partner chiave?\nChi sono i nostri fornitori chiave?\nQuali risorse chiave acquisiamo dai partner?\nQuali attività chiave svolgono i partner?',
    color: 'purple'
  },
  {
    key: 'keyActivities' as const,
    title: 'Attività Chiave',
    subtitle: 'Key Activities',
    placeholder: 'Quali attività chiave richiede la nostra proposta di valore?\nI nostri canali di distribuzione?\nLe relazioni con i clienti?\nI flussi di ricavi?',
    color: 'blue'
  },
  {
    key: 'keyResources' as const,
    title: 'Risorse Chiave',
    subtitle: 'Key Resources',
    placeholder: 'Quali risorse chiave richiede la nostra proposta di valore?\nI nostri canali di distribuzione?\nLe relazioni con i clienti?\nI flussi di ricavi?',
    color: 'indigo'
  },
  {
    key: 'valuePropositions' as const,
    title: 'Proposta di Valore',
    subtitle: 'Value Propositions',
    placeholder: 'Quale valore forniamo al cliente?\nQuali problemi dei clienti aiutiamo a risolvere?\nQuali bisogni dei clienti soddisfiamo?\nQuali pacchetti di prodotti e servizi offriamo a ciascun segmento di clientela?',
    color: 'green',
    highlight: true
  },
  {
    key: 'customerRelationships' as const,
    title: 'Relazioni con i Clienti',
    subtitle: 'Customer Relationships',
    placeholder: 'Che tipo di relazione ciascuno dei nostri segmenti di clientela si aspetta?\nQuali relazioni abbiamo stabilito?\nQuanto costano?\nCome sono integrate con il resto del nostro modello di business?',
    color: 'teal'
  },
  {
    key: 'channels' as const,
    title: 'Canali',
    subtitle: 'Channels',
    placeholder: 'Attraverso quali canali i nostri segmenti di clientela vogliono essere raggiunti?\nCome li raggiungiamo ora?\nCome sono integrati i nostri canali?\nQuali funzionano meglio?\nQuali sono più efficienti in termini di costi?',
    color: 'cyan'
  },
  {
    key: 'customerSegments' as const,
    title: 'Segmenti di Clientela',
    subtitle: 'Customer Segments',
    placeholder: 'Per chi creiamo valore?\nChi sono i nostri clienti più importanti?\nMassa, nicchia, segmentato, diversificato, multi-sided platform?',
    color: 'orange'
  },
  {
    key: 'costStructure' as const,
    title: 'Struttura dei Costi',
    subtitle: 'Cost Structure',
    placeholder: 'Quali sono i costi più importanti inerenti al nostro modello di business?\nQuali risorse chiave sono più costose?\nQuali attività chiave sono più costose?\nCost-driven o value-driven?',
    color: 'red',
    span: 'col-span-1'
  },
  {
    key: 'revenueStreams' as const,
    title: 'Flussi di Ricavi',
    subtitle: 'Revenue Streams',
    placeholder: 'Per quale valore i nostri clienti sono veramente disposti a pagare?\nPer cosa pagano attualmente?\nCome pagano attualmente?\nCome preferirebbero pagare?\nQuanto contribuisce ciascun flusso di ricavi al ricavo complessivo?',
    color: 'green',
    span: 'col-span-1'
  }
]

export default function BusinessModelCanvasEditor({
  data,
  onChange,
  isExpanded,
  onToggle
}: BusinessModelCanvasEditorProps) {
  const updateBlock = (key: keyof BusinessModelCanvasData, value: string) => {
    onChange({
      ...data,
      [key]: value
    })
  }

  const renderBlock = (block: typeof CANVAS_BLOCKS[0]) => {
    const value = data[block.key]
    const isHighlight = block.highlight

    return (
      <div
        key={block.key}
        className={`${block.span || 'col-span-1'} ${
          isHighlight
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
            : 'bg-white border border-gray-200'
        } rounded-lg p-4 hover:shadow-md transition-shadow`}
      >
        <div className="mb-2">
          <h4 className={`font-bold ${isHighlight ? 'text-green-800' : 'text-gray-900'}`}>
            {block.title}
          </h4>
          <p className="text-xs text-gray-500">{block.subtitle}</p>
        </div>
        <textarea
          value={value}
          onChange={(e) => updateBlock(block.key, e.target.value)}
          placeholder={block.placeholder}
          rows={8}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            isHighlight ? 'bg-white/70' : 'bg-gray-50'
          }`}
        />
        <div className="text-xs text-gray-500 mt-1">
          {value.split('\n').filter(line => line.trim()).length} elementi
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <Grid3x3 className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Business Model Canvas</h3>
              <p className="text-sm text-gray-600">
                Modello di business strutturato in 9 blocchi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          {/* Canvas Grid */}
          <div className="grid grid-cols-5 gap-4">
            {/* Row 1: Partners, Activities, Value Prop, Relations, Segments */}
            <div className="col-span-1 space-y-4">
              {renderBlock(CANVAS_BLOCKS[0])} {/* Key Partners */}
            </div>

            <div className="col-span-1 space-y-4">
              {renderBlock(CANVAS_BLOCKS[1])} {/* Key Activities */}
              {renderBlock(CANVAS_BLOCKS[2])} {/* Key Resources */}
            </div>

            <div className="col-span-1">
              {renderBlock(CANVAS_BLOCKS[3])} {/* Value Propositions - HIGHLIGHT */}
            </div>

            <div className="col-span-1 space-y-4">
              {renderBlock(CANVAS_BLOCKS[4])} {/* Customer Relationships */}
              {renderBlock(CANVAS_BLOCKS[5])} {/* Channels */}
            </div>

            <div className="col-span-1">
              {renderBlock(CANVAS_BLOCKS[6])} {/* Customer Segments */}
            </div>
          </div>

          {/* Row 2: Cost Structure & Revenue Streams */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {renderBlock(CANVAS_BLOCKS[7])} {/* Cost Structure */}
            {renderBlock(CANVAS_BLOCKS[8])} {/* Revenue Streams */}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Come compilare il Canvas</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Inizia dalla <strong>Proposta di Valore</strong> (al centro, evidenziata in verde)</li>
              <li>• Definisci i <strong>Segmenti di Clientela</strong> a cui ti rivolgi</li>
              <li>• Descrivi come raggiungi i clienti (<strong>Canali</strong>) e come interagisci con loro (<strong>Relazioni</strong>)</li>
              <li>• Identifica le <strong>Risorse</strong> e <strong>Attività Chiave</strong> necessarie</li>
              <li>• Definisci i <strong>Partner Chiave</strong> che ti supportano</li>
              <li>• Completa con <strong>Costi</strong> e <strong>Ricavi</strong></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
