import requests
import traceback
import os
from datetime import datetime, timedelta, timezone

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")


# --------------------------------------------------
# 🔹 CURRENT WEATHER (OPENWEATHER)
# --------------------------------------------------
def get_current_weather(lat, lon):
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }

        res = requests.get(url, params=params, timeout=10)
        if res.status_code != 200:
            return None

        data = res.json()
        if data.get("cod") != 200:
            return None

        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind_speed": data["wind"]["speed"],
            "rainfall": data.get("rain", {}).get("1h", 0)
        }

    except Exception:
        traceback.print_exc()
        return None


# --------------------------------------------------
# 🔹 FULL DAY WEATHER (AUTO FALLBACK)
# --------------------------------------------------
def get_weather_trends(lat, lon, date_str=None):
    """
    REAL hourly weather
    Priority:
    1️⃣ Open-Meteo
    2️⃣ OpenWeather (only missing hours)
    ❌ No fake data
    """

    try:
        if date_str is None:
            date_str = datetime.utcnow().strftime("%Y-%m-%d")

        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        now_utc = datetime.utcnow().replace(tzinfo=timezone.utc)

        # Hour map → { "00:00": {...}, ... }
        hourly_map = {}

        # --------------------------------------------------
        # 🔹 1. OPEN-METEO (PRIMARY)
        # --------------------------------------------------
        try:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": (
                    "temperature_2m,"
                    "relative_humidity_2m,"
                    "pressure_msl,"
                    "wind_speed_10m,"
                    "precipitation"
                ),
                "start_date": target_date.strftime("%Y-%m-%d"),
                "end_date": target_date.strftime("%Y-%m-%d"),
                "timezone": "UTC"
            }

            res = requests.get(url, params=params, timeout=10)
            if res.status_code == 200:
                data = res.json()
                h = data.get("hourly", {})

                for i, t in enumerate(h.get("time", [])):
                    dt = datetime.fromisoformat(t).replace(tzinfo=timezone.utc)
                    if dt.date() != target_date:
                        continue

                    key = dt.strftime("%H:%M")
                    hourly_map[key] = {
                        "time": key,
                        "temperature": h["temperature_2m"][i],
                        "humidity": h["relative_humidity_2m"][i],
                        "pressure": h["pressure_msl"][i],
                        "wind_speed": h["wind_speed_10m"][i],
                        "rainfall": h["precipitation"][i],
                        "type": "past" if dt < now_utc else "future",
                        "source": "open-meteo"
                    }
        except Exception:
            traceback.print_exc()

        # --------------------------------------------------
        # 🔹 2. OPENWEATHER (FALLBACK FOR MISSING HOURS)
        # --------------------------------------------------
        try:
            url = "https://api.openweathermap.org/data/3.0/onecall"
            params = {
                "lat": lat,
                "lon": lon,
                "exclude": "current,minutely,daily,alerts",
                "appid": OPENWEATHER_API_KEY,
                "units": "metric"
            }

            res = requests.get(url, params=params, timeout=10)
            if res.status_code == 200:
                forecast = res.json()

                for h in forecast.get("hourly", []):
                    dt = datetime.utcfromtimestamp(h["dt"]).replace(tzinfo=timezone.utc)
                    if dt.date() != target_date:
                        continue

                    key = dt.strftime("%H:%M")
                    if key in hourly_map:
                        continue  # already have real data

                    hourly_map[key] = {
                        "time": key,
                        "temperature": h.get("temp"),
                        "humidity": h.get("humidity"),
                        "pressure": h.get("pressure"),
                        "wind_speed": h.get("wind_speed"),
                        "rainfall": h.get("rain", {}).get("1h", 0),
                        "type": "future",
                        "source": "openweather"
                    }
        except Exception:
            traceback.print_exc()

        # --------------------------------------------------
        # 🔹 3. FINAL SORTED LIST (NO FABRICATION)
        # --------------------------------------------------
        hourly_weather = [
            hourly_map[h]
            for h in sorted(hourly_map.keys())
        ]

        return {
            "date": date_str,
            "hourly": hourly_weather,
            "data_points": len(hourly_weather),
            "complete": len(hourly_weather) == 24
        }

    except Exception as e:
        print("[ERROR] Weather trends error:", e)
        traceback.print_exc()
        return None
