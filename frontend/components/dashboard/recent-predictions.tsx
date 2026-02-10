'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'

export default function RecentPredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<any[]>([])

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const queryParams = new URLSearchParams()
        if (user?.email) queryParams.append('email', user.email)
        queryParams.append('limit', '5')

        const res = await fetch(`/recent-predictions?${queryParams.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setPredictions(data)
        }
      } catch (err) {
        console.error('Failed to fetch recent predictions', err)
      }
    }

    fetchRecent()
    const interval = setInterval(fetchRecent, 30000)
    return () => clearInterval(interval)
  }, [user?.email])

  return (
    <motion.div
      className="glass-card-dark p-6"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Predictions</h3>
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>

      <div className="space-y-3">
        {predictions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent predictions yet.</p>
        ) : (
          predictions.map((pred, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{pred.city}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(pred.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${pred.risk_score > 70
                  ? 'bg-destructive/20 text-destructive'
                  : pred.risk_score > 40
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-green-500/20 text-green-400'
                  }`}
              >
                Risk: {pred.risk_score}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
