'use client'

import { motion, animate } from 'framer-motion'
import { useEffect, useState } from 'react'

type RiskMeterProps = {
  riskScore: number
}

export default function RiskMeter({ riskScore }: RiskMeterProps) {
  // Ensure riskScore is a valid number between 0 and 100
  const safeRiskScore = Math.max(0, Math.min(100, typeof riskScore === 'number' ? riskScore : (parseFloat(riskScore as any) || 50)))
  
  const radius = 90
  const circumference = 2 * Math.PI * radius

  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const controls = animate(0, safeRiskScore, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: v => setDisplayScore(Math.round(v))
    })
    return () => controls.stop()
  }, [safeRiskScore])

  const progress = (safeRiskScore / 100) * circumference

  const riskLabel =
    safeRiskScore < 40 ? 'Low Risk' : safeRiskScore < 75 ? 'Moderate Risk' : 'High Risk'

  const gradientId = `risk-gradient-${safeRiskScore}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-card border border-border p-6 flex flex-col items-center gap-6"
    >
      <h3 className="text-lg font-semibold text-foreground">
        Risk Assessment
      </h3>

      {/* ---------------- CIRCULAR METER ---------------- */}
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 220 220" className="w-full h-full">
          {/* Background ring */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="10"
          />

          {/* Progress ring */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${progress} ${circumference}` }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />

          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {safeRiskScore < 40 && (
                <>
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </>
              )}
              {safeRiskScore >= 40 && safeRiskScore < 75 && (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </>
              )}
              {safeRiskScore >= 75 && (
                <>
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={displayScore}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-foreground"
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      {/* ---------------- LABEL ---------------- */}
      <motion.div
        animate={
          safeRiskScore >= 75
            ? { scale: [1, 1.05, 1] }
            : undefined
        }
        transition={
          safeRiskScore >= 75
            ? { repeat: Infinity, duration: 1.8 }
            : undefined
        }
        className={`px-4 py-2 rounded-full text-sm font-semibold text-white
          ${
            safeRiskScore < 40
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : safeRiskScore < 75
              ? 'bg-gradient-to-r from-amber-500 to-orange-600'
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}
      >
        {riskLabel}
      </motion.div>
    </motion.div>
  )
}
