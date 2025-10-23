import {
  TrendingUp,
  Building,
  Target,
  Brain,
  Banknote,
  GraduationCap,
  Shield,
  FileCheck,
  BarChart3,
  Clock,
  Users,
  Zap,
  Award
} from 'lucide-react'

export const services = [
  {
    icon: TrendingUp,
    title: "Business Plan Predittivo VisionFlow",
    description: "Sistema di pianificazione strategica con analisi predittiva conforme al D.Lgs. 14/2019 per anticipare le dinamiche di mercato e garantire la crescita sostenibile.",
    price: "da €998",
    features: ["Executive Summary + Obiettivo", "Analisi di mercato", "Time Series Forecasting", "Simulazione budget + Alert"],
    learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
    learnMoreText: "Leggi il D.Lgs. 14/2019 - Codice della Crisi",
    isPrimary: true
  },
  {
    icon: Building,
    title: "P.IVA Forfettari",
    description: "Apertura e gestione partita IVA forfettaria. Dashboard integrata con il tuo cassetto fiscale e previdenziale (INPS-INAIL) gratis.",
    price: "€129,90",
    originalPrice: "€169,90",
    discount: "Offerta lancio fino al 31/12/2025",
    features: [
      "Setup creditizio",
      "Regime forfettario",
      "Rating optimization",
      "Adempimenti fiscali"
    ],
    paymentOptions: [
      "Abbonamento annuale €368,90 (pagamento unico)",
      "Oppure €35/mese (pagamento mensile automatico)"
    ],
    learnMoreUrl: "https://www.agenziaentrate.gov.it/portale/web/guest/schede/dichiarazioni/dichiarazione-di-inizio-attivita-iva/infogen-dichiarazione-inizio-attivita",
    learnMoreText: "Guida Agenzia Entrate P.IVA forfettaria",
    isPrimary: true
  },
  {
    icon: Target,
    title: "Analisi SWOT Evolutio",
    description: "Matrice strategica avanzata per valutare punti di forza, debolezze, opportunità e minacce. Minimizza i rischi e definisci strategie vincenti sul lungo periodo.",
    price: "da €998",
    features: ["Matrice 4 quadranti dinamica", "Analisi Strengths/Weaknesses", "Opportunità e Minacce", "Sintesi strategica + Azioni"],
    learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html",
    learnMoreText: "Sistema ICAS Banca d'Italia",
    isPrimary: true
  },
  {
    icon: Brain,
    title: "Consulenza Proattiva e Strategica",
    description: "Supporto continuo con metodologia proattiva per anticipare sfide fiscali, ottimizzare la gestione aziendale e migliorare le performance.",
    price: "€170/ora",
    features: ["Monitoraggio continuo", "Ottimizzazione fiscale", "Supporto strategico", "Consulenza dedicata"],
    learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/",
    learnMoreText: "Sistema gestione garanzie Banca d'Italia",
    isPrimary: false
  },
  {
    icon: Banknote,
    title: "Assistenza Accesso al Credito Bancario",
    description: "Supporto completo per l'accesso al credito bancario con garanzia MCC L.662/96 e calcolo scoring creditizio secondo metodologia Banca d'Italia.",
    price: "da €998",
    features: ["Consulenza finanziamento ottimale", "Business plan con scoring", "Garanzia MCC L.662/96", "Conformità Banca d'Italia"],
    learnMoreUrl: "https://www.fondidigaranzia.it/",
    learnMoreText: "Info Fondo di Garanzia PMI",
    isPrimary: false
  },
  {
    icon: GraduationCap,
    title: "Corsi Sicurezza Synetich",
    description: "Formazione professionale certificata sulla sicurezza sul lavoro. 19 corsi disponibili per attrezzature, sicurezza, management e specializzazioni.",
    price: "da €150",
    features: ["19 corsi certificati", "Docenti qualificati", "Sedi Torino e Aosta", "Conformi alle normative"],
    learnMoreUrl: "#synetich",
    learnMoreText: "Scopri tutti i corsi",
    isPrimary: false
  }
]

export const benefits = [
  {
    icon: Shield,
    title: "Metodologia Banca d'Italia",
    description: "Utilizziamo gli stessi criteri ICAS per valutare e migliorare il tuo profilo creditizio",
    learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/qualita-crediti/index.html",
    learnMoreText: "Sistema ICAS Banca d'Italia"
  },
  {
    icon: TrendingUp,
    title: "Basel IV Compliant",
    description: "Sistema allineato agli accordi di Basilea per massima credibilità bancaria",
    learnMoreUrl: "https://www.bis.org/basel_framework/",
    learnMoreText: "Framework Basilea III"
  },
  {
    icon: FileCheck,
    title: "D.Lgs. 14/2019",
    description: "Piena conformità al Codice della Crisi d'Impresa con monitoraggio predittivo",
    learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
    learnMoreText: "Codice della Crisi d'Impresa"
  },
  {
    icon: BarChart3,
    title: "Centrale Rischi Integration",
    description: "Monitoraggio e ottimizzazione della tua posizione nella Centrale Rischi",
    learnMoreUrl: "https://www.bancaditalia.it/statistiche/raccolta-dati/segnalazioni/centrale-rischi/index.html",
    learnMoreText: "Info Centrale Rischi"
  },
  {
    icon: Clock,
    title: "Early Warning System",
    description: "Sistema di allerta precoce per prevenire crisi e garantire continuità",
    learnMoreUrl: "https://www.gazzettaufficiale.it/eli/id/2019/02/14/19G00007/sg",
    learnMoreText: "Normativa Early Warning"
  },
  {
    icon: Banknote,
    title: "Costo del Credito Ridotto",
    description: "Migliora il tuo rating per ottenere condizioni di finanziamento più vantaggiose",
    learnMoreUrl: "https://www.bancaditalia.it/compiti/polmon-garanzie/gestione-garanzie/",
    learnMoreText: "Gestione Garanzie e Rating"
  }
]

export const processSteps = [
  {
    step: "1",
    title: "Registrati",
    description: "Crea il tuo account e inserisci i dati della tua attività",
    icon: Users
  },
  {
    step: "2",
    title: "Configurazione",
    description: "Il nostro team configura tutto per la tua partita IVA",
    icon: Zap
  },
  {
    step: "3",
    title: "Operativo",
    description: "Inizia subito a fatturare e gestire la tua contabilità",
    icon: Target
  }
]

export const founderInfo = {
  name: "Teresa Marrari",
  role: "Founder & CEO",
  bio: "Commercialista con studio a Torino da oltre 25 anni. Dal 1998 si distingue nella consulenza fiscale, tributaria e societaria, con un focus particolare sulla formazione dell'imprenditore.",
  mission: "Con TaxFlow, Teresa ha creato uno strumento innovativo per supportare i giovani imprenditori, rendendo semplice la gestione fiscale e fornendo le basi per costruire attività solide.",
  stats: [
    { value: "25+", label: "Anni esperienza" },
    { value: "250+", label: "Imprenditori" },
    { value: "100%", label: "Conforme" }
  ]
}

export const companyValues = [
  { icon: Shield, title: 'Conformità', desc: 'D.Lgs. 14/2019 e standard Banca d\'Italia' },
  { icon: Users, title: 'Orientamento cliente', desc: 'Supporto personalizzato dedicato' },
  { icon: Brain, title: 'Innovazione', desc: 'AI e analytics avanzati' },
  { icon: Award, title: 'Eccellenza', desc: 'Team qualificato ed esperto' }
]

export const faqs = [
  {
    question: "Quali adempimenti sono compresi nell'abbonamento?",
    answer: "È compreso il modello Unico completo di ogni reddito e tutti i servizi ed adempimenti fiscali ordinari relativi alla tua Partita IVA."
  },
  {
    question: "Se non mi trovo bene, posso ricevere il rimborso?",
    answer: "Sì! Se non ti trovi bene con il nostro abbonamento, hai fino a 30 giorni per richiedere un rimborso completo, senza bisogno di spiegazioni. La tua soddisfazione viene prima di tutto."
  },
  {
    question: "Come posso contattare il mio consulente?",
    answer: "Puoi contattare il tuo commercialista aprendo una consulenza in app oppure via telefono, video-call e chat. Tramite la piattaforma avrai il collegamento diretto alla sua agenda e potrei fissare con lui appuntamenti ogni qual volta lo reputi necessario."
  },
  {
    question: "Le consulenze sono illimitate?",
    answer: "Si, la consulenza relativa alla gestione ordinaria della tua Partita IVA e a tutti i redditi da dichiarare nel modello unico sono compresi."
  },
  {
    question: "Cosa non è compreso nel mio abbonamento?",
    answer: "L'abbonamento comprende tutti gli adempimenti previsti nella gestione ordinaria della tua attività. Non sono compresi: Tutto ciò che puoi trovare tra i servizi extra del tuo piano; le spese vive, diritti e bolli di segreteria per le pratiche presso i vari enti; per le aziende senza dipendenti, autoliquidazione INAIL annuale, chiusura della posizione INAIL, variazioni della posizione INAIL (cambio socio lavoratore, cambio sede, variazione attività), e denunce di infortuni INAIL; Business Plan; Valutazioni d'azienda (Swot Evolutio); Tutte le operazioni straordinarie (fusioni, scissioni, ricorsi, cessioni, partecipazioni, liquidazione); Comunicazione dati al sistema tessera sanitaria per le professioni sanitarie; Calcolo IMU per immobili non intestati alla società, al libero professionista o ditta individuale che ha acquistato il servizio; Fiscalità internazionale; Visto di conformità; Rateizzazione ed analisi avvisi bonari."
  },
  {
    question: "Quanti codici ATECO gestisce Taxflow?",
    answer: "Taxflow gestisce fino a 3 codici ATECO per ciascun cliente, che è il massimo consentito per una Partita IVA. Siamo in grado di assisterti anche se i codici appartengono a settori con casse previdenziali differenti, offrendo una gestione completa e personalizzata per ogni esigenza fiscale."
  }
]
