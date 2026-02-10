# DisasterPredict AI - Project Overview

An AI-driven web application for disaster risk prediction and geospatial analysis, designed as a research-oriented prototype.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4 (with Vanilla CSS variables)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API
- **UI Components**: Shadcn/UI (Radix UI Radix primitives)

### Backend
- **Framework**: Flask (Python)
- **Machine Learning**: Scikit-learn, Pandas, Joblib
- **Database**: SQLite
- **Environment**: Python-dotenv
- **CORS**: Flask-CORS
- **Server**: Gunicorn (for production)

### APIs & Data Sources
- **LocationIQ**: Reverse geocoding for precise location detection.
- **OpenWeatherMap**: Real-time weather and humidity data.
- **ipapi**: Fallback IP-based geolocation.

## 🛡️ Security Features
- **Password Hashing**: Uses `werkzeug.security` (PBKDF2) for secure password storage.
- **Environment Protection**: Sensitive API keys are managed via `.env` files (ignored by Git).
- **Personalized Context**: Predictions are filtered by user session/email.
- **Robust Geolocation**: Multi-layered fallback (GPS -> IP -> Manual) to ensure user accessibility.

## 📦 Key Features
- **Real-time Prediction**: AI model predicts disaster risks based on current atmospheric conditions.
- **Dynamic Weather Trends**: Interactive charts showing temperature and humidity forecasts.
- **Personalized History**: Keeps track of recent predictions for the logged-in user.
- **Premium UI**: Modern "Glassmorphism" design with Dark/Light mode support.
