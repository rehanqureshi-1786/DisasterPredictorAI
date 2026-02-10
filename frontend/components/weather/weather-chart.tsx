'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/theme-context'
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts'
import { Thermometer, Droplets, TrendingUp } from 'lucide-react'

type WeatherChartProps = {
  data?: any
  city?: string
  apiUrl?: string
}

type HourlyData = {
  time: string
  temperature: number
  humidity: number
  pressure: number
  wind_speed: number
  rainfall: number
  type: 'past' | 'future'
}

// Modern glassmorphism tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  const point = payload[0].payload as {
    temp: number
    humidity: number
    pressure?: number
    wind_speed?: number
    rainfall?: number
    type?: 'past' | 'future'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-white/20 bg-white/90 dark:bg-black/80 backdrop-blur-xl px-4 py-3 text-sm shadow-2xl"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-semibold text-foreground">{label}</span>
        {point.type && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${point.type === 'past'
              ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-gradient-to-r from-sky-500/20 to-indigo-600/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
              }`}
          >
            {point.type === 'past' ? 'Past' : 'Forecast'}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-muted-foreground">Temperature</span>
          </div>
          <span className="font-bold text-foreground">{point.temp}°C</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-muted-foreground">Humidity</span>
          </div>
          <span className="font-bold text-foreground">{point.humidity}%</span>
        </div>
        {point.pressure !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Pressure</span>
            <span className="font-semibold text-foreground">{point.pressure} hPa</span>
          </div>
        )}
        {point.wind_speed !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Wind</span>
            <span className="font-semibold text-foreground">{point.wind_speed} m/s</span>
          </div>
        )}
        {point.rainfall !== undefined && point.rainfall > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Rainfall</span>
            <span className="font-semibold text-foreground">{point.rainfall} mm</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function WeatherChart({ data, city, apiUrl: propApiUrl }: WeatherChartProps) {
  const { theme } = useTheme()
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const currentHour = new Date().getHours()
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:00`

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Theme-aware colors
  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.5)'
  const axisTextColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
  const referenceLineColor = isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.8)'

  useEffect(() => {
    if (!city) return

    const fetchTrends = async () => {
      setLoading(true)
      setError('')

      try {
        // Use empty string for relative path to leverage Next.js proxy
        const baseUrl = ''
        const url = `/weather-trends`


        console.log('🔹 Fetching weather trends from:', url, 'for city:', city)

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ city }),
          cache: 'no-store',
        })

        console.log('🔹 Response status:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Server error: ${response.status}`)
        }

        const result = await response.json()
        console.log('✅ Weather trends API response:', result)

        if (result.hourly && result.hourly.length > 0) {
          // Backend now returns only real hourly data (up to 24 points, no fabrication)
          const chartData = result.hourly
            .filter((h: any) => h.temperature != null && h.humidity != null)
            .map((h: any) => ({
              time: h.time,
              temp: Math.round(h.temperature * 10) / 10,
              humidity: Math.round(h.humidity),
              pressure: h.pressure,
              wind_speed: h.wind_speed,
              rainfall: h.rainfall,
              type: h.type,
            }))

          // Sort by time string (HH:MM) to ensure correct order on the X-axis
          chartData.sort((a: any, b: any) => (a.time > b.time ? 1 : a.time < b.time ? -1 : 0))

          console.log(`✅ Displaying ${chartData.length} hours of weather data`)
          setTrendsData(chartData)
        } else {
          console.warn('⚠️ No hourly data in response')
          setError('No hourly data available')
        }
      } catch (err) {
        console.error('❌ Weather trends fetch error:', err)
        if (err instanceof Error) {
          console.error('❌ Error details:', err.message, err.stack)
        }
        const errorMessage = err instanceof Error ? err.message : 'Failed to load weather trends'
        setError(errorMessage)
        setTrendsData([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [city])

  // If no data, show empty state
  if (loading) {
    return (
      <motion.div
        className="glass-card-dark p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">24-Hour Weather Trends</h3>
        </div>
        <div className="flex items-center justify-center h-[350px]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading weather trends...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error || trendsData.length === 0) {
    return (
      <motion.div
        className="glass-card-dark p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">24-Hour Weather Trends</h3>
        </div>
        <div className="flex items-center justify-center h-[350px]">
          <p className="text-muted-foreground">
            {error || 'No weather trends data available'}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass-card-dark p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">24-Hour Weather Trends</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Temperature & Humidity</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: isMobile ? '300px' : '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trendsData}
            margin={{
              top: 10,
              right: isMobile ? 10 : 30,
              left: isMobile ? -5 : 10,
              bottom: isMobile ? 30 : 20,
            }}
          >
            <defs>
              {/* Temperature gradient */}
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              {/* Humidity gradient */}
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />

            <XAxis
              dataKey="time"
              stroke={axisColor}
              tick={{
                fill: axisTextColor,
                fontSize: isMobile ? 10 : 11,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
              tickLine={{ stroke: axisColor }}
              interval={isMobile ? 3 : 2}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 50 : 40}
            />

            <YAxis
              yAxisId="temp"
              stroke={axisColor}
              tick={{
                fill: axisTextColor,
                fontSize: isMobile ? 10 : 11,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
              tickLine={{ stroke: axisColor }}
              width={isMobile ? 45 : 65}
              label={
                !isMobile
                  ? {
                    value: 'Temperature (°C)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: axisTextColor,
                    style: {
                      fontSize: '11px',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                    },
                  }
                  : undefined
              }
            />

            <YAxis
              yAxisId="humidity"
              orientation="right"
              stroke={axisColor}
              tick={{
                fill: axisTextColor,
                fontSize: isMobile ? 10 : 11,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
              tickLine={{ stroke: axisColor }}
              width={isMobile ? 45 : 65}
              label={
                !isMobile
                  ? {
                    value: 'Humidity (%)',
                    angle: 90,
                    position: 'insideRight',
                    fill: axisTextColor,
                    style: {
                      fontSize: '11px',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                    },
                  }
                  : undefined
              }
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Reference line for current time */}
            {trendsData.some((d) => d.time === currentTimeStr) && (
              <ReferenceLine
                x={currentTimeStr}
                stroke={referenceLineColor}
                strokeWidth={2}
                strokeDasharray="8 4"
                label={{
                  value: 'Now',
                  position: 'top',
                  fill: referenceLineColor,
                  fontSize: 10,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                }}
              />
            )}

            {/* Temperature Area */}
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="none"
              fill="url(#tempGradient)"
              isAnimationActive={true}
              animationDuration={1000}
            />

            {/* Temperature Line */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="#3b82f6"
              strokeWidth={isMobile ? 2.5 : 3}
              dot={false}
              activeDot={{
                r: isMobile ? 5 : 6,
                fill: '#3b82f6',
                stroke: '#fff',
                strokeWidth: 2,
              }}
              name="Temperature (°C)"
              isAnimationActive={true}
              animationDuration={1000}
            />

            {/* Humidity Area */}
            <Area
              yAxisId="humidity"
              type="monotone"
              dataKey="humidity"
              stroke="none"
              fill="url(#humidityGradient)"
              isAnimationActive={true}
              animationDuration={1200}
            />

            {/* Humidity Line */}
            <Line
              yAxisId="humidity"
              type="monotone"
              dataKey="humidity"
              stroke="#10b981"
              strokeWidth={isMobile ? 2.5 : 3}
              dot={false}
              activeDot={{
                r: isMobile ? 5 : 6,
                fill: '#10b981',
                stroke: '#fff',
                strokeWidth: 2,
              }}
              name="Humidity (%)"
              isAnimationActive={true}
              animationDuration={1200}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm"></div>
          <span className="font-medium text-foreground">Temperature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm"></div>
          <span className="font-medium text-foreground">Humidity</span>
        </div>
        {trendsData.some((d) => d.type === 'past') && trendsData.some((d) => d.type === 'future') && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500/50 to-emerald-600/50 rounded"></div>
              <span className="text-muted-foreground font-medium">Past</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-sky-500/50 to-indigo-600/50 rounded"></div>
              <span className="text-muted-foreground font-medium">Forecast</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
