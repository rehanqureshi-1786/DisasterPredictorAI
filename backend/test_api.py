import requests

url = "http://127.0.0.1:5000/predict"
data = {"city": "Delhi"}
resp = requests.post(url, json=data)
print(resp.status_code)
print(resp.json())
