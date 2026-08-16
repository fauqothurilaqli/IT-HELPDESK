<template>
  <div class="space-y-6">
    <!-- Top Action Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">Daftar Laporan Kendala</h1>
        <p class="text-xs text-slate-400">Kelola dan pantau status seluruh kendala IT yang dilaporkan</p>
      </div>
      <router-link
        v-if="!auth.isAdmin"
        to="/laporan/buat"
        class="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0"
      >
        <span>Buat Laporan Baru</span>
      </router-link>
    </div>

    <!-- Filter & Search Controls -->
    <div class="glass-panel p-4 space-y-4">
      <!-- Status Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/5 no-scrollbar">
        <button
          v-for="st in statusTabs"
          :key="st"
          @click="selectedStatus = st"
          class="px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
          :class="selectedStatus === st ? 'bg-white/10 text-sky-400 border border-sky-500/30 font-bold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          {{ st }}
        </button>
      </div>

      <!-- Search and Secondary Filters -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <!-- Search Input -->
        <div class="md:col-span-6 relative">
          <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nomor tiket, judul, atau nama pelapor..."
            class="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        <!-- Kategori Filter -->
        <div class="md:col-span-3">
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-all"
          >
            <option value="Semua">Semua Kategori</option>
            <option v-for="cat in store.categories" :key="cat.id" :value="cat.nama">
              {{ cat.nama }}
            </option>
          </select>
        </div>

        <!-- Prioritas Filter -->
        <div class="md:col-span-3">
          <select
            v-model="selectedPriority"
            class="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-all"
          >
            <option value="Semua">Semua Prioritas</option>
            <option value="Rendah">Rendah</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Kritis">Kritis</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tickets Table -->
    <div class="glass-panel overflow-hidden">
      <div v-if="store.loading && store.tickets.length === 0" class="p-12 text-center text-slate-400 space-y-3">
        <Loader2 class="w-6 h-6 animate-spin mx-auto text-sky-400" />
        <p class="text-xs">Memuat data laporan kendala...</p>
      </div>

      <div v-else-if="filteredTickets.length === 0" class="p-12 text-center space-y-3">
        <TicketX class="w-10 h-10 text-slate-500 mx-auto" />
        <p class="text-sm font-semibold text-slate-200">Tidak ada laporan ditemukan</p>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          Coba sesuaikan kata kunci pencarian atau ganti filter status dan kategori.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="text-[10px] text-slate-400 uppercase tracking-widest bg-white/5">
            <tr class="border-b border-white/5">
              <th class="px-6 py-3 font-semibold">ID Tiket</th>
              <th class="px-6 py-3 font-semibold">Judul Kendala</th>
              <th class="px-6 py-3 font-semibold">Pelapor</th>
              <th class="px-6 py-3 font-semibold">Kategori</th>
              <th class="px-6 py-3 font-semibold">Prioritas</th>
              <th class="px-6 py-3 font-semibold">Status</th>
              <th class="px-6 py-3 font-semibold">Tanggal</th>
              <th class="px-6 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="text-sm text-slate-200 divide-y divide-white/5">
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="hover:bg-white/5 transition-colors"
            >
              <td class="px-6 py-4 font-mono text-sky-400 font-bold text-xs">
                {{ ticket.nomorLaporan }}
              </td>
              <td class="px-6 py-4 max-w-xs">
                <p class="font-semibold text-slate-100 line-clamp-1">{{ ticket.judul }}</p>
                <p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{{ ticket.deskripsi }}</p>
              </td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-semibold text-slate-200 text-xs">{{ ticket.userNama }}</p>
                  <p class="text-[10px] text-slate-500 uppercase">{{ ticket.userDepartemen }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-block px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 font-medium text-[11px]">
                  {{ ticket.kategori }}
                </span>
              </td>
              <td class="px-6 py-4">
                <PriorityBadge :priority="ticket.prioritas" />
              </td>
              <td class="px-6 py-4">
                <StatusBadge :status="ticket.status" />
              </td>
              <td class="px-6 py-4 text-[11px] text-slate-400">
                {{ formatDate(ticket.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="inline-flex items-center gap-1.5 justify-end">
                  <button
                    v-if="auth.isAdmin && ticket.status !== 'Selesai' && ticket.status !== 'Ditutup'"
                    @click="quickMarkDone(ticket.id)"
                    title="Tandai Selesai"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
                    <span>Selesaikan</span>
                  </button>
                  <router-link
                    :to="`/laporan/${ticket.id}`"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 font-semibold text-xs transition-colors"
                  >
                    <span>Lihat</span>
                    <ChevronRight class="w-3.5 h-3.5" />
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTicketsStore } from '../stores/tickets';
import StatusBadge from '../components/StatusBadge.vue';
import PriorityBadge from '../components/PriorityBadge.vue';
import {
  PlusCircle,
  Search,
  Loader2,
  TicketX,
  ChevronRight,
  CheckCircle2,
} from 'lucide-vue-next';

const auth = useAuthStore();
const store = useTicketsStore();

async function quickMarkDone(ticketId: string) {
  try {
    await store.updateTicket(ticketId, {
      status: 'Selesai',
      assignedToId: auth.user?.id,
      assignedToNama: auth.user?.nama,
    });
    loadTickets();
  } catch (e) {
    console.error('Gagal memperbarui tiket', e);
  }
}

const searchQuery = ref('');
const selectedStatus = ref('Semua');
const selectedCategory = ref('Semua');
const selectedPriority = ref('Semua');

const statusTabs = [
  'Semua',
  'Baru',
  'Sedang Diproses',
  'Menunggu Konfirmasi',
  'Selesai',
  'Ditutup',
];

onMounted(() => {
  store.fetchCategories();
  loadTickets();
});

watch([selectedStatus, selectedCategory, selectedPriority, searchQuery], () => {
  loadTickets();
});

function loadTickets() {
  store.fetchTickets({
    status: selectedStatus.value,
    kategori: selectedCategory.value,
    prioritas: selectedPriority.value,
    search: searchQuery.value,
  });
}

const filteredTickets = computed(() => store.tickets);

function formatDate(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
