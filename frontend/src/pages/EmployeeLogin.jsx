import { useState, useEffect } from 'react'
import { User, Mail, Eye, EyeOff, ArrowLeft, UserCheck, AlertCircle } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { employeeAPI } from '../lib/api'

export default function EmployeeLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/employee'

  // Check if already authenticated
  useEffect(() => {
    const checkExistingAuth = async () => {
      const existingAuth = localStorage.getItem('employeeAuth')
      if (existingAuth) {
        try {
          const authData = JSON.parse(existingAuth)
          if (authData && authData.id) {
            navigate(from, { replace: true })
            return
          }
        } catch {
          localStorage.removeItem('employeeAuth')
        }
      }
    }

    checkExistingAuth()
  }, [from, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await employeeAPI.signIn(formData.email, formData.password)
      
      if (response.success) {
        // Store employee auth data
        const authData = {
          id: response.employee?.id,
          email: formData.email,
          name: response.employee?.sessionClientId?.fullName || formData.email,
          employeeId: response.employee?.employeeId,
          department: response.employee?.department,
          signInTime: new Date().toISOString()
        }
        
        localStorage.setItem('employeeAuth', JSON.stringify(authData))
        navigate(from, { replace: true })
      } else {
        setError(response.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Employee login failed:', error)
      
      if (error.response?.status === 401) {
        setError('Invalid email or password')
      } else if (error.response?.status === 429) {
        setError('Too many login attempts. Please try again later.')
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
          <div className="bg-green-100 p-3 sm:p-4 rounded-full w-fit mx-auto mb-5 sm:mb-6">
            <User className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Employee Login
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign in to access your employee portal and clock in/out.
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

        {/* Info Message for redirects */}
        {from !== '/employee' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
            <UserCheck className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="text-blue-700 text-sm">Please log in to access the employee portal.</span>
          </div>
        )}

  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Work Email Address
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                placeholder="Enter your work email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            } text-white`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                <span>Sign In to Employee Portal</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link 
            to="/admin/login" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Are you an admin? Login here
          </Link>
        </div>
      </div>
    </div>
  )
}
