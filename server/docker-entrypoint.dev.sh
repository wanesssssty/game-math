#!/bin/sh
set -eu

if [ ! -f node_modules/prisma/package.json ]; then
  echo "Installing server dependencies..."
  npm install
fi

echo "Waiting for PostgreSQL..."
until npx prisma migrate status >/dev/null 2>&1; do
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
