'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Cloud, Droplets, AlertTriangle, Wind, Loader } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useWeather } from '@/contexts/weather-context'
import OverviewCard from '@/components/dashboard/overview-card'
import RecentPredictions from '@/components/dashboard/recent-predictions'
import WeatherChart from '@/components/weather/weather-chart'

export default function Dashboard() {
  const { user } = useAuth()
  const { weatherData, city, setWeatherData, setCity, fetchWeather } = useWeather()
  const [loading, setLoading] = useState(!weatherData) // Only load if we don't have data
  const [error, setError] = useState('')

  // Manual Input State
  const [manualInput, setManualInput] = useState(false)
  const [manualCity, setManualCity] = useState('')

  // Main load logic
  useEffect(() => {
    if (!weatherData) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [weatherData])

  // 2. Main Data Fetcher
  const fetchData = async (overrideCity?: string) => {
    setLoading(true)
    setError('')
    setManualInput(false)

    try {
      let payload: any = { email: user?.email }

      if (overrideCity) {
        payload.city = overrideCity
      } else {
        // Auto-Location Logic
        try {
          if (!navigator.geolocation) throw new Error('Geolocation not supported')

          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
          })

          payload.lat = position.coords.latitude
          payload.lon = position.coords.longitude
          console.log('📍 Using Browser GPS:', payload.lat, payload.lon)

        } catch (geoErr) {
          console.warn('GPS failed, using IP fallback:', geoErr)
          try {
            const ipRes = await fetch('https://ipapi.co/json/')
            const ipData = await ipRes.json()
            if (!ipData.city) throw new Error('IP lookup failed')
            payload.city = ipData.city
            console.log('🌍 Using IP Location:', payload.city)
          } catch (ipErr) {
            throw new Error('Could not detect location. Please enter manually.')
          }
        }
      }

      // Fetch prediction from backend (Backend now handles reverse-geocoding)
      const response = await fetch(`/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Prediction failed')
      }

      const data = await response.json()
      setWeatherData(data)
      setCity(data.city)
      setLoading(false)

    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message)
      setLoading(false)
      // If auto-detection fails, show manual input
      if (!overrideCity) setManualInput(true)
    }
  }



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Cloud className="w-12 h-12 text-primary" />
        </motion.div>
        <p className="mt-4 text-muted-foreground animate-pulse">
          {city ? 'Loading weather data...' : 'Detecting location...'}
        </p>
        <button
          onClick={() => { setLoading(false); setManualInput(true); }}
          className="mt-6 text-xs text-primary underline hover:text-primary/80"
        >
          Taking too long? Enter location manually
        </button>
      </div>
    )
  }

  // Manual Input Mode (shown on error or if user opts in)
  if (manualInput || error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="p-4 rounded-full bg-primary/10">
          <Cloud className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Weather Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            {error ? 'Could not auto-detect location.' : 'Enter your city to see the forecast.'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCity.trim()) fetchData(manualCity);
          }}
          className="flex items-center gap-2 w-full max-w-sm"
        >
          <input
            type="text"
            placeholder="Enter city name (e.g. Mumbai)"
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!manualCity.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            Load
          </button>
        </form>
      </div>
    )
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-4 md:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {user?.fullName && (
              <p className="text-sm font-semibold text-primary/80 mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Welcome, {user.fullName.split(' ')[0]}
              </p>
            )}
            <h1 className="text-3xl font-bold text-foreground">{city || 'Dashboard'}</h1>
          </div>
          {weatherData && (
            <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              Risk Score: {weatherData.risk_score}/100
            </div>
          )}
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <OverviewCard
            title="Temperature"
            value={`${weatherData?.temperature || '--'}°C`}
            icon={Cloud}
            trend="Live Data"
            color="from-blue-500 to-cyan-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <OverviewCard
            title="Humidity"
            value={`${weatherData?.humidity || '--'}%`}
            icon={Droplets}
            trend="Live Data"
            color="from-cyan-500 to-blue-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <OverviewCard
            title="Prediction"
            value={weatherData?.prediction || 'Unknown'}
            icon={AlertTriangle}
            trend={`Risk: ${weatherData?.risk_score || 0}`}
            color={
              weatherData?.risk_score > 70 ? "from-red-500 to-orange-500" :
                weatherData?.risk_score > 40 ? "from-orange-500 to-amber-500" :
                  "from-emerald-500 to-green-500"
            }
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <OverviewCard
            title="Wind Speed"
            value={`${weatherData?.wind_speed || '--'} m/s`}
            icon={Wind}
            trend="Live Data"
            color="from-purple-500 to-pink-500"
          />
        </motion.div>
      </motion.div>

      {/* Charts and Predictions */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={containerVariants}>
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          {/* Pass city and dynamic API URL to WeatherChart */}
          <WeatherChart city={city} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RecentPredictions />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
