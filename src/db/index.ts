import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    if (process.env.DATABASE_URL) {
      const connectionString = process.env.DATABASE_URL;
      const match = connectionString.match(/^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
      if (match) {
        const [, user, password, host, port, database] = match;
        global._postgresPool = new Pool({
          user: decodeURIComponent(user),
          password: decodeURIComponent(password),
          host,
          port: parseInt(port, 10),
          database,
          ssl: { rejectUnauthorized: false },
          max: 10,
          connectionTimeoutMillis: 15000,
        });
      } else {
        global._postgresPool = new Pool({
          connectionString,
          ssl: { rejectUnauthorized: false },
          max: 10,
          connectionTimeoutMillis: 15000,
        });
      }
    } else {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || '127.0.0.1',
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
        password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || '',
        database: process.env.SQL_DB_NAME || 'postgres',
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
