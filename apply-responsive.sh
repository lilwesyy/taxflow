#!/bin/bash

FILE="/home/mirco/Documents/projects/taxflow/frontend/src/components/LandingPage.tsx"

# Header section - Logo responsive
sed -i 's|<Logo className="h-12" />|<Logo className="h-10 sm:h-12" />|g' "$FILE"

# Header section - Menu icon responsive
sed -i 's|<Menu className="h-6 w-6" />|<Menu className="h-5 w-5 sm:h-6 sm:w-6" />|g' "$FILE"

# Header section - Nav spacing responsive
sed -i 's|<nav className="hidden md:flex space-x-8">|<nav className="hidden md:flex space-x-4 lg:space-x-8">|g' "$FILE"

# Header section - Nav text size responsive
sed -i 's|className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"|className="text-sm lg:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"|g' "$FILE"

# Header section - Auth buttons spacing
sed -i 's|<div className="hidden md:flex items-center space-x-4">|<div className="hidden md:flex items-center space-x-2 lg:space-x-4">|g' "$FILE"

# Header section - Login button responsive
sed -i 's|<button\n                onClick={onShowLogin}\n                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"|<button\n                onClick={onShowLogin}\n                className="text-sm lg:text-base text-gray-600 hover:text-blue-600 font-medium transition-colors px-2 lg:px-0"|g' "$FILE"

# Header section - Register button responsive
sed -i 's|className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:shadow-lg"|className="text-sm lg:text-base bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium hover:shadow-lg"|g' "$FILE"

# Header padding
sed -i 's|mx-auto px-4 sm:px-6 lg:px-8 py-4|mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4|g' "$FILE"

# Hero section - Main container padding responsive
sed -i 's|relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32|relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 xl:py-32|g' "$FILE"

# Hero section - Title responsive
sed -i 's|text-3xl md:text-4xl lg:text-5xl|text-3xl sm:text-4xl lg:text-5xl xl:text-6xl|g' "$FILE"

# Hero section - Subtitle responsive
sed -i 's|text-2xl md:text-3xl lg:text-4xl|text-xl sm:text-2xl lg:text-3xl xl:text-4xl|g' "$FILE"

# Hero section - Description responsive
sed -i 's|text-lg text-gray-600|text-base sm:text-lg text-gray-600|g' "$FILE"

# Badge responsive
sed -i 's|inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6|inline-flex items-center bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6|g' "$FILE"

# Badge icon responsive
sed -i 's|<BadgeIcon className="h-4 w-4 mr-2 flex-shrink-0" />|<BadgeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />|g' "$FILE"

# Feature cards responsive
sed -i 's|flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100|flex items-center bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-100|g' "$FILE"

# Feature CheckCircle icon responsive
sed -i 's|<CheckCircle className="h-3 w-3 text-green-500 mr-2" />|<CheckCircle className="h-3 w-3 text-green-500 mr-1 sm:mr-2" />|g' "$FILE"

# Feature text responsive
sed -i 's|<span className="text-sm font-medium text-gray-700">|<span className="text-xs sm:text-sm font-medium text-gray-700">|g' "$FILE"

# Carousel navigation buttons responsive
sed -i 's|<ChevronLeft className="h-4 w-4 text-gray-600" />|<ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />|g' "$FILE"
sed -i 's|<ChevronRight className="h-4 w-4 text-gray-600" />|<ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />|g' "$FILE"

# CTA buttons responsive in hero
sed -i 's|flex flex-col sm:flex-row gap-4|flex flex-col sm:flex-row gap-3 sm:gap-4|g' "$FILE"
sed -i 's|group bg-blue-600 text-white px-6 py-3 rounded-lg|group bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg|g' "$FILE"
sed -i 's|group border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg|group border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg|g' "$FILE"

# Social proof avatars responsive
sed -i 's|w-8 h-8 rounded-full|w-6 h-6 sm:w-8 sm:h-8 rounded-full|g' "$FILE"
sed -i 's|<User className="h-4 w-4|<User className="h-3 w-3 sm:h-4 sm:w-4|g' "$FILE"

# Floating cards responsive (hero image)
sed -i 's|absolute -top-6 -right-12 bg-white rounded-lg shadow-lg p-4|absolute -top-4 -right-4 sm:-top-6 sm:-right-12 bg-white rounded-lg shadow-lg p-2 sm:p-4|g' "$FILE"
sed -i 's|absolute -bottom-6 -left-12 bg-white rounded-lg shadow-lg p-4|absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-12 bg-white rounded-lg shadow-lg p-2 sm:p-4|g' "$FILE"
sed -i 's|<TopIcon className={\`h-6 w-6 \${topColorClass} mr-2\`} />|<TopIcon className={`h-4 w-4 sm:h-6 sm:w-6 ${topColorClass} mr-1 sm:mr-2`} />|g' "$FILE"
sed -i 's|<BottomIcon className={\`h-6 w-6 \${bottomColorClass} mr-2\`} />|<BottomIcon className={`h-4 w-4 sm:h-6 sm:w-6 ${bottomColorClass} mr-1 sm:mr-2`} />|g' "$FILE"
sed -i 's|text-sm font-semibold text-gray-900|text-xs sm:text-sm font-semibold text-gray-900|g' "$FILE"
sed -i 's|text-xs text-gray-500|text-[10px] sm:text-xs text-gray-500|g' "$FILE"

echo "Responsive styles applied successfully!"
