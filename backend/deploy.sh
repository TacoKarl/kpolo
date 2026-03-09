#!/bin/bash

source .env

cd ~/kpolo/backend || exit
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
	echo "${date} - Changes detected! Deploying API..."
	git pull origin main
	podman compose up -d --build --force-recreate api
	curl -H "Content-Type: application/json" \
		-X POST \
		-d "{\"content\": \"Backend deployed!\"}" \
		"$DISCORD_WEBHOOK"
	echo "${date} - Deployment complete"
else
	echo "${date} - No changes"
	curl -H "Content-Type: application/json" \
		-X POST \
		-d "{\"content\": \"No changes detected on backend!\"}" \
		"$DISCORD_WEBHOOK"
fi
