import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { atecoCodes as atecoData } from '../../data/ateco-codes'

interface ATECOCode {
  code: string
  description: string
}

interface ATECOAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  className?: string
}

export default function ATECOAutocomplete({
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'Cerca codice ATECO...',
  className = ''
}: ATECOAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredCodes, setFilteredCodes] = useState<ATECOCode[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const atecoCodes = atecoData as unknown as ATECOCode[]

  useEffect(() => {
    // Find description for current value
    if (value && !searchTerm) {
      const found = atecoCodes.find(item => item.code === value)
      if (found) {
        setSearchTerm(`${found.code} - ${found.description}`)
      }
    }
  }, [value])

  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredCodes([])
      return
    }

    const search = searchTerm.toLowerCase()
    const filtered = atecoCodes.filter(item =>
      item.code.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    ).slice(0, 50) // Limit to 50 results

    setFilteredCodes(filtered)
    setSelectedIndex(0)
  }, [searchTerm])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: ATECOCode) => {
    onChange(item.code)
    setSearchTerm(`${item.code} - ${item.description}`)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setFilteredCodes([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < filteredCodes.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCodes[selectedIndex]) {
          handleSelect(filteredCodes[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
            if (!e.target.value) {
              onChange('')
            }
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filteredCodes.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCodes.map((item, index) => (
            <div
              key={item.code}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-sm">{item.code}</div>
              <div className="text-xs text-gray-600 truncate">{item.description}</div>
            </div>
          ))}
        </div>
      )}

      {isOpen && searchTerm.length >= 2 && filteredCodes.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
          Nessun codice ATECO trovato
        </div>
      )}
    </div>
  )
}
