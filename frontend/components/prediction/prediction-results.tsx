'use client'

import { motion } from 'framer-motion'
import {
  Cloud,
  Droplets,
  Wind,
  Gauge,
  AlertTriangle,
  Zap,
  Thermometer
} from 'lucide-react'

type PredictionData = {
  temperature: number
  humidity: number
  rainfall: number
  wind_speed: number
  pressure: number
  prediction: string
  risk_score: number
  city: string
  district?: string
  state?: string
}

type PredictionResultsProps = {
  data: PredictionData
}

export default function PredictionResults({ data }: PredictionResultsProps) {
  /* ---------------- RISK LOGIC ---------------- */
  // Ensure risk_score is a valid number
  const riskScore = typeof data.risk_score === 'number' ? data.risk_score : (parseFloat(data.risk_score as any) || 50)
  const safeRiskScore = Math.max(0, Math.min(100, riskScore))
  
  const riskLevel =
    safeRiskScore >= 75
      ? 'High Risk'
      : safeRiskScore >= 40
      ? 'Moderate Risk'
      : 'Low Risk'

  const riskColor =
    safeRiskScore >= 75
      ? 'text-destructive'
      : safeRiskScore >= 40
      ? 'text-amber-500'
      : 'text-green-500'

  const riskBg =
    safeRiskScore >= 75
      ? 'bg-destructive/10'
      : safeRiskScore >= 40
      ? 'bg-amber-500/10'
      : 'bg-green-500/10'

  /* ---------------- WEATHER DATA ---------------- */
  const weatherParams = [
    { label: 'Temperature', value: `${data.temperature}°C`, icon: Thermometer },
    { label: 'Humidity', value: `${data.humidity}%`, icon: Droplets },
    { label: 'Rainfall', value: `${data.rainfall} mm`, icon: Zap },
    { label: 'Wind Speed', value: `${data.wind_speed} km/h`, icon: Wind },
    { label: 'Pressure', value: `${data.pressure} hPa`, icon: Gauge }
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-2xl sm:rounded-3xl bg-card border border-border p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 md:space-y-10 shadow-md"
    >
      {/* ---------------- LOCATION HEADER ---------------- */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {data.city}
        </h1>

        {(data.district || data.state) && (
          <p className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground">
            {data.district && data.district}
            {data.district && data.state && ', '}
            {data.state && data.state}
          </p>
        )}

        <p className="text-xs sm:text-sm text-muted-foreground">
          AI-powered disaster risk assessment
        </p>
      </div>

      {/* ---------------- PREDICTION RESULT ---------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 sm:gap-3"
      >
        <Cloud className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">
          {data.prediction}
        </p>
      </motion.div>

      {/* ---------------- WEATHER GRID ---------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {weatherParams.map((param, idx) => {
          const Icon = param.icon
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 260 }}
              className="rounded-xl sm:rounded-2xl bg-secondary/30 border border-border p-3 sm:p-4 md:p-5 text-center hover:bg-secondary/40 transition"
            >
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              </div>

              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                {param.label}
              </p>
              <p className="mt-1 text-sm sm:text-base md:text-lg font-semibold text-foreground">
                {param.value}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* ---------------- RISK SCORE ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl border border-border p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${riskBg}`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <AlertTriangle className={`w-6 h-6 sm:w-7 sm:h-7 ${riskColor}`} />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Risk Assessment
            </p>
            <p className={`text-lg sm:text-xl font-semibold ${riskColor}`}>
              {riskLevel}
            </p>
          </div>
        </div>

        <div className={`text-3xl sm:text-4xl font-bold ${riskColor} self-end sm:self-auto`}>
          {Math.round(safeRiskScore)}
          <span className="text-xs sm:text-sm text-muted-foreground"> / 100</span>
        </div>
      </motion.div>
    </motion.section>
  )
}
