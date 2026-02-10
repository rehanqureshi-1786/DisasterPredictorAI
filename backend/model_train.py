# model_train.py
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# For reproducibility
np.random.seed(42)

data = []
for _ in range(500):
    temperature = np.random.uniform(20, 40)
    humidity = np.random.uniform(40, 90)
    rainfall = np.random.uniform(0, 100)
    wind_speed = np.random.uniform(0, 40)
    pressure = np.random.uniform(950, 1025)

    # Label creation logic
    if rainfall > 70 and humidity > 75:
        label = "Flood Risk"
    elif wind_speed > 30:
        label = "Cyclone Risk"
    elif rainfall < 10 and humidity < 50 and temperature > 35:
        label = "Drought Risk"
    else:
        label = "Low Risk"

    data.append([temperature, humidity, rainfall, wind_speed, pressure, label])

# Create DataFrame
df = pd.DataFrame(
    data,
    columns=["temperature", "humidity", "rainfall", "wind_speed", "pressure", "label"]
)

# Features & labels
X = df[["temperature", "humidity", "rainfall", "wind_speed", "pressure"]]
y = df["label"]

# Encode categorical labels for model training
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Train model
model = RandomForestClassifier(random_state=42)
model.fit(X, y_encoded)

# Save model
joblib.dump(model, "disaster_model.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")

print("Model and label encoder trained and saved!")