"use client";

import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";
import { WeatherProvider } from "@/contexts/weather-context";
import { Analytics } from "@vercel/analytics/react";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WeatherProvider>
          {children}
          <Analytics />
        </WeatherProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
