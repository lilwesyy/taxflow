import { TrendingUp } from 'lucide-react'
import React from 'react'

export interface StatItem {
  title: string
  value: string
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: 'up' | 'down' | 'neutral'
}

interface StatsCardProps {
  stat: StatItem
}

export default function StatsCard({ stat }: StatsCardProps) {
  const getTrendColor = () => {
    if (!stat.change) return ''
    if (stat.trend === 'up' || stat.change.includes('+')) return 'text-green-600'
    if (stat.trend === 'down' || stat.change.includes('-')) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="group bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow relative z-10">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
          {stat.change && (
            <p className={`text-xs sm:text-sm flex items-center mt-1 ${getTrendColor()}`}>
              <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
              {stat.change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform flex-shrink-0">
          <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
        </div>
      </div>
    </div>
  )
}

interface StatsGridProps {
  stats: StatItem[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <StatsCard key={index} stat={stat} />
      ))}
    </div>
  )
}