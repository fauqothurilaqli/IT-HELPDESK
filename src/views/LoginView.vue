<template>
  <div class="min-h-screen text-slate-100 flex items-center justify-center p-4 sm:p-6 relative">
    <div class="w-full max-w-lg space-y-8">
      <!-- Header -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/30 mb-2 ring-4 ring-indigo-500/20">
          <Headphones class="w-10 h-10" />
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">Sistem Laporan Kendala IT</h1>
        <p class="text-sm sm:text-base text-slate-400 font-medium">Enterprise IT Helpdesk Console</p>
      </div>

      <!-- Login Card -->
      <div class="corporate-panel p-8 sm:p-10 space-y-7 bg-[#111827] border border-[#1f293d] shadow-2xl rounded-2xl">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="auth.error" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-3">
            <AlertTriangle class="w-5 h-5 shrink-0" />
            <span>{{ auth.error }}</span>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Email Perusahaan
            </label>
            <div class="relative">
              <Mail class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                v-model="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                class="w-full pl-12 pr-4 py-3.5 bg-[#0b0f19] border border-[#26334d] rounded-xl text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Kata Sandi
            </label>
            <div class="relative">
              <Lock class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full pl-12 pr-4 py-3.5 bg-[#0b0f19] border border-[#26334d] rounded-xl text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            <Loader2 v-if="auth.loading" class="w-5 h-5 animate-spin" />
            <LogIn v-else class="w-5 h-5" />
            <span>{{ auth.loading ? 'Memproses...' : 'Masuk Portal' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Headphones, Mail, Lock, LogIn, Loader2, AlertTriangle } from 'lucide-vue-next';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await auth.login(email.value, password.value);
    router.push('/dashboard');
  } catch (err) {
    // Handled in store error
  }
}
</script>
