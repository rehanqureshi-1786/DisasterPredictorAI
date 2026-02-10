'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

type OverviewCardProps = {
  title: string
  value: string
  icon: LucideIcon
  trend: string
  color: string
}

export default function OverviewCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: OverviewCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card-dark p-4 md:p-6 space-y-3 md:space-y-4 group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <motion.div
          className={`p-3 bg-gradient-to-br ${color} rounded-lg group-hover:scale-110 transition-transform`}
          whileHover={{ rotate: 10 }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
      </div>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </motion.div>
  )
}
