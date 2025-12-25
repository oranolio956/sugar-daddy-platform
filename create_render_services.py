#!/usr/bin/env python3

import yaml
import requests
import os
import sys

# Configuration
RENDER_API_KEY = os.getenv('RENDER_API_KEY')
if not RENDER_API_KEY:
    print("RENDER_API_KEY not set")
    sys.exit(1)

HEADERS = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Content-Type': 'application/json'
}

BASE_URL = 'https://api.render.com/v1'

# Get owner ID
def get_owner_id():
    response = requests.get(f'{BASE_URL}/owners', headers=HEADERS)
    if response.status_code != 200:
        print(f"Failed to get owners: {response.text}")
        sys.exit(1)
    owners = response.json()
    return owners[0]['owner']['id']

# Create secrets
def create_secrets(secrets, owner_id):
    secret_ids = {}
    for secret in secrets:
        data = {
            'name': secret['name'],
            'ownerId': owner_id
        }
        response = requests.post(f'{BASE_URL}/secrets', headers=HEADERS, json=data)
        if response.status_code == 201:
            secret_ids[secret['name']] = response.json()['id']
            print(f"Created secret: {secret['name']}")
        else:
            print(f"Failed to create secret {secret['name']}: {response.text}")
    return secret_ids

# Create databases
def create_databases(databases, owner_id):
    db_ids = {}
    for db in databases:
        data = {
            'name': db['name'],
            'type': db['type'],
            'plan': db['plan'],
            'region': db['region'],
            'ownerId': owner_id
        }
        response = requests.post(f'{BASE_URL}/databases', headers=HEADERS, json=data)
        if response.status_code == 201:
            db_ids[db['name']] = response.json()['id']
            print(f"Created database: {db['name']}")
        else:
            print(f"Failed to create database {db['name']}: {response.text}")
    return db_ids

# Create services
def create_services(services, owner_id, secret_ids, db_ids):
    for service in services:
        env_vars = []
        for env_var in service.get('envVars', []):
            if 'value' in env_var:
                env_vars.append({
                    'key': env_var['key'],
                    'value': env_var['value']
                })

        service_type = 'web_service' if service['type'] == 'web' else service['type']
        data = {
            'type': service_type,
            'name': service['name'],
            'ownerId': owner_id,
            'repo': 'https://github.com/metzlerdalton3/sugar-daddy-platform',  # Assuming this is the repo
            'branch': 'main',
            'runtime': 'node',
            'serviceDetails': {
                'buildCommand': service.get('buildCommand'),
                'startCommand': service.get('startCommand'),
                'healthCheckPath': service.get('healthCheckPath')
            },
            'plan': 'starter',  # Use starter plan
            'region': service['region']
        }

        response = requests.post(f'{BASE_URL}/services', headers=HEADERS, json=data)
        if response.status_code == 201:
            print(f"Created service: {service['name']}")
        else:
            print(f"Failed to create service {service['name']}: {response.text}")

def main():
    with open('deployment/render/render.yaml', 'r') as f:
        config = yaml.safe_load(f)

    owner_id = get_owner_id()
    print(f"Owner ID: {owner_id}")

    services = config.get('services', [])[:1]  # Create only first service
    create_services(services, owner_id, {}, {})

if __name__ == '__main__':
    main()