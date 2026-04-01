#!/bin/sh
set -eu

if [ ! -f node_modules/.package-lock.hash ] || ! cmp -s package-lock.json node_modules/.package-lock.hash; then
  echo "Installing client dependencies..."
  npm install
  cp package-lock.json node_modules/.package-lock.hash
fi

echo "Starting Next.js development server..."
exec npm run dev -- --hostname 0.0.0.0 --port 3000
