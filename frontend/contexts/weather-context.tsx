'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type WeatherData = {
    temperature: number
    humidity: number
    wind_speed: number
    risk_score: number
    prediction: string
    city: string
    [key: string]: any
}

type WeatherContextType = {
    weatherData: WeatherData | null
    city: string
    setCity: (city: string) => void
    setWeatherData: (data: WeatherData | null) => void
    fetchWeather: (targetCity: string, apiUrl: string) => Promise<void>
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

export function WeatherProvider({ children }: { children: ReactNode }) {
    const [weatherData, setWeatherDataState] = useState<WeatherData | null>(null)
    const [city, setCityState] = useState('')

    const setCity = useCallback((newCity: string) => {
        setCityState(newCity)
    }, [])

    const setWeatherData = useCallback((data: WeatherData | null) => {
        setWeatherDataState(data)
    }, [])

    const fetchWeather = useCallback(async (targetCity: string, apiUrl: string) => {
        try {
            const response = await fetch(`${apiUrl}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: targetCity }),
            })

            if (!response.ok) throw new Error('Failed to fetch weather data')

            const data = await response.json()
            setWeatherDataState(data)
            setCityState(targetCity)
        } catch (err) {
            console.error('Weather Fetch Error:', err)
            throw err
        }
    }, [])

    return (
        <WeatherContext.Provider value={{ weatherData, city, setCity, setWeatherData, fetchWeather }}>
            {children}
        </WeatherContext.Provider>
    )
}

export function useWeather() {
    const context = useContext(WeatherContext)
    if (!context) {
        throw new Error('useWeather must be used within a WeatherProvider')
    }
    return context
}
