'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader } from 'lucide-react'

type CitySearchProps = {
  onPredict: (city: string) => void
  loading: boolean
}

export default function CitySearch({ onPredict, loading }: CitySearchProps) {
  const [city, setCity] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPredict(city.trim())
  }

  const suggestedCities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']

  return (
    <motion.div
      className="glass-card-dark p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name or postal code..."
            className="w-full pl-12 pr-4 py-3 rounded-lg
            text-foreground placeholder-muted-foreground
            bg-white/10 dark:bg-white/5
            border border-white/30 dark:border-white/10
            backdrop-blur-xl shadow-[0_12px_35px_rgba(15,23,42,0.35)]
            focus:outline-none focus:ring-2 focus:ring-primary/60
            hover:bg-white/15 dark:hover:bg-white/10
            transition-all duration-200"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading || !city.trim()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="glass-button w-full disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Get Prediction
            </>
          )}
        </motion.button>
      </form>

      {/* Suggested Cities */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Quick search:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedCities.map((c) => (
            <motion.button
              key={c}
              onClick={() => {
                setCity(c)
                onPredict(c)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-secondary/30 hover:bg-secondary/50 text-foreground rounded-full text-sm transition-all border border-border/30"
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
