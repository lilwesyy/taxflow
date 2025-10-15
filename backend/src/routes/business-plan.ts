import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import OpenAI from 'openai'
import PurchasedService from '../models/PurchasedService'

const router = Router()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// POST /api/business-plan/save-mode - Save creation mode choice
router.post('/save-mode', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, mode } = req.body

    if (!serviceId || !mode) {
      return res.status(400).json({ error: 'Service ID e modalità richiesti' })
    }

    if (!['ai', 'template', 'scratch'].includes(mode)) {
      return res.status(400).json({ error: 'Modalità non valida' })
    }

    const service = await PurchasedService.findById(serviceId)

    if (!service) {
      return res.status(404).json({ error: 'Servizio non trovato' })
    }

    // Initialize businessPlanContent if it doesn't exist
    if (!service.businessPlanContent) {
      service.businessPlanContent = {
        creationMode: mode,
        executiveSummary: '',
        idea: '',
        businessModel: '',
        marketAnalysis: '',
        team: '',
        roadmap: '',
        financialPlan: '',
        revenueProjections: '',
        customSections: []
      }
    } else {
      service.businessPlanContent.creationMode = mode
    }

    await service.save()

    res.json({
      success: true,
      message: 'Modalità salvata con successo',
      creationMode: mode
    })
  } catch (error) {
    console.error('Error saving creation mode:', error)
    res.status(500).json({ error: 'Errore nel salvataggio della modalità' })
  }
})

// POST /api/business-plan/reset - Reset business plan (start over)
router.post('/reset', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId } = req.body

    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID richiesto' })
    }

    const service = await PurchasedService.findById(serviceId)

    if (!service) {
      return res.status(404).json({ error: 'Servizio non trovato' })
    }

    // Reset business plan content completely
    service.businessPlanContent = {
      creationMode: undefined,
      executiveSummary: '',
      idea: '',
      businessModel: '',
      marketAnalysis: '',
      team: '',
      roadmap: '',
      financialPlan: '',
      revenueProjections: '',
      customSections: []
    }

    await service.save()

    res.json({
      success: true,
      message: 'Business plan resettato con successo'
    })
  } catch (error) {
    console.error('Error resetting business plan:', error)
    res.status(500).json({ error: 'Errore nel reset del business plan' })
  }
})

// POST /api/business-plan/generate - Generate business plan with AI
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { clientName, clientEmail, context } = req.body

    if (!clientName) {
      return res.status(400).json({ error: 'Nome cliente richiesto' })
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using template instead')
      return res.json({
        businessPlan: generateTemplatePlan(clientName)
      })
    }

    // Generate business plan sections with AI, including questionnaire context
    const businessPlan = await generateAIBusinessPlan(clientName, clientEmail, context)

    res.json({ businessPlan })
  } catch (error) {
    console.error('Error generating business plan:', error)

    // Fallback to template if AI fails
    const fallbackPlan = generateTemplatePlan(req.body.clientName)
    res.json({
      businessPlan: fallbackPlan,
      warning: 'Generazione AI non disponibile, utilizzato template generico'
    })
  }
})

// POST /api/business-plan/suggest - Get AI suggestions for a specific section
router.post('/suggest', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { section, currentContent, context } = req.body

    if (!section) {
      return res.status(400).json({ error: 'Sezione richiesta' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'Servizio AI non configurato' })
    }

    const suggestion = await generateSectionSuggestion(section, currentContent, context)

    res.json({ suggestion })
  } catch (error) {
    console.error('Error generating suggestion:', error)
    res.status(500).json({ error: 'Errore nella generazione del suggerimento' })
  }
})

async function generateAIBusinessPlan(clientName: string, clientEmail?: string, context?: any): Promise<any> {
  // Build context information from questionnaire
  let contextInfo = ''
  if (context) {
    const industry = context.industry === 'Altro (specificare)' ? context.customIndustry : context.industry
    contextInfo = `

INFORMAZIONI SUL BUSINESS (fornite dal cliente):
- Settore/Industria: ${industry || 'Non specificato'}
- Idea imprenditoriale: ${context.businessIdea || 'Non specificata'}
- Mercato target: ${context.targetMarket || 'Non specificato'}
- Fase dell'azienda: ${context.businessStage || 'Non specificata'}
- Modello di business: ${context.businessModel || 'Non specificato'}
- Timeline/Orizzonte temporale: ${context.timeline || 'Non specificato'}
- Obiettivi principali: ${context.mainObjectives || 'Non specificati'}
${context.estimatedBudget ? `- Budget/Investimento stimato: ${context.estimatedBudget}` : ''}
${context.teamSize ? `- Dimensione team: ${context.teamSize}` : ''}
${context.competitors ? `- Concorrenti principali: ${context.competitors}` : ''}

Usa queste informazioni per personalizzare ogni sezione del business plan in modo specifico e dettagliato.`
  }

  const prompt = `Genera un business plan professionale completo in italiano per un cliente di nome "${clientName}".${contextInfo}

Il business plan deve essere strutturato con le seguenti sezioni:

1. Executive Summary: Una sintesi esecutiva di 3-4 paragrafi che riassume il progetto, gli obiettivi principali e i punti di forza. Usa HTML formattato con tag <p>, <h3>, <ul>, <li>, <strong> per la struttura.

2. L'Idea: Descrizione dettagliata dell'idea imprenditoriale basata sulle informazioni fornite, il problema che risolve e la proposta di valore unica. Usa HTML formattato.

3. Business Model: Come l'azienda genera valore e ricavi, includendo flussi di ricavo basati sul modello di business specificato, segmenti di clientela e struttura dei costi. Usa HTML formattato.

4. Analisi di Mercato e Concorrenza: Analisi del mercato target nel settore specificato (dimensioni, trend), analisi competitiva considerando i concorrenti menzionati e vantaggi competitivi. Usa HTML formattato.

5. Il Team: Presentazione del team basata sulla dimensione indicata, ruoli chiave, competenze ed esperienze necessarie nel settore. Usa HTML formattato.

6. Roadmap e Go-to-Market: Piano di sviluppo con milestone principali allineate alla timeline specificata e strategia di lancio. Usa HTML formattato.

7. Piano Economico-Finanziario: Proiezioni finanziarie considerando il budget stimato, investimenti iniziali, costi operativi e break-even point realistici. Usa HTML formattato.

8. Proiezioni Ricavi: Proiezioni di fatturato e crescita allineate alla timeline e agli obiettivi specificati. Usa HTML formattato.

IMPORTANTE:
- Crea contenuti realistici, professionali e MOLTO dettagliati basati sulle informazioni fornite
- USA SOLO HTML per la formattazione (tag: <p>, <h3>, <ul>, <li>, <strong>, <em>)
- NON usare markdown (no ###, no **, no -)
- Non usare placeholder generici come [inserire qui] - crea contenuti completi e specifici
- Personalizza ogni sezione in base al settore, mercato target, fase aziendale e obiettivi forniti
- Se alcune informazioni non sono state fornite, crea contenuti ragionevoli e professionali basati sul contesto`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Sei un consulente esperto in business planning e strategia aziendale. Crei business plan professionali, dettagliati e realistici in italiano.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const response = completion.choices[0].message.content || ''

    // Parse the response to extract sections
    const sections = parseAIResponse(response)

    return {
      executiveSummary: sections.executiveSummary || '',
      idea: sections.idea || '',
      businessModel: sections.businessModel || '',
      marketAnalysis: sections.marketAnalysis || '',
      team: sections.team || '',
      roadmap: sections.roadmap || '',
      financialPlan: sections.financialPlan || '',
      revenueProjections: sections.revenueProjections || '',
      customSections: []
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

async function generateSectionSuggestion(
  section: string,
  currentContent: string,
  context?: any
): Promise<string> {
  const sectionDescriptions: Record<string, string> = {
    executiveSummary: 'Executive Summary - sintesi esecutiva del business plan',
    idea: "L'Idea - descrizione dell'idea imprenditoriale",
    businessModel: 'Business Model - modello di business e generazione ricavi',
    marketAnalysis: 'Analisi di Mercato - analisi del mercato e concorrenza',
    team: 'Il Team - presentazione del team e competenze',
    swotAnalysis: 'Analisi SWOT - punti di forza, debolezze, opportunità, minacce',
    roadmap: 'Roadmap - piano di sviluppo e go-to-market',
    financialPlan: 'Piano Finanziario - proiezioni finanziarie e budget',
    revenueProjections: 'Proiezioni Ricavi - previsioni di fatturato'
  }

  const sectionDesc = sectionDescriptions[section] || section

  const prompt = currentContent
    ? `Migliora e arricchisci il seguente contenuto per la sezione "${sectionDesc}" di un business plan:

${currentContent}

Fornisci suggerimenti concreti, dettagliati e professionali. Mantieni lo stile formale e usa formattazione markdown.`
    : `Genera un contenuto professionale e dettagliato per la sezione "${sectionDesc}" di un business plan.

Usa formattazione markdown e fornisci contenuti specifici e realistici.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Sei un consulente esperto in business planning. Fornisci suggerimenti professionali e dettagliati per migliorare le sezioni di business plan.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    return completion.choices[0].message.content || ''
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

function parseAIResponse(response: string): Record<string, string> {
  const sections: Record<string, string> = {}

  // Define section markers
  const sectionMarkers = [
    { key: 'executiveSummary', patterns: ['Executive Summary', '1. Executive Summary'] },
    { key: 'idea', patterns: ["L'Idea", "2. L'Idea", "L'idea"] },
    { key: 'businessModel', patterns: ['Business Model', '3. Business Model'] },
    { key: 'marketAnalysis', patterns: ['Analisi di Mercato', '4. Analisi di Mercato'] },
    { key: 'team', patterns: ['Il Team', '5. Il Team'] },
    { key: 'roadmap', patterns: ['Roadmap', '6. Roadmap'] },
    { key: 'financialPlan', patterns: ['Piano Economico-Finanziario', '7. Piano Economico-Finanziario', 'Piano Finanziario'] },
    { key: 'revenueProjections', patterns: ['Proiezioni Ricavi', '8. Proiezioni Ricavi'] }
  ]

  // Split response into sections
  let remainingText = response

  for (let i = 0; i < sectionMarkers.length; i++) {
    const currentMarker = sectionMarkers[i]
    const nextMarker = sectionMarkers[i + 1]

    // Find current section start
    let sectionStart = -1
    for (const pattern of currentMarker.patterns) {
      const index = remainingText.indexOf(pattern)
      if (index !== -1) {
        sectionStart = index
        break
      }
    }

    if (sectionStart === -1) continue

    // Find next section start or end of text
    let sectionEnd = remainingText.length
    if (nextMarker) {
      for (const pattern of nextMarker.patterns) {
        const index = remainingText.indexOf(pattern, sectionStart + 1)
        if (index !== -1) {
          sectionEnd = Math.min(sectionEnd, index)
        }
      }
    }

    // Extract section content
    let sectionContent = remainingText.substring(sectionStart, sectionEnd).trim()

    // Remove section header
    for (const pattern of currentMarker.patterns) {
      if (sectionContent.startsWith(pattern)) {
        sectionContent = sectionContent.substring(pattern.length).trim()
        // Remove leading colon or newlines
        sectionContent = sectionContent.replace(/^[:：\n\r]+/, '').trim()
        break
      }
    }

    sections[currentMarker.key] = sectionContent
  }

  return sections
}

function generateTemplatePlan(clientName: string): any {
  return {
    executiveSummary: `${clientName} è un'azienda innovativa che opera nel settore [specificare settore].

Il nostro obiettivo principale è [definire obiettivo principale] attraverso [strategia chiave].

Punti di forza:
- Proposta di valore unica e differenziante
- Team esperto e competente
- Modello di business scalabile
- Opportunità di mercato significativa

Proiezioni finanziarie: Si prevede di raggiungere il break-even entro [X] mesi e una crescita del fatturato del [Y]% nei primi tre anni.`,

    idea: `### Il Problema
Il mercato attuale presenta diverse criticità che richiedono una soluzione innovativa.

### La Soluzione
${clientName} offre una soluzione che risolve questi problemi attraverso un approccio innovativo e centrato sul cliente.

### Proposta di Valore
Ci differenziamo dalla concorrenza grazie a:
- Innovazione tecnologica
- Qualità del servizio
- Focus sull'esperienza utente

### Vision
Diventare il punto di riferimento nel settore, espandendoci a livello nazionale nei prossimi 5 anni.`,

    businessModel: `### Flussi di Ricavi
- Vendita diretta di prodotti/servizi
- Abbonamenti ricorrenti
- Servizi premium

### Segmenti di Clientela
Target principale: [definire target principale]
Target secondario: [definire target secondario]

### Canali di Distribuzione
- Vendita diretta online
- Partnership strategiche
- Canali di distribuzione tradizionali

### Struttura dei Costi
- Costi fissi: personale, affitto, infrastruttura
- Costi variabili: produzione, marketing, vendite`,

    marketAnalysis: `### Dimensione del Mercato
- TAM (Total Addressable Market): €[X] milioni
- SAM (Serviceable Addressable Market): €[Y] milioni
- SOM (Serviceable Obtainable Market): €[Z] milioni

### Trend di Mercato
Il mercato sta crescendo a un tasso annuo del [X]% grazie a:
- Digitalizzazione crescente
- Cambiamento delle abitudini dei consumatori
- Innovazione tecnologica

### Analisi Competitiva
**Concorrenti Diretti:**
- Concorrente A: [punti di forza e debolezza]
- Concorrente B: [punti di forza e debolezza]

**Vantaggi Competitivi:**
- Innovazione di prodotto
- Qualità superiore
- Servizio clienti eccellente

### Barriere all'Ingresso
- Know-how tecnico
- Investimenti iniziali
- Network e partnership`,

    team: `### Founder / CEO
**[Nome]** - Esperienza pluriennale nel settore, competenze in [area].

### Team Operativo
- **Responsabile Tecnico**: Esperienza in sviluppo e innovazione
- **Responsabile Commerciale**: Background in vendite e marketing
- **Responsabile Operativo**: Gestione processi e operations

### Advisory Board
Supporto strategico da parte di advisor con esperienza nel settore.

### Competenze Chiave
- Expertise tecnica
- Visione strategica
- Capacità di execution
- Network industriale`,

    roadmap: `### Milestone Principali

**Q1-Q2 ${new Date().getFullYear()}**
- Finalizzazione prodotto/servizio
- Lancio MVP (Minimum Viable Product)
- Prime acquisizioni clienti

**Q3-Q4 ${new Date().getFullYear()}**
- Ottimizzazione prodotto basata su feedback
- Espansione commerciale
- Raggiungimento break-even

**${new Date().getFullYear() + 1}**
- Consolidamento posizione di mercato
- Espansione geografica
- Ampliamento gamma prodotti/servizi

### Strategia Go-to-Market
- **Fase 1 (Mesi 1-3)**: Lancio soft con early adopters
- **Fase 2 (Mesi 4-6)**: Espansione graduale e acquisizione clienti
- **Fase 3 (Mesi 7-12)**: Scale-up commerciale e consolidamento`,

    financialPlan: `### Investimento Iniziale
- Setup iniziale: €[importo]
- Marketing e comunicazione: €[importo]
- Tecnologia e infrastruttura: €[importo]
- **Totale investimento**: €[totale]

### Costi Operativi Mensili
- Personale: €[importo]
- Marketing: €[importo]
- Infrastruttura e tecnologia: €[importo]
- Generale e amministrativo: €[importo]
- **Totale mensile**: €[totale]

### Break-even Point
Previsto entro 12-18 mesi dall'avvio operativo.

### ROI Previsto
ROI positivo a partire dal secondo anno di attività, con margini in crescita progressiva.`,

    revenueProjections: `### Proiezioni a 3 Anni

**Anno 1**
- Ricavi: €[importo]
- Clienti: [numero]
- Crescita mese su mese: [%]

**Anno 2**
- Ricavi: €[importo] (+[%] vs Anno 1)
- Clienti: [numero]
- Espansione di mercato

**Anno 3**
- Ricavi: €[importo] (+[%] vs Anno 2)
- Clienti: [numero]
- Consolidamento e ottimizzazione

### Assunzioni
Le proiezioni si basano su:
- Tasso di conversione medio del [X]%
- Customer acquisition cost di €[Y]
- Lifetime value stimato di €[Z]
- Tasso di retention del [W]%`,

    customSections: []
  }
}

export default router
