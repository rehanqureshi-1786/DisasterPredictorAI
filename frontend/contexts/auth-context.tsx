'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

type User = {
  email: string
  fullName?: string
}

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<any>
  logout: () => void
}

const API_URL = '' // Use relative paths to leverage Next.js rewrites/proxy

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Session Hydration
  useEffect(() => {
    const hydrate = () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('Failed to hydrate auth session:', err)
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    hydrate()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    if (!email || !password || !fullName) {
      throw new Error('All fields are required')
    }

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      return data
    } catch (err) {
      console.error('Registration error:', err)
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
