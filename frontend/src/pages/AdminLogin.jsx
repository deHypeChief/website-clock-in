import { useState, useEffect } from 'react'
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Shield, AlertCircle } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { adminAPI, authAPI } from '../lib/api'

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get the page the user was trying to access
  const from = location.state?.from?.pathname || '/admin'

  // Check if already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const statusResponse = await authAPI.getAdminStatus()
        if (statusResponse?.success && statusResponse?.data?.isAuthenticated) {
          // Keep a lightweight hint for UX only; server remains source of truth
          localStorage.setItem('adminAuth', 'true')
          navigate(from, { replace: true })
          return
        }
      } catch {
        // Ignore; user not authenticated on server
        localStorage.removeItem('adminAuth')
      }
    }

    checkExistingAuth()
  }, [from, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
  const response = await adminAPI.signIn(formData.email, formData.password)
      
      if (response.success) {
  // Optional UX hint; server session cookie is the source of truth
  localStorage.setItem('adminAuth', 'true')

        // Store additional user info if provided
        if (response.admin) {
          localStorage.setItem('adminInfo', JSON.stringify(response.admin))
        }

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberAdmin', 'true')
        }

        // Redirect to intended page
        navigate(from, { replace: true })
      } else {
        setError(response.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Login failed:', error)
      
      // Prefer API-provided error message when available
      const apiMsg = error.response?.data?.message || error.response?.data?.error || error.message
      setError(apiMsg || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  return (
    <div className="max-w-md mx-auto px-4">
      {/* Header */}
  <div className="mb-6 sm:mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="text-center">
          <div className="bg-blue-100 p-3 sm:p-4 rounded-full w-fit mx-auto mb-5 sm:mb-6">
            <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Access the admin dashboard to manage employees and attendance records.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Success Message for redirects */}
        {from !== '/admin' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="text-blue-700 text-sm">Please log in to access the admin dashboard.</span>
          </div>
        )}

  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                <span>Sign In to Admin Dashboard</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Registration Link */}
  <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an admin account?{' '}
          <Link to="/admin/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  )
}
