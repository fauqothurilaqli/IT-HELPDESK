<template>
  <span :class="['status-pill inline-flex items-center gap-1.5 border', badgeStyle.class]">
    <component :is="badgeStyle.icon" class="w-3.5 h-3.5" />
    <span>{{ status }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TicketStatus } from '../types';
import { AlertCircle, Clock, HelpCircle, CheckCircle2, Lock } from 'lucide-vue-next';

const props = defineProps<{
  status: TicketStatus | string;
}>();

const badgeStyle = computed(() => {
  switch (props.status) {
    case 'Baru':
      return {
        class: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        icon: AlertCircle,
      };
    case 'Sedang Diproses':
      return {
        class: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        icon: Clock,
      };
    case 'Menunggu Konfirmasi':
      return {
        class: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: HelpCircle,
      };
    case 'Selesai':
      return {
        class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: CheckCircle2,
      };
    case 'Ditutup':
      return {
        class: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        icon: Lock,
      };
    default:
      return {
        class: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        icon: AlertCircle,
      };
  }
});
</script>
