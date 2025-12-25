#!/usr/bin/env python3

import requests

RENDER_API_KEY = 'rnd_KD58NqlfHmdrMOyGk5rNFArq8VbA'
HEADERS = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Content-Type': 'application/json'
}

BASE_URL = 'https://api.render.com/v1'

services = ['api-gateway', 'user-service', 'matching-service', 'messaging-service', 'payment-service', 'notification-service']

for service_name in services:
    response = requests.get(f'{BASE_URL}/services?name={service_name}', headers=HEADERS)
    if response.status_code == 200:
        data = response.json()
        if data:
            service = data[0]['service']
            service_id = service['id']
            url = service.get('serviceDetails', {}).get('url', 'N/A')
            print(f"{service_name}: ID={service_id}, URL={url}")
        else:
            print(f"{service_name}: Not found")
    else:
        print(f"Failed to get {service_name}: {response.status_code}")