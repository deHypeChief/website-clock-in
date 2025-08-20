import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, AlertTriangle } from 'lucide-react'
import { authAPI } from '../lib/api'

export default function ProtectedRoute({ children, requireAuth = 'admin' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Always verify with server first
        let status
        if (requireAuth === 'admin') status = await authAPI.getAdminStatus()
  // Employee auth removed; no server check for employee
  else if (requireAuth === 'employee') status = { success: false, data: { isAuthenticated: false } }
        else if (requireAuth === 'visitor') status = await authAPI.getVisitorStatus()

        if (status?.success && status?.data?.isAuthenticated) {
          setIsAuthenticated(true)
          // Set a lightweight hint for smoother UX; cookies remain the source of truth
          localStorage.setItem(`${requireAuth}Auth`, requireAuth === 'admin' ? 'true' : JSON.stringify(status.data[requireAuth]))
        } else {
          // Fallback: attempt to use localStorage only if present (best-effort)
          const localAuth = localStorage.getItem(`${requireAuth}Auth`)
          if (requireAuth === 'admin' && localAuth === 'true') setIsAuthenticated(true)
          else if (requireAuth !== 'admin' && localAuth) {
            try {
              const authData = JSON.parse(localAuth)
              if (authData && (authData.id || authData.email)) setIsAuthenticated(true)
            } catch {
              // ignore parse errors for optional localStorage fallback
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        // Treat 401 as normal unauthenticated state (not an error)
        const status = error?.response?.status
        if (status === 401) {
          setIsAuthenticated(false)
          setAuthError('')
          setIsLoading(false)
          return
        }
        console.error('Auth check failed:', error)
        setAuthError('Authentication verification failed')
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth, location])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    // Only admin and visitor are supported; employee flow redirects to kiosk
    if (requireAuth === 'admin') {
      return <Navigate to={'/admin/login'} state={{ from: location }} replace />
    }
    if (requireAuth === 'visitor') {
      return <Navigate to={'/visitor/login'} state={{ from: location }} replace />
    }
    if (requireAuth === 'employee') {
      return <Navigate to={'/employee'} replace />
    }
  }

  // Authenticated - show protected content
  return (
    <div className="relative">
      {/* Auth status indicator */}
      <div className="fixed top-4 right-4 z-40 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span>Authenticated as {requireAuth}</span>
      </div>
      {children}
    </div>
  )
}
