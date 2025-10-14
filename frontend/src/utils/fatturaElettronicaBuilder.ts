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
  importo: number
  aliquotaIVA?: number  // 0 per forfettari
  ritenuta?: number
  tipoCassa?: string
  importoContributoCassa?: number
}

/**
 * Crea una fattura elettronica in formato FatturaOrdinaria per Invoicetronic
 */
export function buildFatturaOrdinaria(data: InvoiceFormData): any {
  const { cliente, fornitore, numero, data: dataFattura, descrizione, importo, aliquotaIVA = 0 } = data

  // Determina se è P.IVA o privato
  const isAzienda = !!cliente.partitaIva

  return {
    fattura_elettronica_header: {
      dati_trasmissione: {
        id_trasmittente: {
          id_paese: 'IT',
          id_codice: fornitore.codiceFiscale
        },
        progressivo_invio: numero.replace(/[^0-9]/g, ''),
        formato_trasmissione: 'FPR12',  // FPR12 per regime forfettario
        codice_destinatario: cliente.codiceDestinatario || '0000000',
        pec_destinatario: cliente.pec || null
      },
      cedente_prestatore: {
        dati_anagrafici: {
          id_fiscale_iva: {
            id_paese: 'IT',
            id_codice: fornitore.partitaIva.replace(/^IT/i, '')
          },
          codice_fiscale: fornitore.codiceFiscale,
          anagrafica: {
            denominazione: fornitore.denominazione
          },
          regime_fiscale: fornitore.regimeFiscale  // RF19 per forfettario
        },
        sede: {
          indirizzo: fornitore.indirizzo,
          numero_civico: fornitore.numeroCivico || '',
          cap: fornitore.cap,
          comune: fornitore.comune,
          provincia: fornitore.provincia,
          nazione: fornitore.nazione || 'IT'
        }
      },
      cessionario_committente: {
        dati_anagrafici: {
          ...(isAzienda ? {
            id_fiscale_iva: {
              id_paese: 'IT',
              id_codice: cliente.partitaIva.replace(/^IT/i, '')
            }
          } : {}),
          codice_fiscale: cliente.codiceFiscale || null,
          anagrafica: cliente.denominazione ? {
            denominazione: cliente.denominazione
          } : {
            nome: cliente.nome,
            cognome: cliente.cognome
          }
        },
        sede: {
          indirizzo: cliente.indirizzo,
          numero_civico: cliente.numeroCivico || '',
          cap: cliente.cap,
          comune: cliente.comune,
          provincia: cliente.provincia,
          nazione: cliente.nazione || 'IT'
        }
      }
    },
    fattura_elettronica_body: [
      {
        dati_generali: {
          dati_generali_documento: {
            tipo_documento: 'TD01',  // Fattura
            divisa: 'EUR',
            data: dataFattura,
            numero: numero,
            importo_totale_documento: importo
          }
        },
        dati_beni_servizi: {
          dettaglio_linee: [
            {
              numero_linea: 1,
              descrizione: descrizione,
              quantita: 1,
              prezzo_unitario: importo,
              prezzo_totale: importo,
              aliquota_iva: aliquotaIVA
            }
          ],
          dati_riepilogo: [
            {
              aliquota_iva: aliquotaIVA,
              natura: aliquotaIVA === 0 ? 'N2.2' : null,  // N2.2 = Regime forfettario
              imponibile_importo: importo,
              imposta: 0,
              riferimento_normativo: aliquotaIVA === 0
                ? 'Operazione effettuata ai sensi dell\'art. 1, commi da 54 a 89, della Legge n. 190/2014 e s.m.i. - Regime forfettario'
                : null
            }
          ]
        },
        dati_pagamento: [
          {
            condizioni_pagamento: 'TP02',  // Pagamento completo
            dettaglio_pagamento: [
              {
                modalita_pagamento: 'MP05',  // Bonifico
                importo_pagamento: importo
              }
            ]
          }
        ]
      }
    ]
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

  if (data.importo <= 0) {
    errors.push('Importo deve essere maggiore di zero')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
