#!/bin/bash

DEPLOY_ID=$(curl -s -H "Authorization: Bearer rnd_WVWh6YnlrOPvCK0ZsnUlmiHidvwv" https://api.render.com/v1/services/srv-d56kb795pdvs738ek8fg/deploys | jq -r '.[] | select(.status == "failed") | .id' | head -1)

if [ -z "$DEPLOY_ID" ]; then
  echo "No failed deployment found."
else
  curl -s -H "Authorization: Bearer rnd_WVWh6YnlrOPvCK0ZsnUlmiHidvwv" https://api.render.com/v1/deploys/$DEPLOY_ID/logs
fi