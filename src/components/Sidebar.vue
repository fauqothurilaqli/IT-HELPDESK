<template>
  <!-- Desktop Sidebar Navigation -->
  <aside class="desktop-sidebar hidden md:flex w-64 corporate-panel text-slate-300 flex-col h-full shrink-0 overflow-hidden border border-[#1f293d] bg-[#111827]">
    <!-- Brand Header -->
    <div class="h-16 flex items-center px-6 border-b border-[#1f293d] gap-3">
      <div class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
        <Headphones class="w-5 h-5 text-white" />
      </div>
      <div class="flex flex-col min-w-0">
        <h1 class="text-white font-bold tracking-tight text-sm truncate">IT HELPDESK</h1>
        <span class="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider truncate">Enterprise Console</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto no-scrollbar">
      <div class="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Menu Utama
      </div>

      <router-link
        to="/dashboard"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="isActive('/dashboard') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
      >
        <LayoutDashboard class="w-4 h-4" :class="isActive('/dashboard') ? 'text-indigo-400' : 'text-slate-400'" />
        <span>Dashboard</span>
      </router-link>

      <router-link
        to="/laporan"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="isActive('/laporan') && !isActive('/laporan/buat') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
      >
        <Ticket class="w-4 h-4" :class="isActive('/laporan') && !isActive('/laporan/buat') ? 'text-indigo-400' : 'text-slate-400'" />
        <span>Daftar Laporan</span>
      </router-link>

      <router-link
        v-if="!auth.isAdmin"
        to="/laporan/buat"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="isActive('/laporan/buat') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
      >
        <PlusCircle class="w-4 h-4 text-emerald-400" />
        <span>Buat Laporan</span>
      </router-link>

      <!-- Management Section (Admin / IT Support) -->
      <div v-if="auth.isITSupport" class="pt-5 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Pengelolaan
      </div>

      <router-link
        v-if="auth.isITSupport"
        to="/users"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="isActive('/users') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
      >
        <Users class="w-4 h-4" :class="isActive('/users') ? 'text-indigo-400' : 'text-slate-400'" />
        <span>Kelola User</span>
      </router-link>

      <router-link
        v-if="auth.isAdmin"
        to="/categories"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="isActive('/categories') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
      >
        <FolderTree class="w-4 h-4" :class="isActive('/categories') ? 'text-indigo-400' : 'text-slate-400'" />
        <span>Kategori</span>
      </router-link>
    </nav>

    <!-- User Profile Footer -->
    <div class="p-3.5 border-t border-[#1f293d] bg-[#0b0f19]/60">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-100 truncate">{{ auth.user?.nama }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span
              class="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold tracking-wider uppercase"
              :class="roleBadgeClass"
            >
              {{ roleLabel }}
            </span>
          </div>
        </div>
        <button
          @click="handleLogout"
          title="Keluar"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#172033] transition-colors"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile Off-Canvas Drawer -->
  <div v-if="isMobileOpen" class="fixed inset-0 z-50 md:hidden flex">
    <!-- Dark Backdrop -->
    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="$emit('close-mobile-menu')" />

    <!-- Drawer Body -->
    <div class="relative w-72 max-w-[85vw] bg-[#111827] text-slate-300 flex flex-col h-full z-10 border-r border-[#1f293d] shadow-2xl">
      <!-- Mobile Header with Close Button -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-[#1f293d]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <Headphones class="w-4 h-4 text-white" />
          </div>
          <div class="flex flex-col min-w-0">
            <h1 class="text-white font-bold tracking-tight text-sm truncate">IT HELPDESK</h1>
            <span class="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider truncate">Enterprise Console</span>
          </div>
        </div>
        <button
          @click="$emit('close-mobile-menu')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#172033]"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Mobile Navigation Menu -->
      <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto no-scrollbar" @click="$emit('close-mobile-menu')">
        <div class="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </div>

        <router-link
          to="/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="isActive('/dashboard') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
        >
          <LayoutDashboard class="w-4 h-4" :class="isActive('/dashboard') ? 'text-indigo-400' : 'text-slate-400'" />
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/laporan"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="isActive('/laporan') && !isActive('/laporan/buat') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
        >
          <Ticket class="w-4 h-4" :class="isActive('/laporan') && !isActive('/laporan/buat') ? 'text-indigo-400' : 'text-slate-400'" />
          <span>Daftar Laporan</span>
        </router-link>

        <router-link
          v-if="!auth.isAdmin"
          to="/laporan/buat"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="isActive('/laporan/buat') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
        >
          <PlusCircle class="w-4 h-4 text-emerald-400" />
          <span>Buat Laporan</span>
        </router-link>

        <!-- Management Section (Admin / IT Support) -->
        <div v-if="auth.isITSupport" class="pt-5 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengelolaan
        </div>

        <router-link
          v-if="auth.isITSupport"
          to="/users"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="isActive('/users') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
        >
          <Users class="w-4 h-4" :class="isActive('/users') ? 'text-indigo-400' : 'text-slate-400'" />
          <span>Kelola User</span>
        </router-link>

        <router-link
          v-if="auth.isAdmin"
          to="/categories"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="isActive('/categories') ? 'sidebar-active font-semibold shadow-sm text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-[#172033]'"
        >
          <FolderTree class="w-4 h-4" :class="isActive('/categories') ? 'text-indigo-400' : 'text-slate-400'" />
          <span>Kategori</span>
        </router-link>
      </nav>

      <!-- Mobile User Footer -->
      <div class="p-3.5 border-t border-[#1f293d] bg-[#0b0f19]/60">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-100 truncate">{{ auth.user?.nama }}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span
                class="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold tracking-wider uppercase"
                :class="roleBadgeClass"
              >
                {{ roleLabel }}
              </span>
            </div>
          </div>
          <button
            @click="handleLogout"
            title="Keluar"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#172033] transition-colors"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  Headphones,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  FolderTree,
  LogOut,
  X,
} from 'lucide-vue-next';

defineProps<{
  isMobileOpen?: boolean;
}>();

defineEmits(['close-mobile-menu']);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const isActive = (path: string) => route.path === path;

const userInitials = computed(() => {
  if (!auth.user?.nama) return 'US';
  return auth.user.nama
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
});

const roleLabel = computed(() => {
  return auth.isAdmin ? 'Admin System' : 'Employee';
});

const roleBadgeClass = computed(() => {
  return auth.isAdmin
    ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
    : 'bg-sky-900/60 text-sky-300 border border-sky-700/50';
});

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
@media (max-width: 767px) {
  .desktop-sidebar {
    display: none !important;
  }
}
</style>
