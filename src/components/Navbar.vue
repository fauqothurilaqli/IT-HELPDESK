<template>
  <header class="h-16 corporate-panel px-4 md:px-6 flex items-center justify-between shrink-0 border border-[#1f293d] bg-[#111827]">
    <div class="flex items-center gap-3">
      <!-- Mobile Menu Toggle Button -->
      <button
        @click="$emit('toggle-mobile-menu')"
        class="md:hidden p-2 rounded-lg bg-[#172033] text-slate-300 hover:text-white border border-[#26334d]"
        title="Toggle Menu"
      >
        <Menu class="w-5 h-5" />
      </button>

      <h2 class="text-base md:text-lg font-semibold text-slate-100 tracking-tight truncate">{{ title }}</h2>
    </div>

    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Refresh Data Button -->
      <button
        @click="handleRefresh"
        :disabled="isRefreshing"
        title="Refresh Data"
        class="p-2 rounded-lg bg-[#172033] hover:bg-[#1e293b] text-slate-300 hover:text-white border border-[#26334d] transition-all flex items-center gap-1.5 text-xs font-semibold"
      >
        <RefreshCw class="w-4 h-4 text-sky-400" :class="{ 'animate-spin': isRefreshing }" />
        <span class="hidden sm:inline">Refresh</span>
      </button>

      <!-- Department Badge -->
      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#172033] border border-[#26334d] text-xs text-slate-300 font-medium">
        <Building2 class="w-3.5 h-3.5 text-indigo-400" />
        <span>{{ auth.user?.departemen || 'Umum' }}</span>
      </div>

      <!-- Quick Create Button -->
      <router-link
        v-if="!auth.isAdmin"
        to="/laporan/buat"
        class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all shadow-sm flex items-center gap-1.5"
      >
        <span>+ Laporan Baru</span>
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTicketsStore } from '../stores/tickets';
import { Building2, Menu, RefreshCw } from 'lucide-vue-next';

defineProps<{
  title: string;
}>();

defineEmits(['toggle-mobile-menu']);

const auth = useAuthStore();
const route = useRoute();
const ticketsStore = useTicketsStore();
const isRefreshing = ref(false);

async function handleRefresh() {
  isRefreshing.value = true;
  try {
    await ticketsStore.fetchStats();
    if (route.name === 'laporan') {
      await ticketsStore.fetchTickets();
    } else if (route.name === 'laporan-detail' && route.params.id) {
      await ticketsStore.fetchTicketDetail(route.params.id as string);
    }
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 400);
  }
}
</script>
