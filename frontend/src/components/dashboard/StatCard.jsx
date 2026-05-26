import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'blue', loading }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  }
  const c = colors[color] || colors.blue
  const isPositive = change >= 0

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-24 mb-4" />
        <div className="h-8 bg-gray-100 rounded w-16 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    )
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center`}>
          <Icon size={26} className={c.icon} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-base font-medium text-gray-500">{title}</div>
      {changeLabel && <div className="text-sm text-gray-400 mt-1">{changeLabel}</div>}
    </div>
  )
}
