import { useState } from 'react'
import { UserPlus, Mail, Eye, EyeOff, ArrowLeft, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { adminAPI } from '../lib/api'

export default function AdminRegister() {
  const [formData, setFormData] = useState({ 
    name: '',
    email: '', 
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Please fill in all fields'
      })
      setLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid email address'
      })
      setLoading(false)
      return
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/
    if (formData.password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long'
      })
      setLoading(false)
      return
    }

    if (!passwordRegex.test(formData.password)) {
      setMessage({
        type: 'error',
        text: 'Password must include uppercase, lowercase, number, and special character'
      })
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      })
      setLoading(false)
      return
    }

    try {
      const response = await adminAPI.register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password
      })
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Admin account created successfully! Redirecting to login...'
        })
        
        setTimeout(() => {
          navigate('/admin/login')
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Registration failed'
        })
      }
    } catch (error) {
      console.error('Registration failed:', error)
      const apiMsg = error.response?.data?.message || error.response?.data?.error || error.message
      setMessage({ type: 'error', text: apiMsg || 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' })
  }

  return (
    <div className="max-w-md mx-auto px-4">
      {/* Header */}
  <div className="mb-6 sm:mb-8">
        <Link 
          to="/admin/login" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>
        
        <div className="text-center">
          <div className="bg-blue-100 p-3 sm:p-4 rounded-full w-fit mx-auto mb-5 sm:mb-6">
            <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Create Admin Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Set up your admin account to manage the attendance system.
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-start space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <span className={`text-sm ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {message.text}
            </span>
          </div>
        )}

  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
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
              Password *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Create a password"
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
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
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
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Admin Account</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Login Link */}
  <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an admin account?{' '}
          <Link to="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
