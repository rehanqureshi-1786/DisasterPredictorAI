DisasterPredict AI

An AI-powered full-stack web application that predicts disaster risk (Flood, Cyclone, Drought) using machine learning and real-time weather data. Designed as a research-oriented prototype demonstrating ML integration, geospatial intelligence, and secure backend architecture.

-> Tech Stack
Frontend
Framework: Next.js 15 (App Router)
Library: React 19
Styling: Tailwind CSS 4
Charts: Recharts
Animations: Framer Motion
Icons: Lucide React
UI Components: shadcn/ui (Radix UI primitives)
State Management: React Context API

Backend
Framework: Flask (Python)
Machine Learning: Scikit-learn (Random Forest), Pandas, Joblib
Database: SQLite
Environment Management: python-dotenv
CORS Handling: Flask-CORS
Production Server: Gunicorn
APIs & External Services
OpenWeatherMap API – Real-time weather data (temperature, humidity, pressure, wind speed)
LocationIQ API – Reverse geocoding for location detection
ipapi – IP-based fallback geolocation
Twilio API – SMS alerts for high-risk predictions

 Core Features
-> Machine Learning Risk Engine

Implemented a Random Forest classifier to assess disaster risk.
Model inputs include rainfall, temperature, humidity, wind speed, and atmospheric pressure.
Outputs a percentage-based risk score via a Flask REST API.

-> Live Weather Data Integration

Fetches real-time environmental data using OpenWeatherMap.
Dynamically feeds processed weather parameters into the ML model.
Enables up-to-date risk assessment for any supported location.

-> Multi-Layered Geolocation System

Browser-based HTML5 GPS detection.
Reverse geocoding via LocationIQ.
IP-based fallback detection.
Manual city search option for global accessibility.

-> Automated Alerting System

Integrated Twilio SMS API.
Sends automated alerts when risk thresholds exceed predefined limits.
Demonstrates event-driven backend logic and third-party API integration.

-> Authentication & User Personalization

Secure login and registration system.
Password hashing using PBKDF2 (werkzeug.security).
User-specific prediction history stored in SQLite.
Session-based filtering for personalized dashboards.

-> Security & Configuration

Sensitive API keys stored securely using .env files.
.gitignore configured to prevent credential exposure.
Backend configured for secure API communication.
Production-ready setup using Gunicorn.

-> Project Status

This project is a research-oriented prototype built for academic and learning purposes. Predictions are experimental and not intended for real-world emergency decision-making.
