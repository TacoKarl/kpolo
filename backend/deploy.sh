#!/bin/bash

source .env

cd ~/kpolo/backend || exit
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
	echo "Changes detected! Deploying new version..."
	git pull origin main
	podman compose up -d --build api
	curl -H "Content-Type: application/json" \
		-X POST \
		-d "{\"content\@: \"Backend deployed!\"}" \
		"$DISCORD_WEBHOOK"
else
	echo "No changes"
	curl -H "Content-Type: application/json" \
		-X POST \
		-d "{\"content\": \"No changes detected on backend!\"}" \
		"$DISCORD_WEBHOOK"
fi
