import { z } from 'zod'

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password minimo 6 caratteri').max(128, 'Password troppo lunga'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Register validation
export const registerSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string()
    .min(6, 'Password minimo 6 caratteri')
    .max(128, 'Password troppo lunga'),
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
