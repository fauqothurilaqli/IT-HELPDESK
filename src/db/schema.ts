import { pgTable, text, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  nama: text('nama').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  departemen: text('departemen'),
  createdAt: text('created_at').notNull()
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  nama: text('nama').notNull(),
  deskripsi: text('deskripsi'),
  warna: text('warna'),
  statusAktif: boolean('status_aktif').default(true)
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  nomorLaporan: text('nomor_laporan').notNull(),
  judul: text('judul').notNull(),
  deskripsi: text('deskripsi'),
  kategori: text('kategori'),
  prioritas: text('prioritas'),
  status: text('status'),
  lampiran: jsonb('lampiran'),
  userId: text('user_id'),
  userNama: text('user_nama'),
  userEmail: text('user_email'),
  userDepartemen: text('user_departemen'),
  assignedToId: text('assigned_to_id'),
  assignedToNama: text('assigned_to_nama'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  laporanId: text('laporan_id').notNull(),
  userId: text('user_id'),
  userNama: text('user_nama'),
  userRole: text('user_role'),
  komentar: text('komentar').notNull(),
  lampiran: text('lampiran'),
  createdAt: text('created_at').notNull()
});

export const histories = pgTable('histories', {
  id: text('id').primaryKey(),
  laporanId: text('laporan_id').notNull(),
  userId: text('user_id'),
  userNama: text('user_nama'),
  aksi: text('aksi').notNull(),
  createdAt: text('created_at').notNull()
});
