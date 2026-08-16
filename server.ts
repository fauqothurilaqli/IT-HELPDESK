import express from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  findUserByEmail,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addCommentToTicket
} from './src/db/adapter';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'it-helpdesk-secret-key-2026';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// URL Normalizer for Vercel Serverless Functions
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/index.html') && !req.url.includes('.')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  next();
});

// Authentication Middleware
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    nama: string;
    email: string;
    role: 'employee' | 'it_support' | 'admin';
    departemen: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan' });

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid atau telah kadaluarsa' });
    req.user = decoded;
    next();
  });
}

// --- API ENDPOINTS ---

// Auth Routes
app.post(['/api/auth/login', '/auth/login'], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const user = await findUserByEmail(email);

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const userPayload = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role as 'employee' | 'it_support' | 'admin',
      departemen: user.departemen || ''
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login berhasil',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.get(['/api/auth/me', '/auth/me'], authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// Users Management (Admin)
app.get(['/api/users', '/users'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const allUsers = await getAllUsers();
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

app.post(['/api/users', '/users'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Hanya Admin yang dapat menambah user' });
    }
    const { nama, email, password, role, departemen } = req.body;
    if (!nama || !email || !password || !role) {
      return res.status(400).json({ error: 'Nama, email, password, dan role wajib diisi' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    const newId = 'usr-' + Date.now();
    const newUser = {
      id: newId,
      nama,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 8),
      role,
      departemen: departemen || 'Umum',
      createdAt: new Date().toISOString()
    };

    const safeUser = await createUser(newUser);
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah user' });
  }
});

app.put(['/api/users/:id', '/users/:id'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Hanya Admin yang dapat mengedit user' });
    }
    const { id } = req.params;
    const { nama, email, password, role, departemen } = req.body;

    const existing = await getUserById(id);
    if (!existing) return res.status(404).json({ error: 'User tidak ditemukan' });

    const updateData: Record<string, any> = {};
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (departemen) updateData.departemen = departemen;
    if (password && password.trim().length > 0) {
      updateData.passwordHash = bcrypt.hashSync(password, 8);
    }

    const safeUser = await updateUser(id, updateData);
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui user' });
  }
});

app.delete(['/api/users/:id', '/users/:id'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Hanya Admin yang dapat menghapus user' });
    }
    const { id } = req.params;
    if (id === req.user?.id) {
      return res.status(400).json({ error: 'Anda tidak dapat menghapus akun diri sendiri' });
    }

    await deleteUser(id);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
});

// Categories Management
app.get(['/api/categories', '/categories'], async (req, res) => {
  try {
    const cats = await getAllCategories();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil kategori' });
  }
});

app.post(['/api/categories', '/categories'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Hanya Admin yang dapat mengelola kategori' });
    }
    const { nama, deskripsi, warna } = req.body;
    if (!nama) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

    const newCat = {
      id: 'cat-' + Date.now(),
      nama,
      deskripsi: deskripsi || '',
      warna: warna || 'blue',
      statusAktif: true
    };

    const result = await createCategory(newCat);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat kategori' });
  }
});

app.put(['/api/categories/:id', '/categories/:id'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Hanya Admin yang dapat mengedit kategori' });
    }
    const { id } = req.params;
    const { nama, deskripsi, warna, statusAktif } = req.body;

    const existing = await getCategoryById(id);
    if (!existing) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

    const updateData: Record<string, any> = {};
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (warna !== undefined) updateData.warna = warna;
    if (statusAktif !== undefined) updateData.statusAktif = statusAktif;

    const updated = await updateCategory(id, updateData);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui kategori' });
  }
});

app.delete(['/api/categories/:id', '/categories/:id'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Hanya Admin yang dapat menghapus kategori' });
    }
    const { id } = req.params;
    await deleteCategory(id);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus kategori' });
  }
});

// Tickets Management
app.get(['/api/tickets', '/tickets'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    let allTickets = await getAllTickets();

    if (req.user?.role === 'employee') {
      allTickets = allTickets.filter(t => t.userId === req.user?.id);
    }

    const { status, kategori, prioritas, search } = req.query;

    if (status && typeof status === 'string' && status !== 'Semua') {
      allTickets = allTickets.filter(t => t.status === status);
    }
    if (kategori && typeof kategori === 'string' && kategori !== 'Semua') {
      allTickets = allTickets.filter(t => t.kategori === kategori);
    }
    if (prioritas && typeof prioritas === 'string' && prioritas !== 'Semua') {
      allTickets = allTickets.filter(t => t.prioritas === prioritas);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      allTickets = allTickets.filter(t =>
        t.nomorLaporan.toLowerCase().includes(q) ||
        t.judul.toLowerCase().includes(q) ||
        (t.deskripsi || '').toLowerCase().includes(q) ||
        (t.userNama || '').toLowerCase().includes(q)
      );
    }

    res.json(allTickets);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data laporan' });
  }
});

app.get(['/api/tickets/:id', '/tickets/:id'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const details = await getTicketById(id);
    if (!details) return res.status(404).json({ error: 'Laporan tidak ditemukan' });

    if (req.user?.role === 'employee' && details.ticket.userId !== req.user.id) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke laporan ini' });
    }

    res.json(details);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil rincian laporan' });
  }
});

app.post(['/api/tickets', '/tickets'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { judul, deskripsi, kategori, prioritas, lampiran } = req.body;
    if (!judul || !deskripsi || !kategori) {
      return res.status(400).json({ error: 'Judul, deskripsi, dan kategori wajib diisi' });
    }

    const allTkts = await getAllTickets();
    const countToday = allTkts.length + 1;
    const now = new Date();
    const dateStr = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0');
    const nomorLaporan = `TKT-${dateStr}-${String(countToday).padStart(3, '0')}`;

    const newTicket = {
      id: 'tkt-' + Date.now(),
      nomorLaporan,
      judul,
      deskripsi,
      kategori,
      prioritas: prioritas || 'Sedang',
      status: 'Baru',
      lampiran: lampiran || [],
      userId: req.user!.id,
      userNama: req.user!.nama,
      userEmail: req.user!.email,
      userDepartemen: req.user!.departemen,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const historyItem = {
      id: 'his-' + Date.now(),
      laporanId: newTicket.id,
      userId: req.user!.id,
      userNama: req.user!.nama,
      aksi: `Membuat laporan kendala ${nomorLaporan}`,
      createdAt: new Date().toISOString()
    };

    const created = await createTicket(newTicket, historyItem);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat laporan' });
  }
});

app.put(['/api/tickets/:id', '/tickets/:id'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi, kategori, prioritas, status, assignedToId, assignedToNama } = req.body;

    const details = await getTicketById(id);
    if (!details) return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    const ticket = details.ticket;

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    let historyItem: any;

    if (req.user?.role === 'employee') {
      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ error: 'Akses ditolak' });
      }
      if (ticket.status !== 'Baru') {
        return res.status(400).json({ error: 'Laporan hanya dapat diedit saat status masih "Baru"' });
      }
      if (judul) updateData.judul = judul;
      if (deskripsi) updateData.deskripsi = deskripsi;
      if (kategori) updateData.kategori = kategori;
      if (prioritas) updateData.prioritas = prioritas;
    } else {
      const changes: string[] = [];

      if (judul && judul !== ticket.judul) {
        changes.push(`Mengubah judul dari "${ticket.judul}" menjadi "${judul}"`);
        updateData.judul = judul;
      }
      if (deskripsi && deskripsi !== ticket.deskripsi) {
        changes.push(`Mengubah deskripsi laporan`);
        updateData.deskripsi = deskripsi;
      }
      if (kategori && kategori !== ticket.kategori) {
        changes.push(`Mengubah kategori dari ${ticket.kategori} menjadi ${kategori}`);
        updateData.kategori = kategori;
      }
      if (prioritas && prioritas !== ticket.prioritas) {
        changes.push(`Mengubah prioritas dari ${ticket.prioritas} menjadi ${prioritas}`);
        updateData.prioritas = prioritas;
      }
      if (status && status !== ticket.status) {
        changes.push(`Mengubah status dari "${ticket.status}" menjadi "${status}"`);
        updateData.status = status;
      }
      if (assignedToId && assignedToId !== ticket.assignedToId) {
        updateData.assignedToId = assignedToId;
        updateData.assignedToNama = assignedToNama || 'IT Support';
        changes.push(`Menetapkan penanggung jawab ke ${updateData.assignedToNama}`);
      }

      if (changes.length > 0) {
        historyItem = {
          id: 'his-' + Date.now() + Math.random().toString(36).substring(2, 5),
          laporanId: ticket.id,
          userId: req.user!.id,
          userNama: req.user!.nama,
          aksi: changes.join('. '),
          createdAt: new Date().toISOString()
        };
      }
    }

    const updated = await updateTicket(id, updateData, historyItem);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengupdate laporan' });
  }
});

app.delete(['/api/tickets/:id', '/tickets/:id'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Hanya Admin yang dapat menghapus laporan' });
    }
    const { id } = req.params;
    await deleteTicket(id);
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus laporan' });
  }
});

// Add Comment
app.post(['/api/tickets/:id/comments', '/tickets/:id/comments'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { komentar, lampiran } = req.body;

    if (!komentar || komentar.trim() === '') {
      return res.status(400).json({ error: 'Isi komentar tidak boleh kosong' });
    }

    const details = await getTicketById(id);
    if (!details) return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    const ticket = details.ticket;

    const newComment = {
      id: 'cmt-' + Date.now(),
      laporanId: ticket.id,
      userId: req.user!.id,
      userNama: req.user!.nama,
      userRole: req.user!.role,
      komentar,
      lampiran: lampiran || null,
      createdAt: new Date().toISOString()
    };

    const historyItem = {
      id: 'his-' + Date.now(),
      laporanId: ticket.id,
      userId: req.user!.id,
      userNama: req.user!.nama,
      aksi: `Menambahkan komentar`,
      createdAt: new Date().toISOString()
    };

    const result = await addCommentToTicket(newComment, historyItem);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambahkan komentar' });
  }
});

// Statistics Endpoint for Dashboard
app.get(['/api/stats', '/stats'], authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    let allTickets = await getAllTickets();
    if (req.user?.role === 'employee') {
      allTickets = allTickets.filter(t => t.userId === req.user?.id);
    }

    const total = allTickets.length;
    const baru = allTickets.filter(t => t.status === 'Baru').length;
    const diproses = allTickets.filter(t => t.status === 'Sedang Diproses').length;
    const konfirmasi = allTickets.filter(t => t.status === 'Menunggu Konfirmasi').length;
    const selesai = allTickets.filter(t => t.status === 'Selesai').length;
    const ditutup = allTickets.filter(t => t.status === 'Ditutup').length;

    const allCategories = await getAllCategories();
    const byCategory: Record<string, number> = {};
    allCategories.forEach(c => {
      byCategory[c.nama] = allTickets.filter(t => t.kategori === c.nama).length;
    });

    const byPriority: Record<string, number> = {
      Rendah: allTickets.filter(t => t.prioritas === 'Rendah').length,
      Sedang: allTickets.filter(t => t.prioritas === 'Sedang').length,
      Tinggi: allTickets.filter(t => t.prioritas === 'Tinggi').length,
      Kritis: allTickets.filter(t => t.prioritas === 'Kritis').length
    };

    const recentTickets = [...allTickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const allUsers = await getAllUsers();

    res.json({
      total,
      baru,
      diproses,
      konfirmasi,
      selesai,
      ditutup,
      byCategory,
      byPriority,
      recentTickets,
      totalUsers: allUsers.length,
      totalCategories: allCategories.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
});

// Vite & Production Static File Handler
async function startServer() {
  if (process.env.VERCEL) return;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Helpdesk IT berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
