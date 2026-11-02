import { defineConfig } from 'drizzle-kit'

// @cdc lot 4 — migrations des comptes (schéma Postgres `app` uniquement).
// Générer après un changement de db/schema : npx drizzle-kit generate --name <sujet>
// Appliquer : DATABASE_URL=… npx drizzle-kit migrate (voir deploy/README.md).
export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema/index.ts',
  out: './db/migrations',
  schemaFilter: ['app'],
  migrations: { schema: 'app', table: '__drizzle_migrations' },
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
})
