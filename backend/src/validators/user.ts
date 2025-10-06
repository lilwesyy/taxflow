import { z } from 'zod'

// Italian fiscal code validation regex
const FISCAL_CODE_REGEX = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/
const CODICE_ATECO_REGEX = /^\d{2}\.\d{2}\.\d{2}$/
const CAP_REGEX = /^\d{5}$/

// P.IVA Request Data validation
export const pivaRequestDataSchema = z.object({
  // Dati Anagrafici
  firstName: z.string().min(1, 'Nome obbligatorio').max(50),
  lastName: z.string().min(1, 'Cognome obbligatorio').max(50),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data nascita formato non valido (YYYY-MM-DD)'),
  placeOfBirth: z.string().min(1, 'Luogo di nascita obbligatorio').max(100),
  fiscalCode: z.string().regex(FISCAL_CODE_REGEX, 'Codice fiscale non valido'),
  residenceAddress: z.string().min(1, 'Indirizzo residenza obbligatorio').max(200),
  residenceCity: z.string().min(1, 'Città residenza obbligatoria').max(100),
  residenceCAP: z.string().regex(CAP_REGEX, 'CAP non valido'),
  residenceProvince: z.string().length(2, 'Provincia deve essere sigla di 2 lettere').toUpperCase(),

  // Dati Attività
  businessActivity: z.string().min(1, 'Attività obbligatoria').max(500),
  codiceAteco: z.string().regex(CODICE_ATECO_REGEX, 'Codice ATECO non valido (formato: XX.XX.XX)'),
  businessName: z.string().max(200).optional(),
  businessAddress: z.string().max(200).optional(),
  businessCity: z.string().max(100).optional(),
  businessCAP: z.string().regex(CAP_REGEX, 'CAP attività non valido').optional(),
  businessProvince: z.string().length(2, 'Provincia deve essere sigla di 2 lettere').toUpperCase().optional(),

  // Regime Fiscale
  expectedRevenue: z.number()
    .min(0, 'Fatturato previsto deve essere positivo')
    .max(85000, 'Fatturato previsto supera limite regime forfettario (€85.000)'),
  hasOtherIncome: z.boolean(),
  otherIncomeDetails: z.string().max(1000).optional(),

  // Documenti
  hasIdentityDocument: z.boolean(),
  hasFiscalCode: z.boolean(),

  // Note aggiuntive
  additionalNotes: z.string().max(2000).optional(),

  submittedAt: z.date().or(z.string().transform(str => new Date(str))),
})

export type PivaRequestData = z.infer<typeof pivaRequestDataSchema>

// Update user profile validation
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio').max(100).optional(),
  phone: z.string().max(20).optional(),
  professionalRole: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  cap: z.string().regex(CAP_REGEX, 'CAP non valido').optional(),
  fiscalCode: z.string().regex(FISCAL_CODE_REGEX, 'Codice fiscale non valido').optional(),

  // Business fields
  company: z.string().max(200).optional(),
  piva: z.string().regex(/^\d{11}$/, 'Partita IVA deve essere di 11 cifre').optional(),
  codiceAteco: z.string().regex(CODICE_ATECO_REGEX, 'Codice ATECO non valido').optional(),
  settoreAttivita: z.string().max(200).optional(),
  regimeContabile: z.enum(['Forfettario', 'Ordinario', 'Semplificato']).optional(),
  aliquotaIva: z.string().max(10).optional(),

  // Password change
  currentPassword: z.string().min(6).max(128).optional(),
  newPassword: z.string().min(6).max(128).optional(),

  // Notification settings
  notificationSettings: z.object({
    emailNewClient: z.boolean(),
    emailNewRequest: z.boolean(),
    emailPayment: z.boolean(),
    pushNotifications: z.boolean(),
    weeklyReport: z.boolean(),
  }).optional(),

  // P.IVA related
  pivaFormSubmitted: z.boolean().optional(),
  pivaApprovalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  pivaRequestData: pivaRequestDataSchema.optional(),
}).refine(
  (data) => {
    // If newPassword is provided, currentPassword must also be provided
    if (data.newPassword && !data.currentPassword) {
      return false
    }
    return true
  },
  {
    message: 'Per cambiare la password devi fornire la password corrente',
    path: ['currentPassword'],
  }
)

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Approval action validation
export const approvalSchema = z.object({
  approved: z.boolean(),
  note: z.string().max(500).optional(),
})

export type ApprovalInput = z.infer<typeof approvalSchema>
