<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-white tracking-tight">Kelola Pengguna</h1>
        <p class="text-xs text-slate-400">Manajemen akun pengguna, hak akses role, dan departemen karyawan</p>
      </div>

      <button
        v-if="auth.isAdmin"
        @click="openAddModal"
        class="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0"
      >
        <UserPlus class="w-4 h-4" />
        <span>Tambah User Baru</span>
      </button>
    </div>

    <!-- Users Table Card -->
    <div class="glass-panel overflow-hidden">
      <!-- Role Filter Tabs -->
      <div class="p-4 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
        <button
          v-for="r in ['Semua', 'employee', 'admin']"
          :key="r"
          @click="roleFilter = r"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
          :class="roleFilter === r ? 'bg-white/10 text-sky-400 border border-sky-500/30 font-bold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          {{ r === 'Semua' ? 'Semua Role' : (r === 'admin' ? 'Admin System' : 'Employee') }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="text-[10px] text-slate-400 uppercase tracking-widest bg-white/5">
            <tr class="border-b border-white/5">
              <th class="px-6 py-3 font-semibold">Nama & Email</th>
              <th class="px-6 py-3 font-semibold">Role</th>
              <th class="px-6 py-3 font-semibold">Departemen</th>
              <th class="px-6 py-3 font-semibold">Terdaftar</th>
              <th class="px-6 py-3 font-semibold text-right" v-if="auth.isAdmin">Aksi</th>
            </tr>
          </thead>
          <tbody class="text-sm text-slate-200 divide-y divide-white/5">
            <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-white/5 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0">
                    {{ u.nama[0] }}
                  </div>
                  <div>
                    <p class="font-bold text-white text-xs">{{ u.nama }}</p>
                    <p class="text-[11px] text-slate-400">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border"
                  :class="getRoleClass(u.role)"
                >
                  {{ u.role.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-6 py-4 font-medium text-slate-300 text-xs">
                {{ u.departemen || '-' }}
              </td>
              <td class="px-6 py-4 text-slate-400 text-[11px]">
                {{ formatDate(u.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right space-x-1" v-if="auth.isAdmin">
                <button
                  @click="openEditModal(u)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-colors"
                  title="Edit User"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
                <button
                  v-if="u.id !== auth.user?.id"
                  @click="handleDelete(u)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Hapus User"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form User (Add / Edit) -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="glass-panel max-w-md w-full p-6 space-y-5">
        <div class="flex justify-between items-center pb-3 border-b border-white/5">
          <h3 class="text-base font-bold text-white">
            {{ isEditing ? 'Edit User' : 'Tambah User Baru' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveUser" class="space-y-4">
          <div v-if="formError" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {{ formError }}
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Nama Lengkap</label>
            <input v-model="formNama" type="text" required class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Email Kantor</label>
            <input v-model="formEmail" type="email" required class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">
              {{ isEditing ? 'Password Baru (Kosongkan jika tidak diganti)' : 'Password' }}
            </label>
            <input v-model="formPassword" type="password" :required="!isEditing" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Role</label>
              <select v-model="formRole" class="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500">
                <option value="employee">Employee</option>
                <option value="admin">Admin System</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Departemen</label>
              <input v-model="formDepartemen" type="text" required placeholder="Contoh: Finance" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
            </div>
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useTicketsStore } from '../stores/tickets';
import { User } from '../types';
import { UserPlus, Edit3, Trash2, X } from 'lucide-vue-next';

const auth = useAuthStore();
const store = useTicketsStore();

const roleFilter = ref('Semua');
const showModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref<string | null>(null);

const formNama = ref('');
const formEmail = ref('');
const formPassword = ref('');
const formRole = ref<'employee' | 'it_support' | 'admin'>('employee');
const formDepartemen = ref('');
const formError = ref<string | null>(null);

onMounted(() => {
  store.fetchUsers();
});

const filteredUsers = computed(() => {
  if (roleFilter.value === 'Semua') return store.users;
  return store.users.filter(u => u.role === roleFilter.value);
});

function openAddModal() {
  isEditing.value = false;
  editingUserId.value = null;
  formNama.value = '';
  formEmail.value = '';
  formPassword.value = '';
  formRole.value = 'employee';
  formDepartemen.value = 'Umum';
  formError.value = null;
  showModal.value = true;
}

function openEditModal(u: User) {
  isEditing.value = true;
  editingUserId.value = u.id;
  formNama.value = u.nama;
  formEmail.value = u.email;
  formPassword.value = '';
  formRole.value = u.role;
  formDepartemen.value = u.departemen;
  formError.value = null;
  showModal.value = true;
}

async function saveUser() {
  formError.value = null;
  try {
    if (isEditing.value && editingUserId.value) {
      await store.updateUser(editingUserId.value, {
        nama: formNama.value,
        email: formEmail.value,
        password: formPassword.value || undefined,
        role: formRole.value,
        departemen: formDepartemen.value,
      });
    } else {
      await store.createUser({
        nama: formNama.value,
        email: formEmail.value,
        password: formPassword.value,
        role: formRole.value,
        departemen: formDepartemen.value,
      });
    }
    showModal.value = false;
  } catch (err: any) {
    formError.value = err.message || 'Gagal menyimpan data user';
  }
}

async function handleDelete(u: User) {
  if (confirm(`Apakah Anda yakin ingin menghapus user ${u.nama}?`)) {
    await store.deleteUser(u.id);
  }
}

function getRoleClass(r: string) {
  if (r === 'admin') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  if (r === 'it_support') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
}

function formatDate(iso?: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
</script>
