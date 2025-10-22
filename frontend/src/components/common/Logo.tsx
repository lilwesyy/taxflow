import React from 'react'
import logoSvg from '../../assets/logo.svg'

interface LogoProps {
  className?: string
  inverted?: boolean
}

const Logo: React.FC<LogoProps> = ({
  className = "h-10 w-auto",
  inverted = false
}) => {
  return (
    <img
      src={logoSvg}
      alt="TaxFlow Logo"
      className={`${className} ${inverted ? 'brightness-0 invert' : ''}`}
    />
  )
}

export default Logo