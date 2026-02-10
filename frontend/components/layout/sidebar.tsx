'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Zap, Home, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

type SidebarProps = {
  open: boolean
  onToggle: () => void
  currentPage: 'dashboard' | 'predict'
  onPageChange: (page: 'dashboard' | 'predict') => void
}

export default function Sidebar({ open, onToggle, currentPage, onPageChange }: SidebarProps) {
  const { logout } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'predict', label: 'Predict', icon: Zap },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed md:relative z-50 w-64 h-full glass-card-dark border-r border-border/50 dark:border-white/10 flex flex-col shadow-2xl md:shadow-none !rounded-none backdrop-blur-3xl"
          >
            {/* Logo Section */}
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10 shrink-0">
                  <img src="/icon.svg" alt="Logo" className="w-6 h-6" />
                </div>
                <h1 className="text-sm font-bold text-foreground tracking-tighter leading-none whitespace-nowrap">
                  DisasterpredictorAI
                </h1>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id as 'dashboard' | 'predict');
                      if (window.innerWidth < 768) onToggle(); // Close on mobile click
                    }}
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                )
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-sidebar-border">
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent/20 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
