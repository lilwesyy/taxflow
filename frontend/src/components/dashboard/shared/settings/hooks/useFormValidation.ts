import { useState } from 'react'

export interface ValidationErrors {
  [key: string]: string
}

export interface PasswordStrength {
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
}

export function useFormValidation() {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  })

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation (Italian format)
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Optional field
    const phoneRegex = /^(\+39)?[ ]?[0-9]{9,10}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  // Italian Fiscal Code validation
  const validateFiscalCode = (cf: string): boolean => {
    if (!cf) return true // Optional field
    // Remove spaces and convert to uppercase before validation
    const cleaned = cf.toUpperCase().replace(/\s/g, '')
    const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
    return cfRegex.test(cleaned)
  }

  // Italian VAT number validation
  const validatePIVA = (piva: string): boolean => {
    if (!piva) return true // Optional field
    const pivaRegex = /^(IT)?[0-9]{11}$/
    return pivaRegex.test(piva.replace(/\s/g, ''))
  }

  // Italian postal code validation
  const validateCAP = (cap: string): boolean => {
    if (!cap) return true // Optional field
    const capRegex = /^[0-9]{5}$/
    return capRegex.test(cap)
  }

  // ATECO code validation
  const validateCodiceATECO = (codice: string): boolean => {
    if (!codice) return true // Optional field
    const atecoRegex = /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/
    return atecoRegex.test(codice)
  }

  // Password strength validation
  const validatePasswordStrength = (password: string) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    }
    setPasswordStrength(strength)
    return strength
  }

  // Check if password meets all requirements
  const isPasswordValid = (): boolean => {
    return passwordStrength.hasMinLength &&
      passwordStrength.hasUpperCase &&
      passwordStrength.hasLowerCase &&
      passwordStrength.hasNumber
  }

  // Clear validation errors
  const clearErrors = () => {
    setValidationErrors({})
  }

  // Clear a specific error
  const clearError = (field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  // Set multiple errors
  const setErrors = (errors: ValidationErrors) => {
    setValidationErrors(errors)
  }

  // Set a single error
  const setError = (field: string, message: string) => {
    setValidationErrors(prev => ({ ...prev, [field]: message }))
  }

  return {
    validationErrors,
    passwordStrength,
    validateEmail,
    validatePhone,
    validateFiscalCode,
    validatePIVA,
    validateCAP,
    validateCodiceATECO,
    validatePasswordStrength,
    isPasswordValid,
    clearErrors,
    clearError,
    setErrors,
    setError
  }
}
