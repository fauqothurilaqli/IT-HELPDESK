<template>
  <!-- ========================================== -->
  <!-- 1. ADMIN SYSTEM DASHBOARD                  -->
  <!-- ========================================== -->
  <div v-if="auth.isAdmin" class="space-y-6">
    <!-- Admin Header Console -->
    <div class="corporate-panel p-6 text-white relative overflow-hidden bg-[#111827] border border-[#1f293d]">
      <div class="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none flex items-center pr-8">
        <ShieldCheck class="w-64 h-64 text-indigo-400" />
      </div>
      <div class="relative z-10 max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
          <ShieldAlert class="w-3.5 h-3.5 text-indigo-400" />
          <span>Console Kendali Admin System</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-white">Selamat Datang, Admin {{ auth.user?.nama }}!</h1>
        <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
          Sebagai Admin System, Anda bertanggung jawab penuh untuk mengendalikan antrean tiket, menyelesaikan perbaikan kendala IT karyawan, mengelola akun user, dan mengatur kategori kendala.
        </p>
        <div class="pt-2 flex flex-wrap items-center gap-3">
          <router-link
            to="/laporan"
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <Ticket class="w-4 h-4" />
            <span>Kelola Antrean Tiket</span>
          </router-link>
          <router-link
            to="/users"
            class="bg-[#172033] hover:bg-[#1e293b] text-slate-200 border border-[#26334d] px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-2"
          >
            <Users class="w-4 h-4 text-indigo-400" />
            <span>Kelola User / Employee</span>
          </router-link>
          <router-link
            to="/categories"
            class="bg-[#172033] hover:bg-[#1e293b] text-slate-200 border border-[#26334d] px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-2"
          >
            <FolderTree class="w-4 h-4 text-amber-400" />
            <span>Kategori Kendala</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Admin Workload Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="glass-panel p-5 border-l-4 border-l-sky-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Tiket Baru (Masuk)</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-sky-400">{{ store.stats?.baru || 0 }}</span>
          <span class="text-sky-400 text-[11px] font-medium bg-sky-500/10 px-2 py-0.5 rounded">Perlu Action</span>
        </div>
      </div>

      <div class="glass-panel p-5 border-l-4 border-l-amber-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Sedang Dikerjakan</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-amber-400">{{ store.stats?.diproses || 0 }}</span>
          <span class="text-amber-400 text-[11px] font-medium bg-amber-500/10 px-2 py-0.5 rounded">Proses Perbaikan</span>
        </div>
      </div>

      <div class="glass-panel p-5 border-l-4 border-l-purple-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Menunggu Konfirmasi User</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-purple-400">{{ store.stats?.konfirmasi || 0 }}</span>
          <span class="text-purple-400 text-[11px] font-medium bg-purple-500/10 px-2 py-0.5 rounded">Verifikasi</span>
        </div>
      </div>

      <div class="glass-panel p-5 border-l-4 border-l-emerald-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Berhasil Diselesaikan</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-emerald-400">{{ (store.stats?.selesai || 0) + (store.stats?.ditutup || 0) }}</span>
          <span class="text-emerald-400 text-[11px] font-medium bg-emerald-500/10 px-2 py-0.5 rounded">Selesai</span>
        </div>
      </div>

      <div class="glass-panel p-5 border-l-4 border-l-indigo-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Total Karyawan</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-white">{{ store.stats?.totalUsers || 0 }}</span>
          <span class="text-slate-400 text-[11px]">Terdaftar</span>
        </div>
      </div>
    </div>

    <!-- Admin Interactive Quick Desk / Actionable Queue -->
    <div class="glass-panel p-6 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Wrench class="w-5 h-5 text-purple-400" />
            <span>Meja Penanganan Kendala IT (Aksi Langsung Admin)</span>
          </h3>
          <p class="text-xs text-slate-400">Ganti status atau mulai pengerjakan tiket langsung dari dashboard ini</p>
        </div>
        <router-link
          to="/laporan"
          class="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0"
        >
          <span>Lihat Seluruh Antrean</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="t in pendingTicketsForAdmin"
          :key="t.id"
          class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-mono text-sky-400 text-xs font-bold">{{ t.nomorLaporan }}</span>
              <PriorityBadge :priority="t.prioritas" />
            </div>
            <h4 class="text-sm font-bold text-white line-clamp-2">{{ t.judul }}</h4>
            <p class="text-xs text-slate-400 line-clamp-2">{{ t.deskripsi }}</p>
            <div class="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-white/5">
              <span>Pelapor: <strong class="text-slate-200">{{ t.userNama }}</strong> ({{ t.userDepartemen }})</span>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
            <StatusBadge :status="t.status" />
            <div class="flex items-center gap-1.5 flex-wrap justify-end">
              <button
                v-if="t.status === 'Baru'"
                @click="quickUpdateStatus(t, 'Sedang Diproses')"
                title="Mulai pengerjakan kendala"
                class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-[11px] font-semibold transition-all cursor-pointer"
              >
                Proses
              </button>
              <button
                v-if="t.status !== 'Selesai' && t.status !== 'Ditutup'"
                @click="quickUpdateStatus(t, 'Selesai')"
                title="Tandai kendala selesai ditangani"
                class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 class="w-3 h-3 text-emerald-400" />
                <span>Tandai Selesai</span>
              </button>
              <router-link
                :to="`/laporan/${t.id}`"
                class="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold transition-all"
              >
                Detail
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="pendingTicketsForAdmin.length === 0" class="col-span-full py-8 text-center text-slate-400 text-xs space-y-1">
          <CheckCircle2 class="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
          <p class="font-bold text-white">Semua laporan telah tertangani dengan baik!</p>
          <p>Tidak ada tiket baru yang tertunda saat ini.</p>
        </div>
      </div>
    </div>

    <!-- Analytics Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Category Distribution -->
      <div class="glass-panel p-6 space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <FolderTree class="w-4 h-4 text-sky-400" />
          <span>Sebaran Kategori Kendala IT</span>
        </h3>
        <div class="space-y-3">
          <div v-for="(count, catName) in store.stats?.byCategory" :key="catName" class="space-y-1">
            <div class="flex justify-between text-xs font-medium text-slate-300">
              <span>{{ catName }}</span>
              <span class="font-bold text-sky-400">{{ count }} tiket</span>
            </div>
            <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full bg-sky-500 rounded-full transition-all duration-500"
                :style="{ width: getPercentage(count, store.stats?.total || 1) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Distribution -->
      <div class="glass-panel p-6 space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-400" />
          <span>Tingkat Urgensi Laporan</span>
        </h3>
        <div class="space-y-3">
          <div v-for="(count, prioName) in store.stats?.byPriority" :key="prioName" class="space-y-1">
            <div class="flex justify-between text-xs font-medium text-slate-300">
              <span class="flex items-center gap-1.5">
                <PriorityBadge :priority="prioName" />
              </span>
              <span class="font-bold text-white">{{ count }} tiket</span>
            </div>
            <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getPriorityColorClass(prioName)"
                :style="{ width: getPercentage(count, store.stats?.total || 1) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- 2. EMPLOYEE DASHBOARD                      -->
  <!-- ========================================== -->
  <div v-else class="space-y-6">
    <!-- Employee Banner -->
    <div class="glass-panel p-6 text-white relative overflow-hidden bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-indigo-950/40 border border-sky-500/20">
      <div class="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
        <Headphones class="w-64 h-64 text-sky-400" />
      </div>
      <div class="relative z-10 max-w-2xl space-y-3">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400">
          <span>{{ greetingText }}</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Halo, {{ auth.user?.nama }}!</h1>
        <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
          Mengalami kendala pada komputer, koneksi WiFi, aplikasi kantor, atau akun SSO? Laporkan di sini agar segera ditangani oleh Admin System IT.
        </p>
        <div class="pt-2 flex items-center gap-3">
          <router-link
            to="/laporan/buat"
            class="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2"
          >
            <span>Buat Laporan Kendala Baru</span>
          </router-link>
          <router-link
            to="/laporan"
            class="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2"
          >
            <Ticket class="w-4 h-4 text-sky-400" />
            <span>Riwayat Laporan Saya</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Employee Ticket KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-5">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Total Laporan Saya</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-white">{{ store.stats?.total || 0 }}</span>
          <span class="text-slate-400 text-xs">Seluruh tiket</span>
        </div>
      </div>

      <div class="glass-panel p-5 border-l-4 border-l-sky-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Sedang Ditangani Admin</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-sky-400">{{ (store.stats?.baru || 0) + (store.stats?.diproses || 0) }}</span>
          <span class="text-sky-400 text-xs font-medium">Proses</span>
        </div>
      </div>

      <div class="glass-panel p-5 border-l-4 border-l-purple-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Menunggu Konfirmasi Saya</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-purple-400">{{ store.stats?.konfirmasi || 0 }}</span>
          <span class="text-purple-400 text-xs font-medium">Verifikasi</span>
        </div>
      </div>

      <div class="glass-panel p-5 border-l-4 border-l-emerald-500">
        <div class="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Terselesaikan</div>
        <div class="flex items-end justify-between">
          <span class="text-3xl font-bold text-emerald-400">{{ (store.stats?.selesai || 0) + (store.stats?.ditutup || 0) }}</span>
          <span class="text-emerald-400 text-xs font-medium">Selesai</span>
        </div>
      </div>
    </div>

    <!-- Quick Report Shortcuts -->
    <div class="space-y-3">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <Zap class="w-4 h-4 text-amber-400" />
        <span>Pilih Kategori Kendala Populer</span>
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <router-link
          to="/laporan/buat?kategori=Hardware"
          class="glass-panel p-4 hover:border-sky-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center space-y-2 group"
        >
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Monitor class="w-5 h-5" />
          </div>
          <span class="text-xs font-bold text-white">Hardware / Perangkat</span>
          <span class="text-[10px] text-slate-400">PC, Laptop, Printer, Monitor</span>
        </router-link>

        <router-link
          to="/laporan/buat?kategori=Network"
          class="glass-panel p-4 hover:border-emerald-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center space-y-2 group"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wifi class="w-5 h-5" />
          </div>
          <span class="text-xs font-bold text-white">Jaringan / WiFi</span>
          <span class="text-[10px] text-slate-400">Koneksi lambat, VPN, LAN</span>
        </router-link>

        <router-link
          to="/laporan/buat?kategori=Software"
          class="glass-panel p-4 hover:border-purple-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center space-y-2 group"
        >
          <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Code2 class="w-5 h-5" />
          </div>
          <span class="text-xs font-bold text-white">Software & Aplikasi</span>
          <span class="text-[10px] text-slate-400">Error, instalasi, lisensi</span>
        </router-link>

        <router-link
          to="/laporan/buat?kategori=Account"
          class="glass-panel p-4 hover:border-indigo-500/40 hover:bg-white/10 transition-all flex flex-col items-center text-center space-y-2 group"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCheck class="w-5 h-5" />
          </div>
          <span class="text-xs font-bold text-white">Akun & Email</span>
          <span class="text-[10px] text-slate-400">Lupa password, SSO, email</span>
        </router-link>
      </div>
    </div>

    <!-- Employee Recent Ticket Status Tracker -->
    <div class="glass-panel overflow-hidden">
      <div class="p-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-white">Status Laporan Kendala Saya</h3>
          <p class="text-xs text-slate-400">Pantau perkembangan penanganan tiket yang Anda ajukan</p>
        </div>
        <router-link
          to="/laporan"
          class="text-xs font-bold text-sky-400 hover:text-sky-300 uppercase tracking-widest flex items-center gap-1"
        >
          <span>Semua Laporan</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <div class="divide-y divide-white/5">
        <div v-if="!store.stats?.recentTickets || store.stats.recentTickets.length === 0" class="p-8 text-center text-slate-500 text-xs">
          Belum ada laporan kendala yang Anda ajukan.
        </div>
        <div
          v-for="ticket in store.stats?.recentTickets"
          :key="ticket.id"
          class="p-5 hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div class="space-y-1.5 max-w-xl">
            <div class="flex items-center gap-2">
              <span class="font-mono text-sky-400 font-bold text-xs">{{ ticket.nomorLaporan }}</span>
              <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[10px] font-semibold">
                {{ ticket.kategori }}
              </span>
              <PriorityBadge :priority="ticket.prioritas" />
            </div>
            <h4 class="text-sm font-bold text-white">{{ ticket.judul }}</h4>
            <p class="text-xs text-slate-400 line-clamp-1">{{ ticket.deskripsi }}</p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <StatusBadge :status="ticket.status" />
            <router-link
              :to="`/laporan/${ticket.id}`"
              class="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>Detail & Tanggapan</span>
              <ExternalLink class="w-3 h-3" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTicketsStore } from '../stores/tickets';
import StatusBadge from '../components/StatusBadge.vue';
import PriorityBadge from '../components/PriorityBadge.vue';
import { Ticket as TicketType } from '../types';
import {
  Headphones,
  PlusCircle,
  Ticket,
  FolderTree,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Users,
  Wrench,
  CheckCircle2,
  Zap,
  Monitor,
  Wifi,
  Code2,
  UserCheck,
} from 'lucide-vue-next';

const auth = useAuthStore();
const store = useTicketsStore();

onMounted(() => {
  store.fetchStats();
});

const pendingTicketsForAdmin = computed(() => {
  if (!store.stats?.recentTickets) return [];
  return store.stats.recentTickets.filter(t => t.status === 'Baru' || t.status === 'Sedang Diproses');
});

const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi ☀️';
  if (hour < 15) return 'Selamat Siang 🌤️';
  if (hour < 18) return 'Selamat Sore 🌇';
  return 'Selamat Malam 🌙';
});

async function quickUpdateStatus(ticket: TicketType, newStatus: string) {
  try {
    await store.updateTicket(ticket.id, {
      status: newStatus as any,
      assignedToId: auth.user?.id,
      assignedToNama: auth.user?.nama,
    });
    await store.fetchStats();
  } catch (e) {
    console.error('Gagal memperbarui status', e);
  }
}

function getPercentage(count: number, total: number) {
  if (!total) return 0;
  return Math.min(Math.round((count / total) * 100), 100);
}

function getPriorityColorClass(priority: string) {
  switch (priority) {
    case 'Rendah': return 'bg-slate-500';
    case 'Sedang': return 'bg-sky-500';
    case 'Tinggi': return 'bg-amber-500';
    case 'Kritis': return 'bg-rose-600';
    default: return 'bg-blue-500';
  }
}
</script>
