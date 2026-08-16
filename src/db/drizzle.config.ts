import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;

export default defineConfig(
  url
    ? {
        schema: './src/db/schema.ts',
        out: './drizzle',
        dialect: 'postgresql',
        dbCredentials: {
          url,
        },
        verbose: true,
      }
    : {
        schema: './src/db/schema.ts',
        out: './drizzle',
        dialect: 'postgresql',
        dbCredentials: {
          host: process.env.SQL_HOST || '127.0.0.1',
          user: process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres',
          password: process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || '',
          database: process.env.SQL_DB_NAME || 'postgres',
          ssl: false,
        },
        verbose: true,
      }
);
