import { db } from './index.js';
import { users, categories, tickets, comments, histories } from './schema.js';
import { eq, or, desc, asc } from 'drizzle-orm';
import { readStore, writeStore, StoreUser, StoreCategory, StoreTicket, StoreComment, StoreHistory } from './store.js';

let isPgEnabled = Boolean(process.env.DATABASE_URL || (process.env.SQL_PASSWORD && process.env.SQL_PASSWORD.trim().length > 0));

export async function findUserByEmail(email: string): Promise<StoreUser | undefined> {
  if (isPgEnabled) {
    try {
      const list = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (list.length > 0) {
        return list[0] as StoreUser;
      }
    } catch (err) {
      console.warn('PostgreSQL is not available, falling back to JSON store');
      isPgEnabled = false;
    }
  }
  const store = readStore();
  return store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function getAllUsers(): Promise<Omit<StoreUser, 'passwordHash'>[]> {
  if (isPgEnabled) {
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
      isPgEnabled = false;
    }
  }
  const store = readStore();
  return store.users.map(({ passwordHash, ...safe }) => safe as any);
}

export async function getUserById(id: string): Promise<StoreUser | undefined> {
  if (isPgEnabled) {
    try {
      const list = await db.select().from(users).where(eq(users.id, id));
      if (list.length > 0) return list[0] as StoreUser;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  const store = readStore();
  return store.users.find(u => u.id === id);
}

export async function createUser(newUser: StoreUser): Promise<Omit<StoreUser, 'passwordHash'>> {
  if (isPgEnabled) {
    try {
      await db.insert(users).values(newUser as any);
      const { passwordHash, ...safe } = newUser;
      return safe as any;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  const store = readStore();
  store.users.push(newUser);
  writeStore(store);
  const { passwordHash, ...safe } = newUser;
  return safe as any;
}

export async function updateUser(id: string, updateData: Record<string, any>): Promise<Omit<StoreUser, 'passwordHash'> | null> {
  if (isPgEnabled) {
    try {
      await db.update(users).set(updateData).where(eq(users.id, id));
      const list = await db.select().from(users).where(eq(users.id, id));
      if (list.length > 0) {
        const { passwordHash, ...safe } = list[0];
        return safe as any;
      }
    } catch (err) {
      isPgEnabled = false;
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
  if (isPgEnabled) {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  const store = readStore();
  store.users = store.users.filter(u => u.id !== id);
  writeStore(store);
  return true;
}

// Categories
export async function getAllCategories(): Promise<StoreCategory[]> {
  if (isPgEnabled) {
    try {
      const list = await db.select().from(categories);
      return list as any;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  return readStore().categories;
}

export async function getCategoryById(id: string): Promise<StoreCategory | undefined> {
  if (isPgEnabled) {
    try {
      const list = await db.select().from(categories).where(eq(categories.id, id));
      if (list.length > 0) return list[0] as any;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  return readStore().categories.find(c => c.id === id);
}

export async function createCategory(newCat: StoreCategory): Promise<StoreCategory> {
  if (isPgEnabled) {
    try {
      await db.insert(categories).values(newCat as any);
      return newCat;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  const store = readStore();
  store.categories.push(newCat);
  writeStore(store);
  return newCat;
}

export async function updateCategory(id: string, updateData: Record<string, any>): Promise<StoreCategory | null> {
  if (isPgEnabled) {
    try {
      await db.update(categories).set(updateData).where(eq(categories.id, id));
      const list = await db.select().from(categories).where(eq(categories.id, id));
      if (list.length > 0) return list[0] as any;
    } catch (err) {
      isPgEnabled = false;
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
  if (isPgEnabled) {
    try {
      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  const store = readStore();
  store.categories = store.categories.filter(c => c.id !== id);
  writeStore(store);
  return true;
}

// Tickets
export async function getAllTickets(): Promise<StoreTicket[]> {
  if (isPgEnabled) {
    try {
      const list = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
      return list as any;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  return readStore().tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTicketById(id: string): Promise<{ ticket: StoreTicket; comments: StoreComment[]; history: StoreHistory[] } | null> {
  if (isPgEnabled) {
    try {
      const ticketList = await db.select().from(tickets).where(or(eq(tickets.id, id), eq(tickets.nomorLaporan, id)));
      const ticket = ticketList[0];
      if (ticket) {
        const commentList = await db.select().from(comments).where(eq(comments.laporanId, ticket.id)).orderBy(asc(comments.createdAt));
        const historyList = await db.select().from(histories).where(eq(histories.laporanId, ticket.id)).orderBy(desc(histories.createdAt));
        return {
          ticket: ticket as any,
          comments: commentList as any,
          history: historyList as any
        };
      }
    } catch (err) {
      isPgEnabled = false;
    }
  }

  const store = readStore();
  const ticket = store.tickets.find(t => t.id === id || t.nomorLaporan === id);
  if (!ticket) return null;

  const tComments = store.comments.filter(c => c.laporanId === ticket.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const tHistory = store.histories.filter(h => h.laporanId === ticket.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    ticket,
    comments: tComments,
    history: tHistory
  };
}

export async function createTicket(newTicket: StoreTicket, historyItem: StoreHistory): Promise<StoreTicket> {
  if (isPgEnabled) {
    try {
      await db.insert(tickets).values(newTicket as any);
      await db.insert(histories).values(historyItem as any);
      return newTicket;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  const store = readStore();
  store.tickets.push(newTicket);
  store.histories.push(historyItem);
  writeStore(store);
  return newTicket;
}

export async function updateTicket(id: string, updateData: Record<string, any>, historyItem?: StoreHistory): Promise<StoreTicket | null> {
  if (isPgEnabled) {
    try {
      if (historyItem) {
        await db.insert(histories).values(historyItem as any);
      }
      await db.update(tickets).set(updateData).where(eq(tickets.id, id));
      const list = await db.select().from(tickets).where(eq(tickets.id, id));
      if (list.length > 0) return list[0] as any;
    } catch (err) {
      isPgEnabled = false;
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
  if (isPgEnabled) {
    try {
      await db.delete(comments).where(eq(comments.laporanId, id));
      await db.delete(histories).where(eq(histories.laporanId, id));
      await db.delete(tickets).where(eq(tickets.id, id));
      return true;
    } catch (err) {
      isPgEnabled = false;
    }
  }

  const store = readStore();
  store.tickets = store.tickets.filter(t => t.id !== id);
  store.comments = store.comments.filter(c => c.laporanId !== id);
  store.histories = store.histories.filter(h => h.laporanId !== id);
  writeStore(store);
  return true;
}

export async function addCommentToTicket(newComment: StoreComment, historyItem: StoreHistory): Promise<StoreComment> {
  if (isPgEnabled) {
    try {
      await db.insert(comments).values(newComment as any);
      await db.insert(histories).values(historyItem as any);
      await db.update(tickets).set({ updatedAt: new Date().toISOString() }).where(eq(tickets.id, newComment.laporanId));
      return newComment;
    } catch (err) {
      isPgEnabled = false;
    }
  }
  const store = readStore();
  store.comments.push(newComment);
  store.histories.push(historyItem);
  const tIdx = store.tickets.findIndex(t => t.id === newComment.laporanId);
  if (tIdx !== -1) {
    store.tickets[tIdx].updatedAt = new Date().toISOString();
  }
  writeStore(store);
  return newComment;
}
