import { db } from './index.ts';
import { users, categories, tickets, comments, histories } from './schema.ts';
import { eq, or, desc, asc } from 'drizzle-orm';
import { readStore, writeStore, StoreUser, StoreCategory, StoreTicket, StoreComment, StoreHistory } from './store.ts';

function checkPgEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL || (process.env.SQL_PASSWORD && process.env.SQL_PASSWORD.trim().length > 0));
}

export async function findUserByEmail(email: string): Promise<StoreUser | undefined> {
  if (checkPgEnabled()) {
    try {
      const list = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (list.length > 0) {
        return list[0] as StoreUser;
      }
      return undefined;
    } catch (err) {
      console.error('PostgreSQL error in findUserByEmail:', err);
    }
  }
  const store = readStore();
  return store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function getAllUsers(): Promise<Omit<StoreUser, 'passwordHash'>[]> {
  if (checkPgEnabled()) {
    try {
      const list = await db.select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        role: users.role,
        departemen: users.departemen,
        createdAt: users.createdAt
      }).from(users);
      return list as any;
    } catch (err) {
      console.error('PostgreSQL error in getAllUsers:', err);
    }
  }
  const store = readStore();
  return store.users.map(({ passwordHash, ...safe }) => safe as any);
}

export async function getUserById(id: string): Promise<StoreUser | undefined> {
  if (checkPgEnabled()) {
    try {
      const list = await db.select().from(users).where(eq(users.id, id));
      if (list.length > 0) return list[0] as StoreUser;
      return undefined;
    } catch (err) {
      console.error('PostgreSQL error in getUserById:', err);
    }
  }
  const store = readStore();
  return store.users.find(u => u.id === id);
}

export async function createUser(newUser: StoreUser): Promise<Omit<StoreUser, 'passwordHash'>> {
  if (checkPgEnabled()) {
    try {
      await db.insert(users).values(newUser as any);
      const { passwordHash, ...safe } = newUser;
      return safe as any;
    } catch (err) {
      console.error('PostgreSQL error in createUser:', err);
    }
  }
  const store = readStore();
  store.users.push(newUser);
  writeStore(store);
  const { passwordHash, ...safe } = newUser;
  return safe as any;
}

export async function updateUser(id: string, updateData: Record<string, any>): Promise<Omit<StoreUser, 'passwordHash'> | null> {
  if (checkPgEnabled()) {
    try {
      await db.update(users).set(updateData).where(eq(users.id, id));
      const list = await db.select().from(users).where(eq(users.id, id));
      if (list.length > 0) {
        const { passwordHash, ...safe } = list[0];
        return safe as any;
      }
    } catch (err) {
      console.error('PostgreSQL error in updateUser:', err);
    }
  }
  const store = readStore();
  const idx = store.users.findIndex(u => u.id === id);
  if (idx !== -1) {
    store.users[idx] = { ...store.users[idx], ...updateData };
    writeStore(store);
    const { passwordHash, ...safe } = store.users[idx];
    return safe as any;
  }
  return null;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (checkPgEnabled()) {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (err) {
      console.error('PostgreSQL error in deleteUser:', err);
    }
  }
  const store = readStore();
  store.users = store.users.filter(u => u.id !== id);
  writeStore(store);
  return true;
}

// Categories
export async function getAllCategories(): Promise<StoreCategory[]> {
  if (checkPgEnabled()) {
    try {
      const list = await db.select().from(categories);
      return list as any;
    } catch (err) {
      console.error('PostgreSQL error in getAllCategories:', err);
    }
  }
  return readStore().categories;
}

export async function getCategoryById(id: string): Promise<StoreCategory | undefined> {
  if (checkPgEnabled()) {
    try {
      const list = await db.select().from(categories).where(eq(categories.id, id));
      if (list.length > 0) return list[0] as any;
      return undefined;
    } catch (err) {
      console.error('PostgreSQL error in getCategoryById:', err);
    }
  }
  return readStore().categories.find(c => c.id === id);
}

export async function createCategory(newCat: StoreCategory): Promise<StoreCategory> {
  if (checkPgEnabled()) {
    try {
      await db.insert(categories).values(newCat as any);
      return newCat;
    } catch (err) {
      console.error('PostgreSQL error in createCategory:', err);
    }
  }
  const store = readStore();
  store.categories.push(newCat);
  writeStore(store);
  return newCat;
}

export async function updateCategory(id: string, updateData: Record<string, any>): Promise<StoreCategory | null> {
  if (checkPgEnabled()) {
    try {
      await db.update(categories).set(updateData).where(eq(categories.id, id));
      const list = await db.select().from(categories).where(eq(categories.id, id));
      if (list.length > 0) return list[0] as any;
    } catch (err) {
      console.error('PostgreSQL error in updateCategory:', err);
    }
  }
  const store = readStore();
  const idx = store.categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    store.categories[idx] = { ...store.categories[idx], ...updateData };
    writeStore(store);
    return store.categories[idx];
  }
  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (checkPgEnabled()) {
    try {
      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (err) {
      console.error('PostgreSQL error in deleteCategory:', err);
    }
  }
  const store = readStore();
  store.categories = store.categories.filter(c => c.id !== id);
  writeStore(store);
  return true;
}

// Tickets
export async function getAllTickets(filters: { user?: any } = {}): Promise<StoreTicket[]> {
  if (checkPgEnabled()) {
    try {
      let query = db.select().from(tickets);
      if (filters.user) {
        if (filters.user.role === 'employee') {
          const list = await db.select().from(tickets).where(eq(tickets.userId, filters.user.id));
          return list as any;
        } else if (filters.user.role === 'it_support') {
          const list = await db.select().from(tickets).where(
            or(eq(tickets.assignedToId, filters.user.id), eq(tickets.status, 'Baru'))
          );
          return list as any;
        }
      }
      const list = await query;
      return list as any;
    } catch (err) {
      console.error('PostgreSQL error in getAllTickets:', err);
    }
  }
  const store = readStore();
  let result = [...store.tickets];

  if (filters.user) {
    if (filters.user.role === 'employee') {
      result = result.filter(t => t.userId === filters.user.id);
    } else if (filters.user.role === 'it_support') {
      result = result.filter(t => t.assignedToId === filters.user.id || t.status === 'Baru');
    }
  }
  return result;
}

export async function getTicketById(id: string): Promise<{ ticket: StoreTicket; comments: StoreComment[]; history: StoreHistory[] } | undefined> {
  if (checkPgEnabled()) {
    try {
      const ticketList = await db.select().from(tickets).where(eq(tickets.id, id));
      if (ticketList.length > 0) {
        const commentList = await db.select().from(comments).where(eq(comments.laporanId, id));
        const historyList = await db.select().from(histories).where(eq(histories.laporanId, id));
        return {
          ticket: ticketList[0] as any,
          comments: commentList as any,
          history: historyList as any
        };
      }
      return undefined;
    } catch (err) {
      console.error('PostgreSQL error in getTicketById:', err);
    }
  }
  const store = readStore();
  const ticket = store.tickets.find(t => t.id === id);
  if (!ticket) return undefined;
  const ticketComments = store.comments.filter(c => c.laporanId === id);
  const history = store.histories.filter(h => h.laporanId === id);
  return { ticket, comments: ticketComments, history };
}

export async function createTicket(newTicket: StoreTicket, historyItem: StoreHistory): Promise<StoreTicket> {
  if (checkPgEnabled()) {
    try {
      await db.insert(tickets).values(newTicket as any);
      await db.insert(histories).values(historyItem as any);
      return newTicket;
    } catch (err) {
      console.error('PostgreSQL error in createTicket:', err);
    }
  }
  const store = readStore();
  store.tickets.push(newTicket);
  store.histories.push(historyItem);
  writeStore(store);
  return newTicket;
}

export async function updateTicket(id: string, updateData: Record<string, any>, historyItem?: StoreHistory): Promise<StoreTicket | null> {
  if (checkPgEnabled()) {
    try {
      await db.update(tickets).set(updateData).where(eq(tickets.id, id));
      if (historyItem) {
        await db.insert(histories).values(historyItem as any);
      }
      const list = await db.select().from(tickets).where(eq(tickets.id, id));
      if (list.length > 0) return list[0] as any;
    } catch (err) {
      console.error('PostgreSQL error in updateTicket:', err);
    }
  }
  const store = readStore();
  const idx = store.tickets.findIndex(t => t.id === id);
  if (idx !== -1) {
    store.tickets[idx] = { ...store.tickets[idx], ...updateData };
    if (historyItem) {
      store.histories.push(historyItem);
    }
    writeStore(store);
    return store.tickets[idx];
  }
  return null;
}

export async function deleteTicket(id: string): Promise<boolean> {
  if (checkPgEnabled()) {
    try {
      await db.delete(tickets).where(eq(tickets.id, id));
      await db.delete(comments).where(eq(comments.laporanId, id));
      await db.delete(histories).where(eq(histories.laporanId, id));
      return true;
    } catch (err) {
      console.error('PostgreSQL error in deleteTicket:', err);
    }
  }
  const store = readStore();
  store.tickets = store.tickets.filter(t => t.id !== id);
  store.comments = store.comments.filter(c => c.laporanId !== id);
  store.histories = store.histories.filter(h => h.laporanId !== id);
  writeStore(store);
  return true;
}

export async function addCommentToTicket(commentItem: StoreComment, historyItem?: StoreHistory): Promise<StoreComment> {
  if (checkPgEnabled()) {
    try {
      await db.insert(comments).values(commentItem as any);
      if (historyItem) {
        await db.insert(histories).values(historyItem as any);
      }
      return commentItem;
    } catch (err) {
      console.error('PostgreSQL error in addCommentToTicket:', err);
    }
  }
  const store = readStore();
  store.comments.push(commentItem);
  if (historyItem) {
    store.histories.push(historyItem);
  }
  writeStore(store);
  return commentItem;
}
