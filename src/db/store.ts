import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data_store.json');

export interface StoreUser {
  id: string;
  nama: string;
  email: string;
  passwordHash: string;
  role: 'employee' | 'it_support' | 'admin';
  departemen?: string;
  createdAt: string;
}

export interface StoreCategory {
  id: string;
  nama: string;
  deskripsi?: string;
  warna?: string;
  statusAktif?: boolean;
}

export interface StoreTicket {
  id: string;
  nomorLaporan: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  prioritas: string;
  status: string;
  lampiran?: any;
  userId: string;
  userNama: string;
  userEmail: string;
  userDepartemen: string;
  assignedToId?: string;
  assignedToNama?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreComment {
  id: string;
  laporanId: string;
  userId: string;
  userNama: string;
  userRole: string;
  komentar: string;
  lampiran?: any;
  createdAt: string;
}

export interface StoreHistory {
  id: string;
  laporanId: string;
  userId: string;
  userNama: string;
  aksi: string;
  createdAt: string;
}

export interface StoreData {
  users: StoreUser[];
  categories: StoreCategory[];
  tickets: StoreTicket[];
  comments: StoreComment[];
  histories: StoreHistory[];
}

export function readStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading data_store.json:', err);
  }
  return { users: [], categories: [], tickets: [], comments: [], histories: [] };
}

export function writeStore(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data_store.json:', err);
  }
}
