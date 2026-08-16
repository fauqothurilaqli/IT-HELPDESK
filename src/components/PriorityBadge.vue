<template>
  <span :class="['inline-flex items-center text-xs font-semibold', style.textClass]">
    <span :class="['priority-dot', style.dotClass]" />
    <span>{{ priority }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TicketPriority } from '../types';

const props = defineProps<{
  priority: TicketPriority | string;
}>();

const style = computed(() => {
  switch (props.priority) {
    case 'Rendah':
      return {
        textClass: 'text-slate-300',
        dotClass: 'bg-emerald-500',
      };
    case 'Sedang':
      return {
        textClass: 'text-sky-300',
        dotClass: 'bg-sky-500',
      };
    case 'Tinggi':
      return {
        textClass: 'text-amber-300',
        dotClass: 'bg-amber-500',
      };
    case 'Kritis':
      return {
        textClass: 'text-rose-400 font-bold',
        dotClass: 'bg-rose-500 animate-pulse',
      };
    default:
      return {
        textClass: 'text-slate-300',
        dotClass: 'bg-slate-400',
      };
  }
});
</script>
