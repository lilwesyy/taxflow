/**
 * Builder per creare fatture elettroniche in formato Invoicetronic (FatturaOrdinaria)
 * Basato sullo schema OpenAPI di Invoicetronic API v1
 */

export interface InvoiceFormData {
  // Cliente
  cliente: {
    denominazione?: string
    nome?: string
    cognome?: string
    partitaIva: string
    codiceFiscale?: string
    indirizzo: string
    numeroCivico?: string
    cap: string
    comune: string
    provincia: string
    nazione?: string
    codiceDestinatario?: string
    pec?: string
  }

  // Fornitore (recuperato dall'azienda configurata)
  fornitore: {
    denominazione: string
    partitaIva: string
    codiceFiscale: string
    indirizzo: string
    numeroCivico?: string
    cap: string
    comune: string
    provincia: string
    nazione?: string
    regimeFiscale: string
  }

  // Fattura
  numero: string
  data: string  // YYYY-MM-DD
  descrizione: string
  prezzoUnitario: number
  quantita: number
  unitaMisura: string
  aliquotaIVA?: number  // 0 per forfettari
  metodoPagamento?: string
  iban?: string
  dataScadenza?: string
  ritenuta?: number
  tipoCassa?: string
  importoContributoCassa?: number
}

/**
 * Crea una fattura elettronica in formato Fattura Elettronica API
 * Formato semplificato JSON per l'API: https://www.fattura-elettronica-api.it/documentazione2.0/
 */
export function buildFatturaOrdinaria(data: InvoiceFormData): any {
  const {
    cliente,
    fornitore,
    numero,
    data: dataFattura,
    descrizione,
    prezzoUnitario,
    quantita,
    unitaMisura,
    aliquotaIVA = 0,
    metodoPagamento = 'MP05',
    iban,
    dataScadenza
  } = data

  // Formato Fattura Elettronica API
  return {
    // P.IVA mittente - specifica quale azienda (tra quelle configurate) emette la fattura
    // IMPORTANTE: Mantenere il prefisso IT per identificare correttamente l'azienda
    piva_mittente: fornitore.partitaIva.startsWith('IT') ? fornitore.partitaIva : `IT${fornitore.partitaIva}`,

    // Dati destinatario (cliente)
    destinatario: {
      CodiceSDI: cliente.codiceDestinatario || '0000000',
      PartitaIVA: cliente.partitaIva ? cliente.partitaIva.replace(/^IT/i, '') : '',
      CodiceFiscale: cliente.codiceFiscale || '',
      Denominazione: cliente.denominazione || (cliente.nome && cliente.cognome ? `${cliente.nome} ${cliente.cognome}` : ''),
      Indirizzo: `${cliente.indirizzo}${cliente.numeroCivico ? ', ' + cliente.numeroCivico : ''}`,
      CAP: cliente.cap,
      Comune: cliente.comune,
      Provincia: cliente.provincia,
      Nazione: cliente.nazione || 'IT',
      ...(cliente.pec ? { PEC: cliente.pec } : {})
    },

    // Dati documento
    documento: {
      Data: dataFattura,
      Numero: numero
    },

    // Righe fattura
    righe: [
      {
        Descrizione: descrizione,
        PrezzoUnitario: prezzoUnitario.toFixed(2),
        Quantita: quantita,
        UnitaMisura: unitaMisura,
        AliquotaIVA: aliquotaIVA
      }
    ],

    // Dati pagamento (opzionali)
    ...(metodoPagamento || iban || dataScadenza ? {
      pagamento: {
        ...(metodoPagamento ? { ModalitaPagamento: metodoPagamento } : {}),
        ...(iban ? { IBAN: iban } : {}),
        ...(dataScadenza ? { DataScadenza: dataScadenza } : {})
      }
    } : {})
  }
}

/**
 * Valida i dati della fattura prima dell'invio
 */
export function validateInvoiceData(data: InvoiceFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validazioni cliente
  if (!data.cliente.partitaIva && !data.cliente.codiceFiscale) {
    errors.push('Il cliente deve avere almeno P.IVA o Codice Fiscale')
  }

  if (!data.cliente.denominazione && (!data.cliente.nome || !data.cliente.cognome)) {
    errors.push('Specificare Denominazione oppure Nome e Cognome del cliente')
  }

  if (!data.cliente.indirizzo || !data.cliente.cap || !data.cliente.comune || !data.cliente.provincia) {
    errors.push('Indirizzo completo del cliente richiesto')
  }

  // Validazioni fornitore
  if (!data.fornitore.partitaIva || !data.fornitore.codiceFiscale) {
    errors.push('Dati fiscali del fornitore incompleti')
  }

  // Validazioni fattura
  if (!data.numero || !data.data) {
    errors.push('Numero e data fattura sono obbligatori')
  }

  if (!data.descrizione) {
    errors.push('Descrizione servizio/prodotto richiesta')
  }

  if (data.prezzoUnitario <= 0) {
    errors.push('Prezzo unitario deve essere maggiore di zero')
  }

  if (data.quantita <= 0) {
    errors.push('Quantità deve essere maggiore di zero')
  }

  if (!data.unitaMisura) {
    errors.push('Unità di misura richiesta')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
