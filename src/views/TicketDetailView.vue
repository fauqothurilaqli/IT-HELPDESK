<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Back & Action Bar Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <router-link
          to="/laporan"
          class="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
              {{ ticket?.nomorLaporan }}
            </span>
            <StatusBadge v-if="ticket" :status="ticket.status" />
          </div>
          <h1 class="text-xl font-bold text-white tracking-tight mt-1">{{ ticket?.judul }}</h1>
        </div>
      </div>

      <!-- Action Buttons for Admin/IT Support/Owner -->
      <div class="flex items-center gap-2">
        <!-- Quick Resolve Button for Admin -->
        <button
          v-if="auth.isAdmin && ticket?.status !== 'Selesai' && ticket?.status !== 'Ditutup'"
          @click="markTicketAsSelesai"
          class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Tandai Laporan Selesai</span>
        </button>

        <!-- Delete Button for Admin -->
        <button
          v-if="auth.isAdmin"
          @click="handleDeleteTicket"
          class="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Hapus</span>
        </button>

        <!-- Edit Button for Employee (only when status = Baru) -->
        <button
          v-if="canEdit"
          @click="showEditModal = true"
          class="px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <Edit3 class="w-3.5 h-3.5" />
          <span>Edit Laporan</span>
        </button>
      </div>
    </div>

    <!-- Main Content 2-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Main Details & Comments & History -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Ticket Information Card -->
        <div class="glass-panel p-6 space-y-5">
          <!-- Metadata Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5 text-xs">
            <div class="flex items-center gap-2">
              <User class="w-4 h-4 text-sky-400" />
              <span class="font-bold text-white">{{ ticket?.userNama }}</span>
              <span class="text-slate-400">({{ ticket?.userDepartemen }})</span>
            </div>
            <div class="flex items-center gap-2 text-slate-400">
              <Clock class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ formatDate(ticket?.createdAt) }}</span>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Kendala</h3>
            <p class="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              {{ ticket?.deskripsi }}
            </p>
          </div>

          <!-- Attachments -->
          <div v-if="ticketLampiranList.length > 0" class="space-y-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lampiran Gambar</h3>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="(img, idx) in ticketLampiranList"
                :key="idx"
                @click="previewImage = img"
                class="w-24 h-24 rounded-xl border border-white/10 overflow-hidden group relative shadow-sm cursor-pointer"
              >
                <img :src="img" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                  <Eye class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments Thread Section -->
        <div class="glass-panel p-6 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare class="w-4 h-4 text-sky-400" />
              <span>Diskusi & Komentar ({{ comments.length }})</span>
            </h3>
          </div>

          <!-- Comments List -->
          <div class="space-y-4">
            <div v-if="comments.length === 0" class="py-6 text-center text-slate-500 text-xs">
              Belum ada komentar. Tuliskan pesan di bawah untuk memulai diskusi.
            </div>

            <div
              v-for="cmt in comments"
              :key="cmt.id"
              class="flex gap-3 text-xs"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white shrink-0 mt-0.5 text-xs shadow-sm">
                {{ cmt.userNama[0] }}
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">{{ cmt.userNama }}</span>
                    <span
                      class="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase"
                      :class="getRoleBadgeClass(cmt.userRole)"
                    >
                      {{ cmt.userRole }}
                    </span>
                  </div>
                  <span class="text-[10px] text-slate-400">{{ formatDate(cmt.createdAt) }}</span>
                </div>
                <p class="text-slate-200 bg-white/[0.02] p-3.5 rounded-xl border border-white/5 leading-relaxed">
                  {{ cmt.komentar }}
                </p>
                <div v-if="cmt.lampiran" class="pt-1">
                  <div @click="previewImage = cmt.lampiran" class="inline-block cursor-pointer group relative">
                    <img :src="cmt.lampiran" class="max-h-36 rounded-lg border border-white/10 object-cover group-hover:opacity-90 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Comment Input Box -->
          <form @submit.prevent="handleSendComment" class="pt-4 border-t border-white/5 space-y-3">
            <div>
              <textarea
                v-model="newCommentText"
                rows="3"
                required
                placeholder="Tuliskan balasan, instruksi, atau perkembangan kendala..."
                class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:bg-white/10 transition-all resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <label class="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer transition-colors text-xs font-semibold flex items-center gap-1.5">
                  <Paperclip class="w-3.5 h-3.5 text-sky-400" />
                  <span>Lampiran</span>
                  <input type="file" accept="image/*" @change="handleCommentAttachment" class="hidden" />
                </label>
                <span v-if="commentAttachment" class="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5" /> Foto dilampirkan
                </span>
              </div>

              <button
                type="submit"
                :disabled="sendingComment || !newCommentText.trim()"
                class="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send class="w-3.5 h-3.5" />
                <span>Kirim Balasan</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Activity History Timeline -->
        <div class="glass-panel p-6 space-y-4">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <History class="w-4 h-4 text-sky-400" />
            <span>Riwayat & Audit Log Tiket</span>
          </h3>

          <div class="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            <div
              v-for="h in history"
              :key="h.id"
              class="relative text-xs space-y-0.5"
            >
              <div class="absolute -left-6 top-0.5 w-3 h-3 rounded-full bg-sky-400 border-2 border-slate-900 shadow-sm" />
              <p class="font-semibold text-slate-200">{{ h.aksi }}</p>
              <p class="text-[10px] text-slate-400">{{ h.userNama }} • {{ formatDate(h.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Management Panel -->
      <div class="space-y-6">
        <!-- Control Card for IT Support / Admin -->
        <div class="glass-panel p-6 space-y-5">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Status & Penanganan</h3>

          <!-- Status Dropdown -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-300">Ubah Status Laporan</label>
            <select
              :value="ticket?.status"
              :disabled="!auth.isAdmin"
              @change="handleStatusChange"
              class="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
            >
              <option value="Baru">Baru</option>
              <option value="Sedang Diproses">Sedang Diproses</option>
              <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditutup">Ditutup</option>
            </select>
          </div>

          <!-- Priority Dropdown -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-300">Prioritas</label>
            <select
              :value="ticket?.prioritas"
              :disabled="!auth.isAdmin"
              @change="handlePriorityChange"
              class="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
            >
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Kritis">Kritis</option>
            </select>
          </div>

          <!-- Assigned Admin Specialist -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-300">Admin Penanggung Jawab</label>
            <select
              :value="ticket?.assignedToId || ''"
              :disabled="!auth.isAdmin"
              @change="handleAssigneeChange"
              class="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
            >
              <option value="">Belum Ditentukan</option>
              <option v-for="u in itStaffList" :key="u.id" :value="u.id">
                {{ u.nama }} (Admin)
              </option>
            </select>
          </div>

          <!-- Ticket Properties Table -->
          <div class="pt-4 border-t border-white/5 space-y-2.5 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Kategori:</span>
              <span class="font-bold text-white">{{ ticket?.kategori }}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Departemen:</span>
              <span class="font-bold text-white">{{ ticket?.userDepartemen }}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Dibuat:</span>
              <span class="font-semibold text-slate-300">{{ formatDate(ticket?.createdAt) }}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Diperbarui:</span>
              <span class="font-semibold text-slate-300">{{ formatDate(ticket?.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Ticket Modal (Employee only) -->
    <div v-if="showEditModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="glass-panel max-w-lg w-full p-6 space-y-5">
        <h3 class="text-base font-bold text-white">Edit Laporan Kendala</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Judul Kendala</label>
            <input v-model="editJudul" type="text" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Deskripsi</label>
            <textarea v-model="editDeskripsi" rows="4" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white"></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="showEditModal = false" class="px-4 py-2 border border-white/10 rounded-lg text-xs text-slate-300 hover:bg-white/10 font-semibold">Batal</button>
          <button @click="saveEdit" class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold">Simpan Perubahan</button>
        </div>
      </div>
    </div>

    <!-- Fullscreen Image Preview Lightbox Modal -->
    <div
      v-if="previewImage"
      @click="previewImage = null"
      class="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 cursor-zoom-out"
    >
      <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center" @click.stop>
        <button
          @click="previewImage = null"
          class="absolute -top-12 right-0 p-2 text-slate-300 hover:text-white bg-white/10 rounded-full transition-colors"
        >
          <X class="w-6 h-6" />
        </button>
        <img :src="previewImage" class="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTicketsStore } from '../stores/tickets';
import { compressImage } from '../utils/image';
import StatusBadge from '../components/StatusBadge.vue';
import {
  ArrowLeft,
  Trash2,
  Edit3,
  User,
  Clock,
  Eye,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Send,
  History,
  X,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const store = useTicketsStore();

const ticketId = route.params.id as string;
const newCommentText = ref('');
const commentAttachment = ref<string | null>(null);
const sendingComment = ref(false);
const previewImage = ref<string | null>(null);

const showEditModal = ref(false);
const editJudul = ref('');
const editDeskripsi = ref('');

onMounted(async () => {
  store.fetchUsers();
  try {
    const detail = await store.fetchTicketDetail(ticketId);
    editJudul.value = detail.ticket.judul;
    editDeskripsi.value = detail.ticket.deskripsi;
  } catch {
    router.push('/laporan');
  }
});

const ticket = computed(() => store.currentDetail?.ticket);
const comments = computed(() => store.currentDetail?.comments || []);
const history = computed(() => store.currentDetail?.history || []);

const ticketLampiranList = computed<string[]>(() => {
  const l = ticket.value?.lampiran;
  if (!l) return [];
  if (Array.isArray(l)) return l;
  if (typeof l === 'string') {
    try {
      const parsed = JSON.parse(l);
      if (Array.isArray(parsed)) return parsed;
      return [l];
    } catch {
      return [l];
    }
  }
  return [];
});

const canEdit = computed(() => {
  if (!ticket.value) return false;
  return ticket.value.userId === auth.user?.id && ticket.value.status === 'Baru';
});

const itStaffList = computed(() => {
  return store.users.filter(u => u.role === 'admin');
});

function handleStatusChange(e: Event) {
  const newStatus = (e.target as HTMLSelectElement).value as any;
  store.updateTicket(ticketId, { status: newStatus });
}

function handlePriorityChange(e: Event) {
  const newPrio = (e.target as HTMLSelectElement).value as any;
  store.updateTicket(ticketId, { prioritas: newPrio });
}

function handleAssigneeChange(e: Event) {
  const assigneeId = (e.target as HTMLSelectElement).value;
  const staff = store.users.find(u => u.id === assigneeId);
  store.updateTicket(ticketId, {
    assignedToId: assigneeId,
    assignedToNama: staff ? staff.nama : '',
  });
}

async function handleCommentAttachment(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files?.[0]) return;
  try {
    const compressed = await compressImage(target.files[0]);
    commentAttachment.value = compressed;
  } catch {
    alert('Gagal memproses file gambar');
  }
  target.value = '';
}

async function handleSendComment() {
  if (!newCommentText.value.trim()) return;
  sendingComment.value = true;
  try {
    await store.addComment(ticketId, newCommentText.value, commentAttachment.value || undefined);
    newCommentText.value = '';
    commentAttachment.value = null;
  } catch (err: any) {
    alert('Gagal mengirim komentar');
  } finally {
    sendingComment.value = false;
  }
}

async function markTicketAsSelesai() {
  if (!ticket.value) return;
  try {
    await store.updateTicket(ticketId, {
      status: 'Selesai',
      assignedToId: auth.user?.id,
      assignedToNama: auth.user?.nama,
    });
    await store.addComment(ticketId, 'Laporan kendala telah berhasil diselesaikan oleh Admin System.');
  } catch (e) {
    alert('Gagal memperbarui status laporan.');
  }
}

async function handleDeleteTicket() {
  if (confirm('Apakah Anda yakin ingin menghapus laporan kendala ini?')) {
    await store.deleteTicket(ticketId);
    router.push('/laporan');
  }
}

async function saveEdit() {
  await store.updateTicket(ticketId, {
    judul: editJudul.value,
    deskripsi: editDeskripsi.value,
  });
  showEditModal.value = false;
}

function getRoleBadgeClass(r: string) {
  if (r === 'admin') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
  if (r === 'it_support') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
  return 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
}

function formatDate(iso?: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
