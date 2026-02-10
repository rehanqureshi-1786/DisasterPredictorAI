'use client'

import { motion } from 'framer-motion'
import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

type NavbarProps = {
  sidebarOpen: boolean
  onSidebarToggle: () => void
}

export default function Navbar({ sidebarOpen, onSidebarToggle }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-md flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onSidebarToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-secondary/20 rounded-lg transition-all"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </motion.button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-secondary/20 rounded-lg transition-all"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-foreground" />
          )}
        </motion.button>
      </div>
    </nav>
  )
}
