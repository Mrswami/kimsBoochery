// ══════════════════════════════════════════════════════════════
// KIMBOOCHERLY — API Configuration & Service Layer
// ══════════════════════════════════════════════════════════════
// Centralized API management for all external service integrations
// ══════════════════════════════════════════════════════════════

import axios from 'axios'

// ── API Keys (loaded from environment variables) ────────────────
export const API_KEYS = {
  FIREBASE_API_KEY:     import.meta.env.VITE_FIREBASE_API_KEY     || '',
  GOOGLE_MAPS_KEY:     import.meta.env.VITE_GOOGLE_MAPS_KEY      || '',
  OPENAI_API_KEY:      import.meta.env.VITE_OPENAI_API_KEY       || '',
  STRIPE_PUBLIC_KEY:   import.meta.env.VITE_STRIPE_PUBLIC_KEY    || '',
  ANALYTICS_KEY:       import.meta.env.VITE_ANALYTICS_KEY        || '',
  GITHUB_TOKEN:        import.meta.env.VITE_GITHUB_TOKEN         || '',
}

// ── Axios Instance with defaults ────────────────────────────────
export const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ── Request Interceptor (attach auth tokens) ────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kb_auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor (error handling) ───────────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      console.warn('[KimBoocherly] Auth token expired — redirecting to login')
      localStorage.removeItem('kb_auth_token')
    }
    if (status === 429) {
      console.warn('[KimBoocherly] Rate limited — backing off')
    }
    return Promise.reject(error)
  }
)

// ── API Endpoints ───────────────────────────────────────────────
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:    '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH:  '/api/auth/refresh',
    LOGOUT:   '/api/auth/logout'
  },
  USERS: {
    PROFILE:  '/api/users/profile',
    UPDATE:   '/api/users/update',
    SETTINGS: '/api/users/settings'
  },
  DATA: {
    FETCH:    '/api/data/fetch',
    CREATE:   '/api/data/create',
    UPDATE:   '/api/data/update',
    DELETE:   '/api/data/delete'
  },
  ANALYTICS: {
    EVENTS:   '/api/analytics/events',
    METRICS:  '/api/analytics/metrics',
    REPORTS:  '/api/analytics/reports'
  }
}

// ── Service Functions ───────────────────────────────────────────
export const ApiService = {
  async fetchDashboardData() {
    return apiClient.get(API_ENDPOINTS.DATA.FETCH)
  },
  async updateUserProfile(data) {
    return apiClient.put(API_ENDPOINTS.USERS.UPDATE, data)
  },
  async trackEvent(eventName, payload = {}) {
    return apiClient.post(API_ENDPOINTS.ANALYTICS.EVENTS, {
      event: eventName,
      timestamp: Date.now(),
      ...payload
    })
  },
  async getMetrics(range = '7d') {
    return apiClient.get(`${API_ENDPOINTS.ANALYTICS.METRICS}?range=${range}`)
  }
}

export default ApiService
