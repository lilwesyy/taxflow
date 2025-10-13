/**
 * FatturaPA XML Generator
 * Generates XML files compliant with Italian SDI (Sistema di Interscambio) specifications
 */

interface ClientData {
  denominazione: string
  codiceFiscale: string
  partitaIva?: string
  indirizzo: string
  cap: string
  comune: string
  provincia: string
  email?: string
  pec?: string
  codiceDestinatario?: string
}

interface InvoiceLineItem {
  descrizione: string
  quantita: number
  prezzoUnitario: number
  aliquotaIVA: number // 0 for regime forfettario
}

interface InvoiceData {
  numero: string
  data: string // YYYY-MM-DD
  cliente: ClientData
  lineItems: InvoiceLineItem[]
  totale: number
  note?: string
}

interface CedenteData {
  denominazione: string
  partitaIva: string
  codiceFiscale: string
  indirizzo: string
  cap: string
  comune: string
  provincia: string
  nazione: string
  regimeFiscale: string // 'RF01' for regime forfettario
}

/**
 * Generate FatturaPA XML for electronic invoicing
 * @param invoiceData Invoice data
 * @param cedenteData Seller (TaxFlow client) data
 * @returns XML string
 */
export function generateFatturaPAXML(invoiceData: InvoiceData, cedenteData: CedenteData): string {
  const progressivoInvio = generateProgressivoInvio(invoiceData.numero, invoiceData.data)
  const codiceDestinatario = invoiceData.cliente.codiceDestinatario || '0000000'
  const pecDestinatario = invoiceData.cliente.pec || ''

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ns2:FatturaElettronica versione="FPR12" xmlns:ns2="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>01879020517</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${progressivoInvio}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${codiceDestinatario}</CodiceDestinatario>
      ${pecDestinatario ? `<PECDestinatario>${escapeXml(pecDestinatario)}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${cedenteData.partitaIva}</IdCodice>
        </IdFiscaleIVA>
        <CodiceFiscale>${cedenteData.codiceFiscale}</CodiceFiscale>
        <Anagrafica>
          <Denominazione>${escapeXml(cedenteData.denominazione)}</Denominazione>
        </Anagrafica>
        <RegimeFiscale>${cedenteData.regimeFiscale}</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${escapeXml(cedenteData.indirizzo)}</Indirizzo>
        <CAP>${cedenteData.cap}</CAP>
        <Comune>${escapeXml(cedenteData.comune)}</Comune>
        <Provincia>${cedenteData.provincia}</Provincia>
        <Nazione>${cedenteData.nazione}</Nazione>
      </Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${invoiceData.cliente.partitaIva ? `
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${invoiceData.cliente.partitaIva}</IdCodice>
        </IdFiscaleIVA>` : ''}
        <CodiceFiscale>${invoiceData.cliente.codiceFiscale}</CodiceFiscale>
        <Anagrafica>
          <Denominazione>${escapeXml(invoiceData.cliente.denominazione)}</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${escapeXml(invoiceData.cliente.indirizzo)}</Indirizzo>
        <CAP>${invoiceData.cliente.cap}</CAP>
        <Comune>${escapeXml(invoiceData.cliente.comune)}</Comune>
        <Provincia>${invoiceData.cliente.provincia}</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${invoiceData.data}</Data>
        <Numero>${escapeXml(invoiceData.numero)}</Numero>
        <ImportoTotaleDocumento>${invoiceData.totale.toFixed(2)}</ImportoTotaleDocumento>
        ${invoiceData.note ? `<Causale>${escapeXml(invoiceData.note)}</Causale>` : ''}
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${invoiceData.lineItems.map((item, index) => `      <DettaglioLinee>
        <NumeroLinea>${index + 1}</NumeroLinea>
        <Descrizione>${escapeXml(item.descrizione)}</Descrizione>
        <Quantita>${item.quantita.toFixed(2)}</Quantita>
        <PrezzoUnitario>${item.prezzoUnitario.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${(item.quantita * item.prezzoUnitario).toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>${item.aliquotaIVA.toFixed(2)}</AliquotaIVA>
        ${item.aliquotaIVA === 0 ? '<Natura>N2.2</Natura>' : ''}
      </DettaglioLinee>`).join('\n')}
      <DatiRiepilogo>
        <AliquotaIVA>${invoiceData.lineItems[0]?.aliquotaIVA.toFixed(2) || '0.00'}</AliquotaIVA>
        ${invoiceData.lineItems[0]?.aliquotaIVA === 0 ? '<Natura>N2.2</Natura>' : ''}
        <ImponibileImporto>${invoiceData.totale.toFixed(2)}</ImponibileImporto>
        <Imposta>0.00</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>MP05</ModalitaPagamento>
        <ImportoPagamento>${invoiceData.totale.toFixed(2)}</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</ns2:FatturaElettronica>`

  return xml
}

/**
 * Generate progressive transmission number
 * Format: YYYYMMDD-NNNN where NNNN is the invoice number padded to 4 digits
 */
function generateProgressivoInvio(invoiceNumber: string, invoiceDate: string): string {
  const date = invoiceDate.replace(/-/g, '')
  // Extract numeric part from invoice number (e.g., "2024-001" -> "001")
  const numericPart = invoiceNumber.replace(/\D/g, '').padStart(4, '0').slice(-4)
  return `${date}-${numericPart}`
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Validate invoice data before generating XML
 */
export function validateInvoiceData(invoiceData: InvoiceData, cedenteData: CedenteData): string[] {
  const errors: string[] = []

  // Validate cedente data
  if (!cedenteData.denominazione) errors.push('Denominazione cedente is required')
  if (!cedenteData.partitaIva) errors.push('Partita IVA cedente is required')
  if (!cedenteData.codiceFiscale) errors.push('Codice Fiscale cedente is required')
  if (!cedenteData.indirizzo) errors.push('Indirizzo cedente is required')
  if (!cedenteData.cap || !/^\d{5}$/.test(cedenteData.cap)) errors.push('CAP cedente must be 5 digits')
  if (!cedenteData.comune) errors.push('Comune cedente is required')
  if (!cedenteData.provincia || !/^[A-Z]{2}$/.test(cedenteData.provincia)) errors.push('Provincia cedente must be 2 uppercase letters')

  // Validate cliente data
  if (!invoiceData.cliente.denominazione) errors.push('Denominazione cliente is required')
  if (!invoiceData.cliente.codiceFiscale) errors.push('Codice Fiscale cliente is required')
  if (!invoiceData.cliente.indirizzo) errors.push('Indirizzo cliente is required')
  if (!invoiceData.cliente.cap || !/^\d{5}$/.test(invoiceData.cliente.cap)) errors.push('CAP cliente must be 5 digits')
  if (!invoiceData.cliente.comune) errors.push('Comune cliente is required')
  if (!invoiceData.cliente.provincia || !/^[A-Z]{2}$/.test(invoiceData.cliente.provincia)) errors.push('Provincia cliente must be 2 uppercase letters')

  // Validate codice destinatario or PEC
  if (!invoiceData.cliente.codiceDestinatario && !invoiceData.cliente.pec) {
    errors.push('Either Codice Destinatario or PEC is required')
  }
  if (invoiceData.cliente.codiceDestinatario && !/^[A-Z0-9]{7}$/.test(invoiceData.cliente.codiceDestinatario)) {
    errors.push('Codice Destinatario must be 7 alphanumeric characters')
  }

  // Validate invoice data
  if (!invoiceData.numero) errors.push('Invoice number is required')
  if (!invoiceData.data || !/^\d{4}-\d{2}-\d{2}$/.test(invoiceData.data)) errors.push('Invoice date must be in YYYY-MM-DD format')
  if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) errors.push('At least one line item is required')
  if (!invoiceData.totale || invoiceData.totale <= 0) errors.push('Invoice total must be greater than 0')

  // Validate line items
  invoiceData.lineItems.forEach((item, index) => {
    if (!item.descrizione) errors.push(`Line item ${index + 1}: Description is required`)
    if (!item.quantita || item.quantita <= 0) errors.push(`Line item ${index + 1}: Quantity must be greater than 0`)
    if (!item.prezzoUnitario || item.prezzoUnitario <= 0) errors.push(`Line item ${index + 1}: Unit price must be greater than 0`)
    if (item.aliquotaIVA === undefined) errors.push(`Line item ${index + 1}: IVA rate is required`)
  })

  return errors
}
