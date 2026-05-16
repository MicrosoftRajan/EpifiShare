#!/bin/bash
# Run from project root after: fly auth login
# Sets Fly secrets from your local .env (handles spaces in values)

set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env file"
  exit 1
fi

if ! command -v fly >/dev/null 2>&1; then
  echo "Fly CLI not installed. Run:"
  echo '  curl -L https://fly.io/install.sh | sh'
  echo "Then restart terminal and run: fly auth login"
  exit 1
fi

node <<'NODE'
require('dotenv').config();
const { execSync } = require('child_process');

const secrets = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  ABOUT_NAME: process.env.ABOUT_NAME,
  ABOUT_EMAIL: process.env.ABOUT_EMAIL,
  SEED_ON_START: 'false',
  COOKIE_SECURE: 'true',
};

for (const [k, v] of Object.entries(secrets)) {
  if (!v) {
    console.error(`Missing ${k} in .env`);
    process.exit(1);
  }
}

const args = Object.entries(secrets)
  .map(([k, v]) => `${k}=${v}`)
  .join(' ');

const appName = process.env.FLY_APP || 'epifishare-rajan';
execSync(`fly secrets set ${args} --app ${appName}`, { stdio: 'inherit', shell: true });
console.log(`Secrets set. Deploy with: fly deploy --app ${appName}`);
NODE
