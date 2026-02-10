'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'
import Dashboard from '@/pages/dashboard-page'
import PredictPage from '@/pages/predict-page'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auto-open on desktop (running only on client to avoid hydration mismatch)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    // Set initial state
    handleResize()

    // Optional: Listen for resize events
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [currentPage, setCurrentPage] = useState<'dashboard' | 'predict'>('dashboard')

  return (
    <div className="flex h-screen relative overflow-hidden bg-background">
      {/* Dynamic Background Overlay (Matches Login Page) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-background dark:from-blue-950/20" />
        <motion.div
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px]"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 2 }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.01] dark:opacity-[0.02]" />
      </div>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            <div className="glass-card-dark border border-white/10 rounded-3xl h-full shadow-2xl overflow-auto custom-scrollbar backdrop-blur-md">
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'predict' && <PredictPage />}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
