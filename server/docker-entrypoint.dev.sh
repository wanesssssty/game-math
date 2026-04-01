#!/bin/sh
set -eu

if [ ! -f node_modules/.package-lock.hash ] || ! cmp -s package-lock.json node_modules/.package-lock.hash; then
  echo "Installing server dependencies..."
  npm install
  cp package-lock.json node_modules/.package-lock.hash
fi

echo "Waiting for PostgreSQL..."
until node -e "const { Client } = require('pg'); const client = new Client({ connectionString: process.env.DATABASE_URL }); client.connect().then(() => client.end()).then(() => process.exit(0)).catch(() => process.exit(1));" >/dev/null 2>&1; do
  sleep 2
done

echo "Generating Prisma client..."
npx prisma generate

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node prisma/seed.js

echo "Starting development server..."
exec npm run dev
