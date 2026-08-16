<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">Kelola Kategori Kendala</h1>
        <p class="text-xs text-slate-400">Atur kategori laporan IT helpdesk untuk mempermudah klasifikasi tiket</p>
      </div>

      <button
        v-if="auth.isAdmin"
        @click="openAddModal"
        class="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0"
      >
        <FolderPlus class="w-4 h-4" />
        <span>Tambah Kategori Baru</span>
      </button>
    </div>

    <!-- Category Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cat in store.categories"
        :key="cat.id"
        class="glass-panel p-5 space-y-3 relative group"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-3 h-3 rounded-full shadow-sm" :class="getColorDotClass(cat.warna)" />
            <h3 class="text-sm font-bold text-white">{{ cat.nama }}</h3>
          </div>
          <div class="flex items-center gap-1" v-if="auth.isAdmin">
            <button
              @click="openEditModal(cat)"
              class="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </button>
            <button
              @click="handleDelete(cat)"
              class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed min-h-[36px]">
          {{ cat.deskripsi || 'Tidak ada deskripsi' }}
        </p>

        <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <span class="text-slate-400 text-[11px]">Warna Tag: <strong class="capitalize text-slate-200">{{ cat.warna }}</strong></span>
          <span
            class="px-2 py-0.5 rounded text-[10px] font-semibold border"
            :class="cat.statusAktif ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10'"
          >
            {{ cat.statusAktif ? 'Aktif' : 'Non-Aktif' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Form Kategori -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="glass-panel max-w-md w-full p-6 space-y-5">
        <div class="flex justify-between items-center pb-3 border-b border-white/5">
          <h3 class="text-base font-bold text-white">
            {{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Nama Kategori</label>
            <input v-model="formNama" type="text" required placeholder="Contoh: Hardware, VPN, Database" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Deskripsi Ringkas</label>
            <textarea v-model="formDeskripsi" rows="3" placeholder="Penjelasan singkat kategori kendala ini..." class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Warna Tag</label>
            <select v-model="formWarna" class="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500">
              <option value="blue">Blue (Biru)</option>
              <option value="purple">Purple (Ungu)</option>
              <option value="emerald">Emerald (Hijau)</option>
              <option value="amber">Amber (Oranye)</option>
              <option value="rose">Rose (Merah)</option>
              <option value="indigo">Indigo (Nila)</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10">Batal</button>
            <button type="submit" class="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-500/20">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTicketsStore } from '../stores/tickets';
import { Category } from '../types';
import { FolderPlus, Edit3, Trash2, X } from 'lucide-vue-next';

const auth = useAuthStore();
const store = useTicketsStore();

const showModal = ref(false);
const isEditing = ref(false);
const editingCatId = ref<string | null>(null);

const formNama = ref('');
const formDeskripsi = ref('');
const formWarna = ref('blue');

onMounted(() => {
  store.fetchCategories();
});

function openAddModal() {
  isEditing.value = false;
  editingCatId.value = null;
  formNama.value = '';
  formDeskripsi.value = '';
  formWarna.value = 'blue';
  showModal.value = true;
}

function openEditModal(c: Category) {
  isEditing.value = true;
  editingCatId.value = c.id;
  formNama.value = c.nama;
  formDeskripsi.value = c.deskripsi;
  formWarna.value = c.warna;
  showModal.value = true;
}

async function saveCategory() {
  if (isEditing.value && editingCatId.value) {
    await store.updateCategory(editingCatId.value, {
      nama: formNama.value,
      deskripsi: formDeskripsi.value,
      warna: formWarna.value,
    });
  } else {
    await store.createCategory({
      nama: formNama.value,
      deskripsi: formDeskripsi.value,
      warna: formWarna.value,
    });
  }
  showModal.value = false;
}

async function handleDelete(c: Category) {
  if (confirm(`Apakah Anda yakin ingin menghapus kategori ${c.nama}?`)) {
    await store.deleteCategory(c.id);
  }
}

function getColorDotClass(warna: string) {
  switch (warna) {
    case 'blue': return 'bg-blue-500';
    case 'purple': return 'bg-purple-500';
    case 'emerald': return 'bg-emerald-500';
    case 'amber': return 'bg-amber-500';
    case 'rose': return 'bg-rose-500';
    case 'indigo': return 'bg-indigo-500';
    default: return 'bg-slate-500';
  }
}
</script>
