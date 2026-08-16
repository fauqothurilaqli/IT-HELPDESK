<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Back Header -->
    <div class="flex items-center gap-3">
      <router-link
        to="/laporan"
        class="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
      </router-link>
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">Buat Laporan Kendala IT</h1>
        <p class="text-xs text-slate-400">Isi formulir berikut dengan detail untuk bantuan tim IT Support</p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="glass-panel p-6 sm:p-8 space-y-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="error" class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ error }}</span>
        </div>

        <!-- Judul -->
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Judul Kendala <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="judul"
            type="text"
            required
            placeholder="Contoh: Laptop mati mendadak saat charge / Printer macet"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:bg-white/10 transition-all"
          />
        </div>

        <!-- Kategori & Prioritas Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Kategori -->
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Kategori Kendala <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="kategori"
              required
              class="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-all"
            >
              <option value="" disabled>Pilih Kategori</option>
              <option v-for="cat in store.categories" :key="cat.id" :value="cat.nama">
                {{ cat.nama }} - {{ cat.deskripsi }}
              </option>
            </select>
          </div>

          <!-- Prioritas -->
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tingkat Prioritas <span class="text-rose-400">*</span>
            </label>
            <select
              v-model="prioritas"
              required
              class="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-all"
            >
              <option value="Rendah">Rendah (Pertanyaan umum / Tidak mengganggu kerja)</option>
              <option value="Sedang">Sedang (Kendala minor / Ada alternatif)</option>
              <option value="Tinggi">Tinggi (Mengganggu aktivitas kerja harian)</option>
              <option value="Kritis">Kritis (Sistem down / Kerusakan mendesak)</option>
            </select>
          </div>
        </div>

        <!-- Deskripsi -->
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Deskripsi Kendala Lengkap <span class="text-rose-400">*</span>
          </label>
          <textarea
            v-model="deskripsi"
            rows="5"
            required
            placeholder="Jelaskan secara rinci kronologi kendala, pesan error yang muncul, lokasi perangkat, atau langkah yang sudah dicoba..."
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:bg-white/10 transition-all resize-y"
          ></textarea>
        </div>

        <!-- Attachment Dropzone / File Picker -->
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Lampiran Foto / Screenshot (Opsional)
          </label>
          <div class="border-2 border-dashed border-white/10 hover:border-sky-400 rounded-2xl p-6 text-center bg-white/[0.02] hover:bg-white/5 transition-all cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              @change="handleFileUpload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div class="space-y-2 pointer-events-none">
              <UploadCloud class="w-8 h-8 text-sky-400 mx-auto" />
              <p class="text-xs font-semibold text-slate-200">Klik atau seret file gambar ke sini</p>
              <p class="text-[11px] text-slate-400">PNG, JPG, JPEG hingga 5MB</p>
            </div>
          </div>

          <!-- Uploaded Previews -->
          <div v-if="lampiranList.length > 0" class="mt-4 flex flex-wrap gap-3">
            <div
              v-for="(img, idx) in lampiranList"
              :key="idx"
              class="relative w-20 h-20 rounded-xl border border-white/10 overflow-hidden group shadow-sm"
            >
              <img :src="img" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeLampiran(idx)"
                class="absolute top-1 right-1 p-1 rounded-full bg-slate-900/90 text-white hover:bg-rose-500 transition-colors"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
          <router-link
            to="/laporan"
            class="px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 text-xs font-semibold transition-colors"
          >
            Batal
          </router-link>
          <button
            type="submit"
            :disabled="submitting"
            class="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4" />
            <span>{{ submitting ? 'Mengirim...' : 'Kirim Laporan Kendala' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTicketsStore } from '../stores/tickets';
import { compressImage } from '../utils/image';
import {
  ArrowLeft,
  AlertCircle,
  UploadCloud,
  X,
  Send,
  Loader2,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const store = useTicketsStore();

const judul = ref('');
const kategori = ref('');
const prioritas = ref('Sedang');
const deskripsi = ref('');
const lampiranList = ref<string[]>([]);
const submitting = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  if (auth.isAdmin) {
    router.push('/dashboard');
    return;
  }
  await store.fetchCategories();

  const queryKategori = route.query.kategori as string | undefined;
  if (queryKategori) {
    const matched = store.categories.find(
      c => c.nama.toLowerCase() === queryKategori.toLowerCase()
    );
    if (matched) {
      kategori.value = matched.nama;
      return;
    }
  }

  if (store.categories.length > 0 && !kategori.value) {
    kategori.value = store.categories[0].nama;
  }
});

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const files = Array.from(target.files);
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`Ukuran file "${file.name}" melebihi batas 10MB`);
      continue;
    }
    try {
      const compressed = await compressImage(file);
      lampiranList.value.push(compressed);
    } catch {
      alert(`Gagal memproses file "${file.name}"`);
    }
  }
  target.value = '';
}

function removeLampiran(idx: number) {
  lampiranList.value.splice(idx, 1);
}

async function handleSubmit() {
  if (!judul.value || !kategori.value || !deskripsi.value) {
    error.value = 'Mohon lengkapi seluruh kolom bertanda bintang';
    return;
  }

  submitting.value = true;
  error.value = null;

  try {
    const ticket = await store.createTicket({
      judul: judul.value,
      kategori: kategori.value,
      prioritas: prioritas.value,
      deskripsi: deskripsi.value,
      lampiran: lampiranList.value,
    });
    router.push(`/laporan/${ticket.id}`);
  } catch (err: any) {
    error.value = err.message || 'Gagal membuat laporan';
  } finally {
    submitting.value = false;
  }
}
</script>
