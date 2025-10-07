/**
 * Subscription Plans Configuration
 * These should match the plans created in Stripe Dashboard
 */

export interface SubscriptionPlan {
  id: string
  stripePriceId: string
  name: string
  price: number
  originalPrice?: number
  discount?: string
  type: 'annual' | 'monthly'
  interval: 'year' | 'month'
  features: string[]
  description?: string
}

// TODO: Replace with actual Stripe Price IDs from your Stripe Dashboard
// Create these products in Stripe Dashboard first, then update these IDs
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'piva-forfettari-annual',
    stripePriceId: process.env.STRIPE_PRICE_ANNUAL || 'price_1SFXReFtDiNzmnLqTmkvc331',
    name: 'P.IVA Forfettari - Annuale',
    price: 368.90,
    originalPrice: 169.90,
    discount: 'Risparmia €51 rispetto al piano mensile',
    type: 'annual',
    interval: 'year',
    features: [
      'Setup creditizio',
      'Regime forfettario',
      'Rating optimization',
      'Adempimenti fiscali',
      'Dashboard integrata cassetto fiscale e previdenziale',
      'Supporto prioritario'
    ],
    description: 'Apertura e gestione partita IVA forfettaria con dashboard integrata INPS-INAIL'
  },
  {
    id: 'piva-forfettari-monthly',
    stripePriceId: process.env.STRIPE_PRICE_MONTHLY || 'price_1SFXSAFtDiNzmnLq30etHrBg',
    name: 'P.IVA Forfettari - Mensile',
    price: 35.00,
    type: 'monthly',
    interval: 'month',
    features: [
      'Setup creditizio',
      'Regime forfettario',
      'Rating optimization',
      'Adempimenti fiscali',
      'Dashboard integrata cassetto fiscale e previdenziale',
      'Supporto standard'
    ],
    description: 'Apertura e gestione partita IVA forfettaria con pagamento mensile automatico'
  }
]

export const SETUP_FEE = {
  price: 129.90,
  originalPrice: 169.90,
  stripePriceId: process.env.STRIPE_PRICE_SETUP || 'price_1SFXR4FtDiNzmnLqXalglNR6',
  description: 'Costo unico per apertura P.IVA (Offerta lancio fino al 31/12/2025)'
}

// Helper function to get plan by ID
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

// Helper function to get plan by Stripe Price ID
export function getPlanByStripePriceId(stripePriceId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === stripePriceId)
}
