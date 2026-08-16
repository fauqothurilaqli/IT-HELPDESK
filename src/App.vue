<template>
  <!-- Full screen layout for Login page -->
  <div v-if="isLoginPage" class="min-h-screen bg-[#0b0f19] font-sans text-slate-100 antialiased flex items-center justify-center relative p-3 sm:p-4">
    <router-view />
  </div>

  <!-- Authenticated Application Layout -->
  <div v-else class="flex h-screen bg-[#0b0f19] font-sans text-slate-100 antialiased overflow-hidden p-2 sm:p-3 md:p-4 gap-3 md:gap-4 relative">
    <!-- Sidebar Navigation -->
    <Sidebar :is-mobile-open="isMobileMenuOpen" @close-mobile-menu="isMobileMenuOpen = false" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden gap-3 md:gap-4">
      <!-- Navbar -->
      <Navbar :title="pageTitle" @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen" />

      <!-- Scrollable View Page Body -->
      <main class="flex-1 overflow-y-auto no-scrollbar space-y-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';

const route = useRoute();
const auth = useAuthStore();

const isMobileMenuOpen = ref(false);

onMounted(() => {
  auth.checkAuth();
});

const isLoginPage = computed(() => route.path === '/login');

const pageTitle = computed(() => {
  switch (route.name) {
    case 'dashboard':
      return 'Dashboard Overview';
    case 'laporan':
      return 'Daftar Laporan Kendala';
    case 'laporan-buat':
      return 'Buat Laporan Kendala';
    case 'laporan-detail':
      return 'Detail & Penanganan Laporan';
    case 'users':
      return 'Pengelolaan User & Hak Akses';
    case 'categories':
      return 'Pengelolaan Kategori IT';
    default:
      return 'IT Helpdesk System';
  }
});
</script>

<style>
@import "tailwindcss";

/* Custom utility for clean scrollbars */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
