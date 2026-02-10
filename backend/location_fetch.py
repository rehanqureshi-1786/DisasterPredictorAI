import requests
import traceback
import os

LOCATIONIQ_API_KEY = os.getenv("LOCATIONIQ_API_KEY")

def resolve_location(user_input):
    """
    Resolves city / village / pincode / free text into:
    city, district, state, lat, lon
    """

    try:
        url = "https://us1.locationiq.com/v1/search"
        params = {
            "key": LOCATIONIQ_API_KEY,
            "q": user_input,
            "format": "json",
            "addressdetails": 1,
            "normalizeaddress": 1,
            "limit": 1,
            "countrycodes": "in"
        }

        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if response.status_code != 200 or not data:
            print("[ERROR] LocationIQ error:", data)
            return None

        address = data[0].get("address", {})

        # City fallback (VERY IMPORTANT)
        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("county")
            or address.get("state")
        )

        return {
            "city": city,
            "district": address.get("state_district", ""),
            "state": address.get("state", ""),
            "lat": float(data[0]["lat"]),
            "lon": float(data[0]["lon"])
        }

    except Exception:
        traceback.print_exc()
        return None

def reverse_geocode(lat, lon):
    """
    Reverse geocodes lat/lon into:
    city, district, state, lat, lon
    """
    try:
        url = "https://us1.locationiq.com/v1/reverse"
        params = {
            "key": LOCATIONIQ_API_KEY,
            "lat": lat,
            "lon": lon,
            "format": "json",
            "addressdetails": 1
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if response.status_code != 200 or not data:
            print("[ERROR] LocationIQ Reverse Error:", data)
            return None
            
        address = data.get("address", {})
        
        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("county")
            or address.get("state")
        )
        
        return {
            "city": city,
            "district": address.get("state_district", ""),
            "state": address.get("state", ""),
            "lat": float(lat),
            "lon": float(lon)
        }
    except Exception:
        traceback.print_exc()
        return None
