import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressResult {
  formatted: string
  address_line1?: string
  address_line2?: string
  city?: string
  postcode?: string
  country?: string
  housenumber?: string
  street?: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (address: { full: string; city: string; postcode: string }) => void
  placeholder?: string
  error?: string
  className?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Inizia a digitare l'indirizzo...",
  error,
  className = ''
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const GEOAPIFY_API_KEY = 'e747705240b54b55b0e6fa293f9f744b'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      // Geoapify Autocomplete API
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?` +
        `text=${encodeURIComponent(query)}&` +
        `filter=countrycode:it&` +
        `format=json&` +
        `limit=10&` +
        `lang=it&` +
        `apiKey=${GEOAPIFY_API_KEY}`
      )

      if (response.ok) {
        const data = await response.json()

        if (data.results && data.results.length > 0) {
          setResults(data.results)
          setIsOpen(true)
          setSelectedIndex(-1)
        } else {
          setResults([])
          setIsOpen(false)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Debounce search
    debounceTimer.current = setTimeout(() => {
      searchAddresses(newValue)
    }, 300)
  }

  const handleSelectAddress = (result: AddressResult) => {
    // Build full address from components
    let fullAddress = ''
    if (result.street) {
      fullAddress = result.street
      if (result.housenumber) {
        fullAddress += ` ${result.housenumber}`
      }
    } else if (result.address_line1) {
      fullAddress = result.address_line1
    } else {
      fullAddress = result.formatted.split(',')[0]
    }

    const city = result.city || ''
    const postcode = result.postcode || ''

    onChange(fullAddress)
    setIsOpen(false)
    setResults([])

    // Notify parent component
    if (onAddressSelect) {
      onAddressSelect({
        full: fullAddress,
        city,
        postcode
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectAddress(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const formatDisplayName = (result: AddressResult): string => {
    return result.formatted || result.address_line1 || ''
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelectAddress(result)
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formatDisplayName(result)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && results.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">Nessun indirizzo trovato</p>
        </div>
      )}
    </div>
  )
}
