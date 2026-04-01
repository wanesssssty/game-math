#!/bin/sh
set -eu

if [ ! -f node_modules/autoprefixer/package.json ]; then
  echo "Installing client dependencies..."
  npm install
fi

echo "Starting Next.js development server..."
exec npm run dev -- --hostname 0.0.0.0 --port 3000
