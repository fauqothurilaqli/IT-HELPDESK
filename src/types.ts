export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  departemen: string;
  createdAt: string;
}

export interface Category {
  id: string;
  nama: string;
  deskripsi: string;
  warna: string;
  statusAktif: boolean;
}

export type TicketStatus = 'Baru' | 'Sedang Diproses' | 'Menunggu Konfirmasi' | 'Selesai' | 'Ditutup';
export type TicketPriority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';

export interface Ticket {
  id: string;
  nomorLaporan: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  prioritas: TicketPriority;
  status: TicketStatus;
  lampiran?: string[];
  userId: string;
  userNama: string;
  userEmail: string;
  userDepartemen: string;
  assignedToId?: string;
  assignedToNama?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  laporanId: string;
  userId: string;
  userNama: string;
  userRole: UserRole;
  komentar: string;
  lampiran?: string;
  createdAt: string;
}

export interface TicketHistory {
  id: string;
  laporanId: string;
  userId: string;
  userNama: string;
  aksi: string;
  createdAt: string;
}

export interface TicketDetailResponse {
  ticket: Ticket;
  comments: Comment[];
  history: TicketHistory[];
}

export interface DashboardStats {
  total: number;
  baru: number;
  diproses: number;
  konfirmasi: number;
  selesai: number;
  ditutup: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  recentTickets: Ticket[];
  totalUsers: number;
  totalCategories: number;
}
