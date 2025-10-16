import mongoose from 'mongoose'

export interface IFatturaElettronica extends mongoose.Document {
  // Riferimenti
  userId: mongoose.Types.ObjectId
  aziendaId: string // ID azienda su Fattura Elettronica API

  // ID dalla API Fattura Elettronica
  fatturaApiId: string

  // Dati mittente
  pivaMittente: string
  ragioneSocialeMittente: string

  // Dati destinatario
  destinatario: {
    codiceSDI: string
    partitaIva?: string
    codiceFiscale?: string
    denominazione: string
    indirizzo: string
    cap: string
    comune: string
    provincia: string
    nazione: string
    pec?: string
  }

  // Dati documento
  documento: {
    numero: string
    data: string
    tipo?: string
  }

  // Righe fattura
  righe: Array<{
    descrizione: string
    prezzoUnitario: number
    quantita: number
    unitaMisura: string
    aliquotaIVA: number
  }>

  // Totali
  importoTotale: number
  importoIVA: number
  importoTotaleConIVA: number

  // Dati pagamento
  pagamento?: {
    modalitaPagamento: string
    iban?: string
    dataScadenza?: string
  }

  // Status della fattura
  status: 'inviata' | 'accettata' | 'rifiutata' | 'in_attesa' | 'presa_in_carico' | 'consegnata' | 'non_consegnata' | 'errore'

  // Dati aggiuntivi dall'API
  identificativoSdI?: string // Identificativo SDI quando disponibile
  sdiStato?: string // Stato tecnico SDI (INVI, PREN, CONS, NONC, ERRO, ACCE, RIFI, DECO)
  sdiStatoDescrizione?: string // Descrizione dello stato
  ultimaVerificaStatus?: Date // Ultima volta che abbiamo verificato lo status
  dataInvio: Date

  // Payload originale (per reference)
  payloadOriginale?: any

  // Timestamp
  createdAt: Date
  updatedAt: Date
}

const FatturaElettronicaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  aziendaId: {
    type: String,
    required: true,
    index: true
  },
  fatturaApiId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  pivaMittente: {
    type: String,
    required: true
  },
  ragioneSocialeMittente: {
    type: String,
    required: true
  },
  destinatario: {
    codiceSDI: { type: String, required: true },
    partitaIva: { type: String },
    codiceFiscale: { type: String },
    denominazione: { type: String, required: true },
    indirizzo: { type: String, required: true },
    cap: { type: String, required: true },
    comune: { type: String, required: true },
    provincia: { type: String, required: true },
    nazione: { type: String, required: true },
    pec: { type: String }
  },
  documento: {
    numero: { type: String, required: true },
    data: { type: String, required: true },
    tipo: { type: String }
  },
  righe: [{
    descrizione: { type: String, required: true },
    prezzoUnitario: { type: Number, required: true },
    quantita: { type: Number, required: true },
    unitaMisura: { type: String, required: true },
    aliquotaIVA: { type: Number, required: true }
  }],
  importoTotale: {
    type: Number,
    required: true
  },
  importoIVA: {
    type: Number,
    required: true
  },
  importoTotaleConIVA: {
    type: Number,
    required: true
  },
  pagamento: {
    modalitaPagamento: { type: String },
    iban: { type: String },
    dataScadenza: { type: String }
  },
  status: {
    type: String,
    enum: ['inviata', 'accettata', 'rifiutata', 'in_attesa', 'presa_in_carico', 'consegnata', 'non_consegnata', 'errore'],
    default: 'inviata'
  },
  identificativoSdI: {
    type: String
  },
  sdiStato: {
    type: String
  },
  sdiStatoDescrizione: {
    type: String
  },
  ultimaVerificaStatus: {
    type: Date
  },
  dataInvio: {
    type: Date,
    default: Date.now
  },
  payloadOriginale: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true })

// Index composti per query comuni
FatturaElettronicaSchema.index({ userId: 1, dataInvio: -1 })
FatturaElettronicaSchema.index({ userId: 1, status: 1 })
FatturaElettronicaSchema.index({ 'documento.numero': 1 })

const FatturaElettronica = mongoose.model<IFatturaElettronica>('FatturaElettronica', FatturaElettronicaSchema)
export default FatturaElettronica
