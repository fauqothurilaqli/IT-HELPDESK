import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';

async function updatePasswords() {
  const hash = bcrypt.hashSync('password123', 8);
  console.log('Generated hash for password123:', hash);

  await db.update(users).set({ passwordHash: hash });
  console.log('All user passwords in Supabase have been set to: password123');
  process.exit(0);
}

updatePasswords().catch(console.error);
