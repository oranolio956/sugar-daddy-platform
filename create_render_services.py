#!/usr/bin/env python3

import yaml
import requests
import os
import sys
import time

# Configuration
RENDER_API_KEY = 'rnd_KD58NqlfHmdrMOyGk5rNFArq8VbA'  # Provided API key
HEADERS = {
    'Authorization': f'Bearer {RENDER_API_KEY}',
    'Content-Type': 'application/json'
}

BASE_URL = 'https://api.render.com/v1'

def log(message):
    print(f"[INFO] {message}")

def error(message):
    print(f"[ERROR] {message}")

def success(message):
    print(f"[SUCCESS] {message}")

# Get owner ID
def get_owner_id():
    log("Getting owner ID...")
    response = requests.get(f'{BASE_URL}/owners', headers=HEADERS)
    if response.status_code != 200:
        error(f"Failed to get owners: {response.text}")
        sys.exit(1)
    owners = response.json()
    owner_id = owners[0]['owner']['id']
    success(f"Owner ID: {owner_id}")
    return owner_id

# Create secrets
def create_secrets(secrets, owner_id):
    log("Creating secrets...")
    secret_ids = {}
    for secret in secrets:
        data = {
            'name': secret['name'],
            'ownerId': owner_id
        }
        response = requests.post(f'{BASE_URL}/secrets', headers=HEADERS, json=data)
        if response.status_code == 201:
            secret_ids[secret['name']] = response.json()['id']
            success(f"Created secret: {secret['name']} (ID: {secret_ids[secret['name']]})")
        elif response.status_code == 409:
            log(f"Secret {secret['name']} already exists, skipping")
        elif response.status_code == 404:
            error(f"404 error creating secret {secret['name']}: {response.text}. Manual dashboard creation required.")
        else:
            error(f"Failed to create secret {secret['name']}: {response.text}")
    return secret_ids

# Create databases
def create_databases(databases, owner_id):
    log("Creating databases...")
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
            success(f"Created database: {db['name']} (ID: {db_ids[db['name']]})")
            # Fetch and log the connection string
            response_get = requests.get(f'{BASE_URL}/databases/{db_ids[db["name"]]}', headers=HEADERS)
            if response_get.status_code == 200:
                db_data = response_get.json()
                connection_string = db_data.get('connectionString')
                success(f"Database {db['name']} URL: {connection_string}")
            else:
                log(f"Failed to fetch connection string for {db['name']}: {response_get.text}")
        elif response.status_code == 409:
            log(f"Database {db['name']} already exists, skipping")
        elif response.status_code == 404:
            error(f"404 error creating database {db['name']}: {response.text}. Manual dashboard creation required.")
        else:
            error(f"Failed to create database {db['name']}: {response.text}")
    return db_ids

# Create services
def create_services(services, owner_id, secret_ids, db_ids):
    log("Creating services one by one to avoid rate limits...")
    for i, service in enumerate(services):
        log(f"Creating service {i+1}/{len(services)}: {service['name']}")

        # Build environment variables
        env_vars = []
        for env_var in service.get('envVars', []):
            if 'value' in env_var:
                env_vars.append({
                    'key': env_var['key'],
                    'value': env_var['value']
                })
            elif 'fromDatabase' in env_var:
                # Handle database references
                db_name = env_var['fromDatabase']['name']
                if db_name in db_ids:
                    env_vars.append({
                        'key': env_var['key'],
                        'fromDatabase': {
                            'id': db_ids[db_name],
                            'property': env_var['fromDatabase']['property']
                        }
                    })

        # Handle secrets
        env_var_secrets = []
        for secret in service.get('envVarSecrets', []):
            if secret['fromSecret'] in secret_ids:
                env_var_secrets.append({
                    'key': secret['key'],
                    'fromSecret': {
                        'id': secret_ids[secret['fromSecret']]
                    }
                })

        # Use Docker for all services since they have Dockerfiles
        dockerfile_path = f"backend/{service['name']}/Dockerfile" if service['name'] != 'api-gateway' else f"backend/api-gateway/Dockerfile"

        data = {
            'type': 'web_service',
            'name': service['name'],
            'ownerId': owner_id,
            'repo': 'https://github.com/oranolio956/sugar-daddy-platform',
            'branch': 'main',
            'serviceDetails': {
                'runtime': 'docker',
                'dockerfilePath': dockerfile_path,
                'healthCheckPath': service.get('healthCheckPath', '/health'),
                'envVars': env_vars,
                'secretFiles': env_var_secrets
            },
            'plan': 'starter',  # Use starter plan
            'region': service.get('region', 'oregon')
        }

        response = requests.post(f'{BASE_URL}/services', headers=HEADERS, json=data)
        if response.status_code == 201:
            success(f"Created service: {service['name']}")
        elif response.status_code == 409:
            log(f"Service {service['name']} already exists, skipping")
        elif response.status_code == 429:
            log(f"Rate limited, waiting 60 seconds before retrying {service['name']}")
            time.sleep(60)
            # Retry once
            response = requests.post(f'{BASE_URL}/services', headers=HEADERS, json=data)
            if response.status_code == 201:
                success(f"Created service: {service['name']} (after retry)")
            else:
                error(f"Failed to create service {service['name']} even after retry: {response.text}")
        else:
            error(f"Failed to create service {service['name']}: {response.text}")

        # Wait between service creations to avoid rate limits
        if i < len(services) - 1:
            log("Waiting 10 seconds before creating next service...")
            time.sleep(10)

# Deploy services
def deploy_services(services):
    log("Deploying services...")
    for service in services:
        log(f"Deploying {service['name']}...")

        # Get service ID
        response = requests.get(f'{BASE_URL}/services?name={service["name"]}', headers=HEADERS)
        if response.status_code != 200:
            error(f"Failed to get service {service['name']}: {response.text}")
            continue

        services_data = response.json()
        if not services_data:
            error(f"Service {service['name']} not found")
            continue

        service_id = services_data[0]['service']['id']

        # Trigger deployment
        deploy_data = {'deployType': 'git'}
        response = requests.post(f'{BASE_URL}/services/{service_id}/deploy', headers=HEADERS, json=deploy_data)
        if response.status_code == 201:
            deploy_id = response.json()['id']
            success(f"Deployment triggered for {service['name']} (ID: {deploy_id})")
        else:
            error(f"Failed to deploy {service['name']}: {response.text}")

# Wait for services to be live
def wait_for_services(services):
    log("Waiting for services to be live...")
    for service in services:
        log(f"Waiting for {service['name']}...")
        max_attempts = 60
        for attempt in range(max_attempts):
            response = requests.get(f'{BASE_URL}/services?name={service["name"]}', headers=HEADERS)
            if response.status_code == 200:
                service_data = response.json()[0]['service']
                status = service_data.get('status')
                if status == 'live':
                    success(f"{service['name']} is live")
                    break
                elif status in ['failed', 'crashed']:
                    error(f"{service['name']} failed to deploy")
                    break
            if attempt == max_attempts - 1:
                error(f"Timeout waiting for {service['name']}")
            time.sleep(10)

def main():
    log("Starting Render service creation and deployment...")

    # Load configuration
    with open('deployment/render/render.yaml', 'r') as f:
        config = yaml.safe_load(f)

    owner_id = get_owner_id()

    # Create secrets
    secrets = config.get('secrets', [])
    secret_ids = create_secrets(secrets, owner_id)

    # Create databases
    databases = config.get('databases', [])
    db_ids = create_databases(databases, owner_id)

    # Create services
    services = config.get('services', [])
    create_services(services, owner_id, secret_ids, db_ids)

    # Deploy services
    deploy_services(services)

    # Wait for services to be live
    wait_for_services(services)

    success("All services, databases, and secrets created and deployed successfully!")

if __name__ == '__main__':
    main()