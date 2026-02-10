import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import traceback
from location_fetch import resolve_location, reverse_geocode
from weather_fetch import get_current_weather, get_weather_trends
from database import init_db, save_prediction, get_recent_predictions, create_user, get_user_by_email
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables from the script's directory
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, ".env")
load_dotenv(dotenv_path)

# -------------------------------------------------------
# App Init
# -------------------------------------------------------
app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
CORS(app, resources={r"/*": {"origins": allowed_origins}})

init_db()

# -------------------------------------------------------
# Load Model
# -------------------------------------------------------
try:
    model_path = os.getenv("MODEL_PATH", "disaster_model.pkl")
    encoder_path = os.getenv("ENCODER_PATH", "label_encoder.pkl")
    
    # Ensure paths are absolute based on script directory if they are relative
    if not os.path.isabs(model_path):
        model_path = os.path.join(base_dir, model_path)
    if not os.path.isabs(encoder_path):
        encoder_path = os.path.join(base_dir, encoder_path)
        
    model = joblib.load(model_path)
    le = joblib.load(encoder_path)
    print(f"[OK] Model loaded from {model_path}")
except Exception as e:
    print(f"[ERROR] Model load failed ({e})")
    model, le = None, None

# -------------------------------------------------------
# Routes
# -------------------------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend running"}), 200

# -------------------------------------------------------
# Auth Routes
# -------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        full_name = data.get("fullName")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        # Check if user already exists
        if get_user_by_email(email):
            return jsonify({"error": "User already exists"}), 400

        password_hash = generate_password_hash(password)
        if create_user(email, password_hash, full_name):
            return jsonify({"message": "User registered successfully"}), 201
        else:
            return jsonify({"error": "Registration failed"}), 500

    except Exception as e:
        print(f"[ERROR] Registration error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400

        user = get_user_by_email(email)
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "email": user["email"],
                "fullName": user["full_name"]
            }
        }), 200

    except Exception as e:
        print(f"[ERROR] Login error: {e}")
        return jsonify({"error": "Internal server error"}), 500

# -------------------------------------------------------
# Prediction Routes
# -------------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input provided"}), 400

        user_input = data.get("city")
        lat = data.get("lat")
        lon = data.get("lon")

        if not user_input and not (lat and lon):
            return jsonify({"error": "City or coordinates required"}), 400

        # Resolve Location
        if lat and lon:
            print(f"[INFO] Using coordinates: {lat}, {lon}")
            location = reverse_geocode(lat, lon)
        else:
            print(f"[INFO] Using city name: {user_input}")
            location = resolve_location(user_input)

        if not location or not location.get("city"):
            return jsonify({"error": "Location not found"}), 400

        # Fetch Current Weather
        weather = get_current_weather(location["lat"], location["lon"])
        if not weather:
            return jsonify({"error": "Weather fetch failed"}), 400

        # Prepare ML Input with correct column names
        X = pd.DataFrame([{
            "temperature": weather["temperature"],
            "humidity": weather["humidity"],
            "rainfall": weather["rainfall"],
            "wind_speed": weather["wind_speed"],
            "pressure": weather["pressure"]
        }])

        print("[INFO] ML Input X:", X)

        # Prediction
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        try:
            pred = model.predict(X)
            label = le.inverse_transform(pred)[0] if le else str(pred[0])
        except Exception as e:
            print("[ERROR] Prediction error:", e)
            return jsonify({"error": "Prediction failed", "details": str(e)}), 500

        # ---------------- RISK CALCULATION ---------------- 
        try:
            # Get model prediction probabilities
            proba = model.predict_proba(X)[0]
            max_confidence = max(proba)
            
            # Base risk based on predicted disaster type
            # If "Low Risk" is predicted, start with low base risk
            # If a disaster is predicted, start with high base risk
            if label == "Low Risk":
                base_risk = 20  # Low base risk for safe conditions
            elif "Flood" in label or "Cyclone" in label or "Drought" in label:
                base_risk = 65  # High base risk for disaster predictions
            else:
                base_risk = 40  # Medium risk for unknown predictions
            
            print(f"[INFO] Predicted label: {label}")
            print(f"[INFO] Base risk from prediction: {base_risk}")
            print(f"[INFO] Model confidence: {max_confidence * 100:.2f}%")

            # Weather-based risk adjustments (more granular)
            weather_risk = 0

            # Rainfall risk (flood indicator)
            if weather["rainfall"] > 70:
                weather_risk += 20
            elif weather["rainfall"] > 50:
                weather_risk += 12
            elif weather["rainfall"] > 30:
                weather_risk += 6
            elif weather["rainfall"] > 10:
                weather_risk += 2

            # Wind speed risk (cyclone indicator)
            if weather["wind_speed"] > 30:
                weather_risk += 20
            elif weather["wind_speed"] > 25:
                weather_risk += 15
            elif weather["wind_speed"] > 15:
                weather_risk += 8
            elif weather["wind_speed"] > 8:
                weather_risk += 3

            # Temperature risk (drought/extreme heat indicator)
            if weather["temperature"] > 40:
                weather_risk += 15
            elif weather["temperature"] > 38:
                weather_risk += 10
            elif weather["temperature"] < -5:
                weather_risk += 12
            elif weather["temperature"] < 0:
                weather_risk += 8

            # Pressure risk (storm indicator)
            if weather["pressure"] < 970:
                weather_risk += 15
            elif weather["pressure"] < 980:
                weather_risk += 10
            elif weather["pressure"] < 1000:
                weather_risk += 5

            # Humidity risk (flood/storm indicator)
            if weather["humidity"] > 90:
                weather_risk += 8
            elif weather["humidity"] > 85:
                weather_risk += 5
            elif weather["humidity"] < 30 and weather["temperature"] > 35:
                weather_risk += 5  # Drought conditions

            # Apply model confidence as a multiplier (0.8 to 1.2 range)
            # Higher confidence increases risk, lower confidence decreases it
            confidence_multiplier = 0.8 + (max_confidence * 0.4)
            
            # Calculate final risk score
            total_risk = (base_risk + weather_risk) * confidence_multiplier
            risk = min(round(total_risk, 2), 100)
            
            print(f"[INFO] Weather risk adjustment: {weather_risk}")
            print(f"[INFO] Confidence multiplier: {confidence_multiplier:.2f}")
            print(f"[INFO] Final risk score: {risk}")

        except Exception as e:
            print("[ERROR] Risk calculation failed:", e)
            traceback.print_exc()
            risk = 50
            print(f"[INFO] Using default risk score: {risk}")


        # Ensure risk_score is a valid number
        risk_score = float(risk) if risk is not None else 50.0
        risk_score = max(0, min(100, risk_score))  # Clamp between 0 and 100

        # Response
        response_data = {
            "city": location["city"],
            "district": location.get("district", ""),
            "state": location.get("state", ""),
            "temperature": weather["temperature"],
            "humidity": weather["humidity"],
            "rainfall": weather["rainfall"],
            "wind_speed": weather["wind_speed"],
            "pressure": weather["pressure"],
            "prediction": label,
            "risk_score": risk_score
        }
        
        # Save to DB
        email = data.get("email")
        save_prediction(response_data["city"], response_data["prediction"], response_data["risk_score"], email)
        
        print(f"[INFO] Response data - risk_score: {response_data['risk_score']}")
        return jsonify(response_data), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": "Internal server error",
        }), 500


@app.route("/recent-predictions", methods=["GET"])
def recent_predictions():
    """
    Get recent predictions from the database
    """
    try:
        limit = int(request.args.get("limit", 5))
        email = request.args.get("email")
        predictions = get_recent_predictions(limit, email)
        return jsonify(predictions), 200
    except Exception as e:
        print(f"[ERROR] Recent predictions fetch error: {e}")
        return jsonify({"error": "Failed to fetch recent predictions"}), 500


@app.route("/weather-trends", methods=["POST", "OPTIONS"])
def weather_trends():
    """
    Get hourly weather trends for a location (past + future hours)
    """
    # Handle CORS preflight
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response
    
    try:
        data = request.get_json()
        if not data:
            print("[ERROR] No input provided to weather-trends")
            return jsonify({"error": "No input provided"}), 400

        user_input = data.get("city")
        date_str = data.get("date")  # Optional: YYYY-MM-DD format
        
        if not user_input:
            print("[ERROR] No city provided to weather-trends")
            return jsonify({"error": "City / village / postal code required"}), 400

        print(f"[INFO] Fetching weather trends for: {user_input}")

        # Resolve Location
        location = resolve_location(user_input)
        if not location or not location.get("city"):
            print(f"[ERROR] Location not found: {user_input}")
            return jsonify({"error": "Location not found"}), 400

        print(f"[INFO] Location resolved: {location['city']} ({location['lat']}, {location['lon']})")

        # Fetch Weather Trends
        trends = get_weather_trends(location["lat"], location["lon"], date_str)
        if not trends:
            print("[ERROR] Weather trends fetch returned None")
            return jsonify({"error": "Weather trends fetch failed"}), 400

        print(f"[INFO] Weather trends fetched: {len(trends.get('hourly', []))} hours")

        response_data = {
            "city": location["city"],
            "district": location.get("district", ""),
            "state": location.get("state", ""),
            "date": trends["date"],
            "hourly": trends["hourly"]
        }
        
        return jsonify(response_data), 200

    except Exception as e:
        print(f"[ERROR] Weather trends error: {e}")
        traceback.print_exc()
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500

# -------------------------------------------------------
# Run (Only for local development)
# -------------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    is_dev = os.getenv("FLASK_ENV") == "development"
    
    # Run (Only for local development)
    # Reverting to HTTP for better proxy compatibility with Next.js (Avoids self-signed cert errors)
    print(f"🚀 Starting backend on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=is_dev)
