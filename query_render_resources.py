#!/usr/bin/env python3

import requests
import sys

# Configuration - same as create_render_services.py
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

def query_databases():
    log("Querying existing databases...")
    response = requests.get(f'{BASE_URL}/databases', headers=HEADERS)
    if response.status_code != 200:
        error(f"Failed to query databases: {response.text}")
        return []

    databases = response.json()
    log(f"Found {len(databases)} databases")
    return databases

def query_secrets():
    log("Querying existing secrets...")
    response = requests.get(f'{BASE_URL}/secrets', headers=HEADERS)
    if response.status_code != 200:
        error(f"Failed to query secrets: {response.text}")
        return []

    secrets = response.json()
    log(f"Found {len(secrets)} secrets")
    return secrets

def main():
    log("Starting Render resource query...")

    # Query databases
    databases = query_databases()
    postgres_db = None
    redis_db = None
    for db in databases:
        if db.get('name') == 'sugar-daddy-db' and db.get('type') == 'postgres':
            postgres_db = db
        elif db.get('name') == 'redis-cache' and db.get('type') == 'redis':
            redis_db = db

    if postgres_db:
        success(f"Found PostgreSQL database 'sugar-daddy-db': {postgres_db}")
    else:
        log("No PostgreSQL database named 'sugar-daddy-db' found")

    if redis_db:
        success(f"Found Redis instance 'redis-cache': {redis_db}")
    else:
        log("No Redis instance named 'redis-cache' found")

    # Query secrets
    secrets = query_secrets()
    if secrets:
        success("Existing secrets:")
        for secret in secrets:
            print(f"  - Name: {secret.get('name')}, ID: {secret.get('id')}")
    else:
        log("No existing secrets found")

    success("Query completed!")

if __name__ == '__main__':
    main()