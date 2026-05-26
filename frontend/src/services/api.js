const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE_URL + path, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  // Token expiré ou invalide → déconnexion automatique
  // On ne redirige que si l'utilisateur avait un token (session expirée en cours de navigation)
  // Pas si c'était une requête non authentifiée (ex: appel depuis la landing page)
  if (res.status === 401 || res.status === 403) {
    if (token) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    throw new Error(data.message || 'Session expirée')
  }

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyTwoFA: (body) => request('/auth/verify-2fa', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getProfile: () => request('/auth/profile'),
  getOrganizations: () => request('/auth/organizations'),
  changePassword: (body) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  updateEmail: (body) => request('/auth/update-email', { method: 'PUT', body: JSON.stringify(body) }),
  updateName: (body) => request('/auth/update-name', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  detectFiliere: (name) => request(`/auth/detect-filiere?name=${encodeURIComponent(name)}`),

  // Jobs
  getJobsSummary: () => request('/jobs/summary'),
  getJobsList: () => request('/jobs'),
  getJobStats: (jobId) => request(`/jobs/${jobId}/statistics`),
  incrementView: (jobId) => request(`/jobs/${jobId}/view`, { method: 'POST' }),
  addLike: (jobId) => request(`/jobs/${jobId}/like`, { method: 'POST' }),
  revokeLike: (jobId) => request(`/jobs/${jobId}/like`, { method: 'DELETE' }),
  createJob: (body) => request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateJob: (jobId, body) => request(`/jobs/${jobId}/details`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteJob: (jobId) => request(`/jobs/${jobId}`, { method: 'DELETE' }),

  // Physical Objects / Scans
  getPhysicalObjectsSummary: () => request('/physical-objects/summary'),
  getPhysicalObjects: () => request('/physical-objects'),

  // Activity Logs
  getActivityLogs: () => request('/activity-logs'),

  // Contents
  getContents: () => request('/contents'),
  getContentsStats: () => request('/contents/stats'),
  getVideoStats: () => request('/contents/video-stats'),
  importContentsFromJobo: () => request('/contents/import-from-jobo', { method: 'POST' }),

  // Synchro Verrerie
  cleanAndReimportJobs: () => request('/jobs/clean-and-reimport', { method: 'POST' }),

  // Tickets
  createTicket: (body) => request('/tickets', { method: 'POST', body: JSON.stringify(body) }),
  getUserTickets: () => request('/tickets'),
  getTicketById: (id) => request(`/tickets/${id}`),

  // Subscriptions
  getMySubscription: () => request('/subscriptions/my'),
  createCheckoutSession: (plan, from = 'profile') => request('/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ plan, from }) }),
  cancelMySubscription: () => request('/subscriptions/my', { method: 'DELETE' }),
  verifyCheckoutSession: (sessionId) => request(`/subscriptions/verify-session?session_id=${sessionId}`),

  // JOBO real data
  getJoboStats: () => request('/jobo/stats'),

  // Admin
  adminGetStats: () => request('/admin/stats'),
  adminGetUsers: () => request('/admin/users'),
  adminUpdateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminGetTickets: () => request('/admin/tickets'),
  adminUpdateTicketStatus: (id, status) => request(`/admin/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminReplyToTicket: (id, reply) => request(`/admin/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ reply }) }),
}
