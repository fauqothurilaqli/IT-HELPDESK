import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Ticket, Category, Comment, TicketHistory, DashboardStats, TicketDetailResponse, User } from '../types';
import { apiRequest } from '../api';

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([]);
  const categories = ref<Category[]>([]);
  const users = ref<User[]>([]);
  const stats = ref<DashboardStats | null>(null);
  const currentDetail = ref<TicketDetailResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStats() {
    try {
      stats.value = await apiRequest<DashboardStats>('/stats');
    } catch (err: any) {
      error.value = err.message;
    }
  }

  async function fetchTickets(params?: { status?: string; kategori?: string; prioritas?: string; search?: string }) {
    if (tickets.value.length === 0) {
      loading.value = true;
    }
    error.value = null;
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.kategori) queryParams.append('kategori', params.kategori);
      if (params?.prioritas) queryParams.append('prioritas', params.prioritas);
      if (params?.search) queryParams.append('search', params.search);

      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
      tickets.value = await apiRequest<Ticket[]>(`/tickets${queryStr}`);
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTicketDetail(id: string) {
    if (!currentDetail.value || currentDetail.value.ticket.id !== id) {
      loading.value = true;
    }
    error.value = null;
    try {
      currentDetail.value = await apiRequest<TicketDetailResponse>(`/tickets/${id}`);
      return currentDetail.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createTicket(payload: {
    judul: string;
    deskripsi: string;
    kategori: string;
    prioritas: string;
    lampiran?: string[];
  }) {
    loading.value = true;
    try {
      const newTicket = await apiRequest<Ticket>('/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchTickets();
      await fetchStats();
      return newTicket;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateTicket(id: string, payload: Partial<Ticket>) {
    try {
      const updated = await apiRequest<Ticket>(`/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (currentDetail.value && currentDetail.value.ticket.id === id) {
        await fetchTicketDetail(id);
      }
      await fetchTickets();
      await fetchStats();
      return updated;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteTicket(id: string) {
    try {
      await apiRequest(`/tickets/${id}`, { method: 'DELETE' });
      await fetchTickets();
      await fetchStats();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  async function addComment(ticketId: string, komentar: string, lampiran?: string) {
    try {
      const newComment = await apiRequest<Comment>(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ komentar, lampiran }),
      });
      await fetchTicketDetail(ticketId);
      await fetchStats();
      return newComment;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  // Category Actions
  async function fetchCategories() {
    try {
      categories.value = await apiRequest<Category[]>('/categories');
    } catch (err: any) {
      error.value = err.message;
    }
  }

  async function createCategory(payload: { nama: string; deskripsi: string; warna: string }) {
    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchCategories();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateCategory(id: string, payload: Partial<Category>) {
    try {
      await apiRequest(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await fetchCategories();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteCategory(id: string) {
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE' });
      await fetchCategories();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  // Users Actions
  async function fetchUsers() {
    try {
      users.value = await apiRequest<User[]>('/users');
    } catch (err: any) {
      error.value = err.message;
    }
  }

  async function createUser(payload: Partial<User> & { password: string }) {
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchUsers();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateUser(id: string, payload: Partial<User> & { password?: string }) {
    try {
      await apiRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await fetchUsers();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  async function deleteUser(id: string) {
    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      await fetchUsers();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    tickets,
    categories,
    users,
    stats,
    currentDetail,
    loading,
    error,
    fetchStats,
    fetchTickets,
    fetchTicketDetail,
    createTicket,
    updateTicket,
    deleteTicket,
    addComment,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
});
