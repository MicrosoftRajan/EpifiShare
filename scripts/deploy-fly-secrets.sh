#!/bin/bash
# Run from project root after: fly auth login
# Sets Fly secrets from your local .env (backend only)

set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env file"
  exit 1
fi

# shellcheck disable=SC1091
source .env

fly secrets set \
  MONGODB_URI="$MONGODB_URI" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-24h}" \
  ABOUT_NAME="$ABOUT_NAME" \
  ABOUT_EMAIL="$ABOUT_EMAIL" \
  SEED_ON_START="false" \
  COOKIE_SECURE="true" \
  --app epifishare

echo "Secrets set. Deploy with: fly deploy --app epifishare"
