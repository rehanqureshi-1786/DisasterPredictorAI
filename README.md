# DisasterPredict AI

An AI-powered full-stack web application that predicts disaster risk (Flood, Cyclone, Drought) using machine learning and real-time weather data.

---

## 🚀 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Recharts
- Framer Motion
- shadcn/ui
- React Context API

### Backend
- Flask (Python)
- Scikit-learn (Random Forest)
- Pandas, Joblib
- SQLite
- Flask-CORS
- Gunicorn

### APIs & Services
- OpenWeatherMap API – Real-time weather data
- LocationIQ API – Reverse geocoding
- ipapi – IP-based fallback location
- Twilio API – SMS alerts

---

## Core Features

### Machine Learning Risk Engine
- Random Forest classifier
- Multi-parameter input (rainfall, humidity, pressure, wind speed, temperature)
- Percentage-based risk output via REST API

### Live Weather Integration
- Real-time data from OpenWeatherMap
- Dynamic ML inference based on current conditions

### Multi-Layered Geolocation
- HTML5 GPS detection
- Reverse geocoding
- IP-based fallback
- Manual city search

### Automated Alerting
- Twilio SMS integration
- Threshold-based risk alerts

### Authentication & Personalization
- Secure login/registration
- PBKDF2 password hashing
- User-specific prediction history

---

## Security & Configuration
- API keys stored in `.env`
- `.gitignore` prevents credential exposure
- Production-ready with Gunicorn

---

## Project Status
This is a research-oriented prototype built for academic purposes. Predictions are experimental and not intended for real-world emergency decisions.
