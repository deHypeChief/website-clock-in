import axios from 'axios'

// API configuration and helper functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
})

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens or additional headers if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('employeeAuth')
      localStorage.removeItem('visitorAuth')
      const path = window.location.pathname
      // Avoid redirect loop if already on login/register pages
      const isAdminAuthPage = path === '/admin/login' || path === '/admin/register'
      if (path.startsWith('/admin') && !isAdminAuthPage) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// Employee API functions
export const employeeAPI = {
  // Register employee (admin only)
  register: async (employeeData) => {
    const response = await api.post('/employees/register', employeeData)
    return response.data
  },

  // Get all employees (admin only)
  getAll: async () => {
    const response = await api.get('/employees/admin/employees')
    return response.data
  },

  // Public list for kiosk/visitor
  getPublic: async (q) => {
    const url = q && q.trim() ? `/employees/public?q=${encodeURIComponent(q)}` : '/employees/public'
    const response = await api.get(url)
    return response.data
  },

  // Public: get a single employee status by employeeId
  getPublicStatus: async (employeeId, limit = 10) => {
    const params = new URLSearchParams({ employeeId, limit: String(limit) })
    const response = await api.get(`/attendance/employee/public-status?${params.toString()}`)
    return response.data
  },

  // Get employee by ID (admin only)
  getById: async (id) => {
    const response = await api.get(`/employees/admin/employees/${id}`)
    return response.data
  },

  // Update employee (admin only)
  update: async (id, data) => {
    const response = await api.patch(`/employees/admin/employees/${id}`, data)
    return response.data
  },

  // Delete employee (admin only)
  delete: async (id) => {
    const response = await api.delete(`/employees/admin/employees/${id}`)
    return response.data
  }
}

// Visitor API functions
export const visitorAPI = {
  // Register visitor
  register: async (visitorData) => {
    const response = await api.post('/visitors/register', visitorData)
    return response.data
  },

  // Sign in visitor
  signIn: async (email, password) => {
    const response = await api.post('/visitors/sign', { email, password })
    return response.data
  },

  // Get all visitors (admin only)
  getAll: async () => {
    const response = await api.get('/visitors/admin/visitors')
    return response.data
  },

  // Get visitor by ID (admin only)
  getById: async (id) => {
    const response = await api.get(`/visitors/admin/visitors/${id}`)
    return response.data
  },

  // Update visitor (admin only)
  update: async (id, data) => {
    const response = await api.patch(`/visitors/admin/visitors/${id}`, data)
    return response.data
  },

  // Delete visitor (admin only)
  delete: async (id) => {
    const response = await api.delete(`/visitors/admin/visitors/${id}`)
    return response.data
  }
}

// Attendance API functions
export const attendanceAPI = {
  // Employee kiosk clock (no auth) using employeeId, action optional (toggles if omitted)
  employeeKioskClock: async ({ employeeId, action }) => {
    const response = await api.post('/attendance/employee/kiosk-clock', { employeeId, action })
    return response.data
  },

  // Visitor clock in/out
  visitorClock: async (action, hostEmployeeId, visitType) => {
    const response = await api.post('/attendance/visitor/clock', { action, hostEmployeeId, visitType })
    return response.data
  },
  // Kiosk visitor clock (no auth) by email/name
  visitorKioskClock: async ({ email, name, action, hostEmployeeId, visitType }) => {
    const response = await api.post('/attendance/visitor/kiosk-clock', { email, name, action, hostEmployeeId, visitType })
    return response.data
  },
  // Visitor status by email (optionally scoped by visitType)
  visitorStatus: async (email, limit = 10, visitType) => {
    const params = new URLSearchParams({ email, limit: String(limit) })
    if (visitType) params.append('visitType', visitType)
    const response = await api.get(`/attendance/visitor/status?${params.toString()}`)
    return response.data
  },
  // Admin: force clock out a visitor (by actorId or email)
  adminForceVisitorClockOut: async ({ actorId, email, visitType }) => {
    const response = await api.post('/attendance/admin/visitor/force-clock-out', { actorId, email, visitType })
    return response.data
  },

  // Get attendance records (admin only)
  getRecords: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.actorType) params.append('actorType', filters.actorType)
    if (filters.actorId) params.append('actorId', filters.actorId)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)
    
    const response = await api.get(`/attendance/admin/records?${params}`)
    return response.data
  },

  // Get reports (admin only)
  getReports: async (reportType, filters = {}) => {
    const params = new URLSearchParams()
    params.append('type', reportType)
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key])
    })
    
    const response = await api.get(`/attendance/reports?${params}`)
    return response.data
  }
}

// Admin API functions
export const adminAPI = {
  // Sign in admin
  signIn: async (email, password) => {
    const response = await api.post('/admins/sign', { email, password })
    return response.data
  },

  // Register admin
  register: async (adminData) => {
    const response = await api.post('/admins/register?role=admin', adminData)
    return response.data
  },

  // Check if an admin already exists
  exists: async () => {
    const response = await api.get('/admins/exists')
    return response.data
  },

  // Password reset
  passwordReset: async (email) => {
    const response = await api.post('/admins/password-reset', { email })
    return response.data
  },

  // Password change
  passwordChange: async (currentPassword, newPassword) => {
    const response = await api.post('/admins/password-change', { currentPassword, newPassword })
    return response.data
  }
}

// Auth API functions
export const authAPI = {
  // Get auth status
  getAdminStatus: async () => {
    const response = await api.get('/auth/status/admin')
    return response.data
  },
  getVisitorStatus: async () => {
    const response = await api.get('/auth/status/visitor')
    return response.data
  },

  // Get sessions
  getSessions: async () => {
    const response = await api.get('/auth/sessions')
    return response.data
  },

  // Logout
  logout: async () => {
    // Backend defines logout as GET /auth/logout
    const response = await api.get('/auth/logout')
    return response.data
  }
}

// Settings API
export const settingsAPI = {
  getLateCutoff: async () => {
    const response = await api.get('/settings/late-cutoff')
    return response.data
  },
  setLateCutoff: async (lateCutoff) => {
    const response = await api.post('/settings/late-cutoff', { lateCutoff })
    return response.data
  }
}

export default api
