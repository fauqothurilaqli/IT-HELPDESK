import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User } from '../types';
import { apiRequest } from '../api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(sessionStorage.getItem('user') || 'null'));
  const token = ref<string | null>(sessionStorage.getItem('token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const role = computed(() => user.value?.role || 'employee');
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isITSupport = computed(() => user.value?.role === 'admin');

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await apiRequest<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      token.value = data.token;
      user.value = data.user;
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      error.value = err.message || 'Login gagal';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkAuth() {
    if (!token.value) return;
    try {
      const data = await apiRequest<{ user: User }>('/auth/me');
      user.value = data.user;
      sessionStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      logout();
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    role,
    isAdmin,
    isITSupport,
    login,
    checkAuth,
    logout,
  };
});
