import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Search,
  Filter,
  Download,
  X,
  Save
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { employeeAPI, attendanceAPI, authAPI, settingsAPI } from '../lib/api'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [employees, setEmployees] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [visitorRecords, setVisitorRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [lateCutoff, setLateCutoff] = useState('09:00')
  const [savingLate, setSavingLate] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
  title: ''
  })

  // Pagination state
  const [employeesPage, setEmployeesPage] = useState(1)
  const [employeesPageSize, setEmployeesPageSize] = useState(10)
  const [attendancePage, setAttendancePage] = useState(1)
  const [attendancePageSize, setAttendancePageSize] = useState(10)
  const [visitorsPage, setVisitorsPage] = useState(1)
  const [visitorsPageSize, setVisitorsPageSize] = useState(10)

  // Compute which visitor records are the latest and currently clocked-in
  const activeVisitorLatestIds = useMemo(() => {
    // Track latest by composite key: actorId + visitType
    const latestByKey = new Map()
    for (const r of visitorRecords) {
      const actorId = r?.actorId?._id || (typeof r?.actorId === 'string' ? r.actorId : undefined)
      const vType = r?.visitType || 'regular'
      if (!actorId) continue
      const key = `${actorId}::${vType}`
      if (!latestByKey.has(key)) {
        // Records are sorted desc by timestamp from API; first seen is latest for that type
        latestByKey.set(key, r)
      }
    }
    const ids = new Set()
    latestByKey.forEach((r) => {
      if (r?.action === 'IN') ids.add(r._id)
    })
    return ids
  }, [visitorRecords])

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth')
    if (!isAuthenticated) {
      navigate('/admin/login')
    }
  }, [navigate])

  // Load data from APIs
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load settings
  try {
          const s = await settingsAPI.getLateCutoff()
          if (s?.success && s?.data?.lateCutoff) setLateCutoff(s.data.lateCutoff)
  } catch { /* ignore settings load error */ }

        // Load employees
        const employeesResponse = await employeeAPI.getAll()
        if (employeesResponse.success && employeesResponse.data) {
          setEmployees(employeesResponse.data)
        } else {
          console.warn('Failed to load employees:', employeesResponse.message)
          setEmployees([])
        }

        // Load attendance records
        const attendanceResponse = await attendanceAPI.getRecords()
        if (attendanceResponse.success && attendanceResponse.data) {
          setAttendanceRecords(attendanceResponse.data)
          setVisitorRecords(attendanceResponse.data.filter(record => record.actorType === 'visitor'))
        } else {
          console.warn('Failed to load attendance records:', attendanceResponse.message)
          setAttendanceRecords([])
          setVisitorRecords([])
        }
      } catch (error) {
        console.error('Failed to load admin data:', error)
        setMessage({
          type: 'error',
          text: 'Failed to load data. Please check your connection and try again.'
        })
        
        // Set empty arrays instead of mock data
        setEmployees([])
        setAttendanceRecords([])
        setVisitorRecords([])
        
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Refresh data function
  const refreshData = async () => {
    setIsLoading(true)
    try {
      // Load employees
      const employeesResponse = await employeeAPI.getAll()
      if (employeesResponse.success && employeesResponse.data) {
        setEmployees(employeesResponse.data)
      } else {
        setEmployees([])
      }

      // Load attendance records
      const attendanceResponse = await attendanceAPI.getRecords()
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendanceRecords(attendanceResponse.data)
        setVisitorRecords(attendanceResponse.data.filter(record => record.actorType === 'visitor'))
      } else {
        setAttendanceRecords([])
        setVisitorRecords([])
      }

      setMessage({
        type: 'success',
        text: 'Data refreshed successfully!'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Failed to refresh data:', error)
      setMessage({
        type: 'error',
        text: 'Failed to refresh data. Please try again.'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const saveLateCutoff = async () => {
    setSavingLate(true)
    try {
      const r = await settingsAPI.setLateCutoff(lateCutoff)
      if (r.success) {
        setMessage({ type: 'success', text: 'Late time saved' })
        setTimeout(() => setMessage({ type: '', text: '' }), 2000)
      } else {
        throw new Error(r.message || 'Failed to save late time')
      }
  } catch {
      setMessage({ type: 'error', text: 'Failed to save late time' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } finally {
      setSavingLate(false)
    }
  }

  const isLateClockIn = (record) => {
    try {
      if (record?.actorType !== 'employee' || record?.action !== 'IN') return false
      const ts = new Date(record.timestamp)
      const hh = String(ts.getHours()).padStart(2, '0')
      const mm = String(ts.getMinutes()).padStart(2, '0')
      const hhmm = `${hh}:${mm}`
      return hhmm > lateCutoff
    } catch {
      return false
    }
  }

  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showAddEmployeeModal) {
        handleCloseModal()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showAddEmployeeModal])

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?')
    if (!confirmLogout) return

    setIsLoggingOut(true)
    try {
      // Call logout API to invalidate session on server
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local storage regardless of API response
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminInfo')
      localStorage.removeItem('rememberAdmin')
      
      // Show a brief message before redirect
      setMessage({
        type: 'success',
        text: 'Successfully logged out. Redirecting...'
      })
      
      setTimeout(() => {
        navigate('/admin/login', { replace: true })
        setIsLoggingOut(false)
      }, 1000)
    }
  }

  // Export functions
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle nested objects and escape commas
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          return `"${String(value || '').replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportAttendanceData = async () => {
    setIsExporting(true)
    try {
      const exportData = filteredAttendance.map(record => ({
        'Name': record.actorType === 'employee' 
          ? record?.actorId?.sessionClientId?.fullName || 'Unknown Employee'
          : record?.actorId?.name || 'Unknown Visitor',
        'Type': record.actorType === 'employee' ? 'Employee' : 'Visitor',
        'Action': record?.action || 'UNKNOWN',
        'Date': new Date(record?.timestamp || Date.now()).toLocaleDateString(),
        'Time': new Date(record?.timestamp || Date.now()).toLocaleTimeString(),
        'Timestamp': record?.timestamp || Date.now()
      }))
      
      const filename = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`
      exportToCSV(exportData, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportVisitorLog = async () => {
    setIsExporting(true)
    try {
      const exportData = visitorRecords.map(record => ({
        'Visitor Name': record?.actorId?.name || 'Unknown Visitor',
        'Visit Type': record?.visitType || 'regular',
        'Host Employee': record?.visitType === 'inspection' 
          ? 'Inspection' 
          : (record?.hostEmployeeId?.sessionClientId?.fullName || 'Unknown Host'),
        'Action': record?.action || 'UNKNOWN',
        'Date': new Date(record?.timestamp || Date.now()).toLocaleDateString(),
        'Time': new Date(record?.timestamp || Date.now()).toLocaleTimeString(),
        'Company': record?.actorId?.company || 'N/A',
        'Purpose': record?.actorId?.purpose || 'N/A',
        'Phone': record?.actorId?.phone || 'N/A',
        'Timestamp': record?.timestamp || Date.now()
      }))
      
      const filename = `visitor-log-${new Date().toISOString().split('T')[0]}.csv`
      exportToCSV(exportData, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportEmployeeList = async () => {
    setIsExporting(true)
    try {
      const exportData = filteredEmployees.map(employee => ({
        'Name': employee?.sessionClientId?.fullName || 'Unknown Employee',
        'Email': employee?.sessionClientId?.email || 'No email',
        'Employee ID': employee?.employeeId || 'N/A',
        'Department': employee?.department || 'N/A',
        'Title': employee?.title || 'N/A',
        'Created Date': new Date(employee?.createdAt || Date.now()).toLocaleDateString()
      }))
      
      const filename = `employee-list-${new Date().toISOString().split('T')[0]}.csv`
      exportToCSV(exportData, filename)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Employee management functions
  const handleAddEmployee = () => {
    setShowAddEmployeeModal(true)
  }

  const handleCloseModal = () => {
    setShowAddEmployeeModal(false)
    setNewEmployee({
      name: '',
      email: '',
      employeeId: '',
      department: '',
  title: ''
    })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitEmployee = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!newEmployee.name || !newEmployee.email) {
        setMessage({
          type: 'error',
          text: 'Please fill in name and email'
        })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmployee.email)) {
        setMessage({
          type: 'error',
          text: 'Please enter a valid email address'
        })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        return
      }

  // No password required

      // Generate employee ID if not provided
      const employeeId = newEmployee.employeeId || `EMP${Date.now().toString().slice(-6)}`

  // Create employee payload (flat fields as expected by API)
  const employeePayload = {
        fullName: newEmployee.name,
        email: newEmployee.email,
        employeeId: employeeId,
        department: newEmployee.department || 'General',
        title: newEmployee.title || 'Employee'
      }

      const response = await employeeAPI.register(employeePayload)
      
      if (response.success) {
        // Refresh employee list
        await refreshData()

        setMessage({
          type: 'success',
          text: `Employee ${newEmployee.name} added successfully!`
        })
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
          handleCloseModal()
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to create employee')
      }
    } catch (error) {
      console.error('Add employee failed:', error)
      const apiMsg = error.response?.data?.message || error.response?.data?.error || error.message
      setMessage({
        type: 'error',
        text: `Failed to add employee: ${apiMsg}`
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit employee function
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setNewEmployee({
      name: employee?.sessionClientId?.fullName || '',
      email: employee?.sessionClientId?.email || '',
      employeeId: employee?.employeeId || '',
      department: employee?.department || '',
  title: employee?.title || ''
    })
    setShowEditEmployeeModal(true)
  }

  // Update employee function
  const handleUpdateEmployee = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!newEmployee.name || !newEmployee.email) {
        setMessage({
          type: 'error',
          text: 'Please fill in name and email'
        })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmployee.email)) {
        setMessage({
          type: 'error',
          text: 'Please enter a valid email address'
        })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
        return
      }

      // Validate password if provided: at least 8 chars, at least 1 upper, 1 lower, 1 number, 1 special
      if (newEmployee.password && newEmployee.password.trim().length > 0) {
        const pwd = newEmployee.password.trim()
        const lengthOk = pwd.length >= 8
        const compositionOk = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(pwd)
        if (!lengthOk || !compositionOk) {
          setMessage({
            type: 'error',
            text: 'Password must be at least 8 characters and include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
          })
          setTimeout(() => setMessage({ type: '', text: '' }), 4000)
          return
        }
      }

      // Update employee payload
      const updatePayload = {
        sessionClientId: {
          name: newEmployee.name,
          email: newEmployee.email,
          ...(newEmployee.password && { password: newEmployee.password })
        },
        employeeId: newEmployee.employeeId,
        department: newEmployee.department,
        title: newEmployee.title
      }

      const response = await employeeAPI.update(editingEmployee._id, updatePayload)
      
      if (response.success) {
        // Refresh employee list
        await refreshData()

        setMessage({
          type: 'success',
          text: `Employee ${newEmployee.name} updated successfully!`
        })
        
        setTimeout(() => {
          setMessage({ type: '', text: '' })
          handleCloseEditModal()
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to update employee')
      }
    } catch (error) {
      console.error('Update employee failed:', error)
      const apiMsg = error.response?.data?.message || error.response?.data?.error || error.message
      setMessage({
        type: 'error',
        text: `Failed to update employee: ${apiMsg}`
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete employee function
  const handleDeleteEmployee = async (employee) => {
  if (!window.confirm(`Are you sure you want to delete ${employee?.sessionClientId?.fullName || 'this employee'}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await employeeAPI.delete(employee._id)
      
      if (response.success) {
        // Remove from local state
        setEmployees(prev => prev.filter(emp => emp._id !== employee._id))
        
        setMessage({
          type: 'success',
          text: `Employee ${employee?.sessionClientId?.fullName || 'record'} deleted successfully!`
        })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        throw new Error(response.message || 'Failed to delete employee')
      }
    } catch (error) {
      console.error('Delete employee failed:', error)
      const apiMsg = error.response?.data?.message || error.response?.data?.error || error.message
      setMessage({
        type: 'error',
        text: `Failed to delete employee: ${apiMsg}`
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  // Close edit modal function
  const handleCloseEditModal = () => {
    setShowEditEmployeeModal(false)
    setEditingEmployee(null)
    setNewEmployee({
      name: '',
      email: '',
      employeeId: '',
      department: '',
  title: ''
    })
  }

  const filteredEmployees = employees.filter(emp => {
    const name = emp?.sessionClientId?.fullName || '';
    const employeeId = emp?.employeeId || '';
    const department = emp?.department || '';
    
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })

  const filteredAttendance = attendanceRecords.filter(record => {
    const matchesSearch = searchTerm === '' || (() => {
      if (record.actorType === 'employee') {
        const employeeName = record?.actorId?.sessionClientId?.fullName || '';
        return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        const visitorName = record?.actorId?.name || '';
        return visitorName.toLowerCase().includes(searchTerm.toLowerCase());
      }
    })();
    
    const matchesDate = dateFilter === '' || 
      new Date(record.timestamp).toISOString().split('T')[0] === dateFilter
    
    return matchesSearch && matchesDate
  })

  // Filter visitors by search
  const filteredVisitors = visitorRecords.filter((record) => {
    if (!searchTerm) return true
    const visitorName = record?.actorId?.name || ''
    return visitorName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Reset pages when filters change
  useEffect(() => {
    setEmployeesPage(1)
    setAttendancePage(1)
    setVisitorsPage(1)
  }, [searchTerm, dateFilter])

  // Reset pages when page size changes
  useEffect(() => { setEmployeesPage(1) }, [employeesPageSize])
  useEffect(() => { setAttendancePage(1) }, [attendancePageSize])
  useEffect(() => { setVisitorsPage(1) }, [visitorsPageSize])

  // Paginated slices
  const employeesTotal = filteredEmployees.length
  const employeesTotalPages = Math.max(1, Math.ceil(employeesTotal / employeesPageSize))
  const employeesStart = (employeesPage - 1) * employeesPageSize
  const employeesEnd = employeesStart + employeesPageSize
  const employeesPageData = filteredEmployees.slice(employeesStart, employeesEnd)

  const attendanceTotal = filteredAttendance.length
  const attendanceTotalPages = Math.max(1, Math.ceil(attendanceTotal / attendancePageSize))
  const attendanceStart = (attendancePage - 1) * attendancePageSize
  const attendanceEnd = attendanceStart + attendancePageSize
  const attendancePageData = filteredAttendance.slice(attendanceStart, attendanceEnd)

  const visitorsTotal = filteredVisitors.length
  const visitorsTotalPages = Math.max(1, Math.ceil(visitorsTotal / visitorsPageSize))
  const visitorsStart = (visitorsPage - 1) * visitorsPageSize
  const visitorsEnd = visitorsStart + visitorsPageSize
  const visitorsPageData = filteredVisitors.slice(visitorsStart, visitorsEnd)

  const stats = {
    totalEmployees: employees.length,
    todayAttendance: attendanceRecords.filter(record => 
      new Date(record.timestamp).toDateString() === new Date().toDateString()
    ).length,
    totalVisitors: visitorRecords.length,
    activeEmployees: attendanceRecords.filter(record => 
      record.actorType === 'employee' && 
      record.action === 'IN' && 
      new Date(record.timestamp).toDateString() === new Date().toDateString()
    ).length
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
    <div className="flex items-center justify-between gap-3 flex-wrap mb-6 sm:mb-8">
        <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Admin Dashboard
          </h1>
      <p className="text-gray-600 text-sm sm:text-base">
            Manage employees, view attendance records, and monitor system activity.
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isLoggingOut 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          } text-white`}
        >
          {isLoggingOut ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-6 sm:gap-8 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Calendar },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'attendance', label: 'Attendance', icon: Clock },
            { id: 'visitors', label: 'Visitors', icon: UserCheck }
          ].map((tabItem) => {
            const IconComponent = tabItem.icon
            return (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id)}
                className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tabItem.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{tabItem.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayAttendance}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Currently In</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {attendanceRecords.slice(0, 5).map((record) => (
                <div key={record._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    record.action === 'IN' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      record.action === 'IN' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {record.actorType === 'employee' 
                        ? record?.actorId?.sessionClientId?.fullName || 'Employee'
                        : `${record?.actorId?.name || 'Visitor'} (Visitor)`
                      } clocked {(record?.action || '').toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employees...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end sm:justify-normal">
              <button 
                onClick={exportEmployeeList}
                disabled={isExporting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full sm:w-auto justify-center ${
                  isExporting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
              <button 
                onClick={handleAddEmployee}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? `No employees match "${searchTerm}". Try adjusting your search.`
                  : 'Get started by adding your first employee to the system.'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={handleAddEmployee}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add First Employee</span>
                </button>
              )}
            </div>
          ) : (
            <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeesPageData.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee?.sessionClientId?.fullName || 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee?.sessionClientId?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee?.employeeId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee?.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditEmployee(employee)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(employee)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {/* Employees Pagination */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-gray-600">Page {employeesPage} of {employeesTotalPages}</div>
              <div className="flex items-center gap-2">
                <button disabled={employeesPage <= 1} onClick={() => setEmployeesPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <button disabled={employeesPage >= employeesTotalPages} onClick={() => setEmployeesPage(p => Math.min(employeesTotalPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                <select value={employeesPageSize} onChange={(e) => setEmployeesPageSize(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 text-sm">
                  {[10, 20, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
                </select>
              </div>
            </div>
            </>
          )}
            </>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search attendance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-700">Late time:</label>
                <input
                  type="time"
                  value={lateCutoff}
                  onChange={(e) => setLateCutoff(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button onClick={saveLateCutoff} disabled={savingLate} className={`px-3 py-2 rounded-lg text-white ${savingLate ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {savingLate ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            <button 
              onClick={exportAttendanceData}
              disabled={isExporting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full sm:w-auto justify-center ${
                isExporting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host (Visitors)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendancePageData.map((record) => (
                  <tr key={record._id} className={`hover:bg-gray-50 ${isLateClockIn(record) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.actorType === 'employee' 
                        ? record?.actorId?.sessionClientId?.fullName || 'Unknown Employee'
                        : record?.actorId?.name || 'Unknown Visitor'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.actorType === 'employee'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {record.actorType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.action === 'IN'
                          ? (isLateClockIn(record) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800')
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Clock {record.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hostEmployeeId?.sessionClientId?.fullName || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Attendance Pagination */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-600">Page {attendancePage} of {attendanceTotalPages}</div>
            <div className="flex items-center gap-2">
              <button disabled={attendancePage <= 1} onClick={() => setAttendancePage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button disabled={attendancePage >= attendanceTotalPages} onClick={() => setAttendancePage(p => Math.min(attendanceTotalPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              <select value={attendancePageSize} onChange={(e) => setAttendancePageSize(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 text-sm">
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Visitors Tab */}
      {activeTab === 'visitors' && (
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
              />
            </div>
            <button 
              onClick={exportVisitorLog}
              disabled={isExporting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full sm:w-auto justify-center ${
                isExporting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export Visitor Log'}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitorsPageData.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record?.actorId?.name || 'Unknown Visitor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record?.visitType === 'inspection' 
                        ? 'Inspection' 
                        : (record?.hostEmployeeId?.sessionClientId?.fullName || 'Unknown Host')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record?.action === 'IN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Clock {record?.action || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record?.timestamp || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {record?.action === 'IN' && activeVisitorLatestIds.has(record._id) && (
                        <button
                          onClick={async () => {
                            try {
                              await attendanceAPI.adminForceVisitorClockOut({ actorId: record?.actorId?._id, visitType: record?.visitType })
                              await refreshData()
                            } catch {
                              alert('Failed to clock out visitor')
                            }
                          }}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          Force Clock Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Visitors Pagination */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-600">Page {visitorsPage} of {visitorsTotalPages}</div>
            <div className="flex items-center gap-2">
              <button disabled={visitorsPage <= 1} onClick={() => setVisitorsPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button disabled={visitorsPage >= visitorsTotalPages} onClick={() => setVisitorsPage(p => Math.min(visitorsTotalPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              <select value={visitorsPageSize} onChange={(e) => setVisitorsPageSize(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 text-sm">
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
    {showAddEmployeeModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Message Display */}
            {message.text && (
              <div className={`mx-6 mb-4 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 border border-green-300 text-green-700' 
                  : 'bg-red-100 border border-red-300 text-red-700'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmitEmployee} className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={newEmployee.employeeId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Auto-generated if left blank"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to auto-generate an Employee ID
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={newEmployee.department}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Legal">Legal</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newEmployee.title}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter job title"
                  />
                </div>
                
                {/* Password no longer required when creating employees */}
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Adding...' : 'Add Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
    {showEditEmployeeModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && handleCloseEditModal()}
        >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Employee</h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Message Display */}
            {message.text && (
              <div className={`mx-6 mb-4 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 border border-green-300 text-green-700' 
                  : 'bg-red-100 border border-red-300 text-red-700'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleUpdateEmployee} className="p-6 pt-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={newEmployee.employeeId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={newEmployee.department}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newEmployee.title}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newEmployee.password}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    minLength={8}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Updating...' : 'Update Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
