import 'dotenv/config';
import { db } from './index';
import { users, categories, tickets, comments, histories } from './schema';
import { readStore } from './store';

async function seed() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Seeding data to PostgreSQL database...');
  const store = readStore();

  try {
    if (store.users.length > 0) {
      console.log(`Inserting ${store.users.length} users...`);
      for (const u of store.users) {
        await db.insert(users).values(u as any).onConflictDoNothing();
      }
    }

    if (store.categories.length > 0) {
      console.log(`Inserting ${store.categories.length} categories...`);
      for (const c of store.categories) {
        await db.insert(categories).values(c as any).onConflictDoNothing();
      }
    }

    if (store.tickets.length > 0) {
      console.log(`Inserting ${store.tickets.length} tickets...`);
      for (const t of store.tickets) {
        await db.insert(tickets).values(t as any).onConflictDoNothing();
      }
    }

    if (store.comments.length > 0) {
      console.log(`Inserting ${store.comments.length} comments...`);
      for (const cm of store.comments) {
        await db.insert(comments).values(cm as any).onConflictDoNothing();
      }
    }

    if (store.histories.length > 0) {
      console.log(`Inserting ${store.histories.length} histories...`);
      for (const h of store.histories) {
        await db.insert(histories).values(h as any).onConflictDoNothing();
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
