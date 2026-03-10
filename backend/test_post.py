import requests

url = "http://127.0.0.1:8000/api/patient/create/"
payload = {
    "patient_first_name": "John",
    "patient_last_name": "Doe",
    "gender": 1,
    "status": 1
}

res = requests.post(url, json=payload)
print(res.status_code)
print(res.json())
