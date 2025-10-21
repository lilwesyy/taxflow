import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { ChartConfig } from '../../../../types/businessPlan'

interface BusinessPlanChartProps {
  config: ChartConfig
}

const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#ef4444', // red
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316'  // orange
]

export default function BusinessPlanChart({ config }: BusinessPlanChartProps) {
  const {
    type,
    title,
    data,
    xKey,
    yKey,
    colors = COLORS,
    height = 300,
    showLegend = true,
    showGrid = true
  } = config

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {Array.isArray(yKey) ? (
                yKey.map((key, idx) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={yKey}
                  stroke={colors[0]}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {Array.isArray(yKey) ? (
                yKey.map((key, idx) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[idx % colors.length]}
                  />
                ))
              ) : (
                <Bar dataKey={yKey} fill={colors[0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {Array.isArray(yKey) ? (
                yKey.map((key, idx) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.6}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey={yKey || 'value'}
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={yKey as string}
                nameKey={xKey || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="text-gray-500">Chart type not supported</div>
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      )}
      {renderChart()}
    </div>
  )
}
