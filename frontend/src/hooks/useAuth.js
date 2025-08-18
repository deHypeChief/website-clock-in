import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null) // 'admin', 'employee', 'visitor'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication
    const adminAuth = localStorage.getItem('adminAuth')
    const employeeAuth = localStorage.getItem('employeeAuth')
    const visitorAuth = localStorage.getItem('visitorAuth')

    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      setUserType('admin')
    } else if (employeeAuth) {
      setIsAuthenticated(true)
      setUserType('employee')
    } else if (visitorAuth) {
      setIsAuthenticated(true)
      setUserType('visitor')
    }

    setLoading(false)
  }, [])

  const login = (type, data = {}) => {
    localStorage.setItem(`${type}Auth`, type === 'admin' ? 'true' : JSON.stringify(data))
    setIsAuthenticated(true)
    setUserType(type)
  }

  const logout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('employeeAuth')
    localStorage.removeItem('visitorAuth')
    setIsAuthenticated(false)
    setUserType(null)
  }

  return {
    isAuthenticated,
    userType,
    loading,
    login,
    logout
  }
}

export default useAuth
