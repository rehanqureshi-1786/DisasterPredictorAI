'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

import CitySearch from '@/components/prediction/city-search'
import PredictionResults from '@/components/prediction/prediction-results'
import WeatherChart from '@/components/weather/weather-chart'
import RiskMeter from '@/components/weather/risk-meter'

export default function PredictPage() {
  const { user } = useAuth()

  // Restore missing state variables
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<any>(null)
  const [error, setError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  // No longer need manual apiUrl resolution here

  // --------------------------------------------------
  // Handle Prediction (NO TIMEOUT)
  // --------------------------------------------------
  const handlePredict = async (query: string) => {
    if (!query.trim()) {
      setError('Please enter a city name or postal code')
      return
    }

    setLoading(true)
    setError('')
    setPredictions(null)

    try {
      const response = await fetch(`/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: query.trim(),
          email: user?.email
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        let message = `Server error: ${response.status}`
        try {
          const data = await response.json()
          message = data.error || message
        } catch { }
        throw new Error(message)
      }

      const data = await response.json()
      // Ensure risk_score is present and valid
      if (data.risk_score === undefined || data.risk_score === null) {
        console.warn('⚠️ risk_score missing from API response, using default 50')
        data.risk_score = 50
      }
      console.log('📊 Prediction data received:', data)
      setPredictions(data)
      setSelectedLocation(query)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Network error: Unable to reach backend'

      setError(message)
      setPredictions(null)
      console.error('Prediction fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // Animations
  // --------------------------------------------------
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <motion.div
      className="p-4 sm:p-6 space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ---------------- HEADER ---------------- */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Disaster Prediction
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Enter any city name or postal code to get AI-powered predictions.
        </p>
      </motion.div>

      {/* ---------------- SEARCH ---------------- */}
      <motion.div variants={itemVariants}>
        <CitySearch onPredict={handlePredict} loading={loading} />
      </motion.div>

      {/* ---------------- ERROR ---------------- */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* ---------------- LOADER ---------------- */}
      {loading && (
        <motion.div
          className="flex items-center justify-center py-12"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader className="w-6 h-6 text-primary animate-spin mr-3" />
          <span className="text-foreground">
            Resolving location, fetching weather & analyzing risk…
          </span>
        </motion.div>
      )}

      {/* ---------------- RESULTS ---------------- */}
      {predictions && (
        <motion.div
          className="space-y-4 sm:space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <PredictionResults data={predictions} />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={containerVariants}
          >
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <WeatherChart data={predictions} city={predictions.city} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <RiskMeter riskScore={typeof predictions.risk_score === 'number' ? predictions.risk_score : (parseFloat(predictions.risk_score) || 50)} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* ---------------- EMPTY STATE ---------------- */}
      {!loading && !predictions && !error && (
        <motion.div
          className="flex flex-col items-center justify-center py-12"
          variants={itemVariants}
        >
          <motion.div
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Search className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-muted-foreground text-center">
            Search for a city or postal code to begin predictions
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
