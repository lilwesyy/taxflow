import { z } from 'zod'

// Secure password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password deve essere di almeno 8 caratteri')
  .max(128, 'Password troppo lunga')
  .regex(/[A-Z]/, 'Password deve contenere almeno una lettera maiuscola')
  .regex(/[a-z]/, 'Password deve contenere almeno una lettera minuscola')
  .regex(/[0-9]/, 'Password deve contenere almeno un numero')

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password obbligatoria'), // For login, we don't validate complexity
})

export type LoginInput = z.infer<typeof loginSchema>

// Register validation
export const registerSchema = z.object({
  email: z.string().email('Email non valida'),
  password: passwordSchema,
  name: z.string().min(1, 'Nome obbligatorio').max(100, 'Nome troppo lungo'),
  role: z.enum(['business', 'admin']).optional().default('business'),
})

export type RegisterInput = z.infer<typeof registerSchema>

// 2FA verification
export const verify2FASchema = z.object({
  userId: z.string().min(1, 'User ID obbligatorio'),
  token: z.string().length(6, 'Token 2FA deve essere di 6 cifre').regex(/^\d+$/, 'Token deve contenere solo numeri'),
})

export type Verify2FAInput = z.infer<typeof verify2FASchema>
