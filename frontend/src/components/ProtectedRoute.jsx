import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, AlertTriangle } from 'lucide-react'

export default function ProtectedRoute({ children, requireAuth = 'admin' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first for quick auth check
        const localAuth = localStorage.getItem(`${requireAuth}Auth`)
        
        if (!localAuth) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // For admin, just check if the key exists and is 'true'
        if (requireAuth === 'admin' && localAuth === 'true') {
          setIsAuthenticated(true)
        } 
        // For employee/visitor, check if valid JSON data exists
        else if (requireAuth !== 'admin') {
          try {
            const authData = JSON.parse(localAuth)
            if (authData && (authData.id || authData.email)) {
              setIsAuthenticated(true)
            }
          } catch (parseError) {
            console.error('Failed to parse auth data:', parseError)
            setAuthError('Invalid authentication data')
          }
        }

        setIsLoading(false)
      } catch (error) {
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
    const loginPath = requireAuth === 'admin' ? '/admin/login' : `/${requireAuth}/login`
    return <Navigate to={loginPath} state={{ from: location }} replace />
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
