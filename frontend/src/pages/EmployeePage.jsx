import { useState, useEffect } from 'react'
import { Search, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { employeeAPI, attendanceAPI, authAPI } from '../lib/api'

export default function EmployeePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [me, setMe] = useState(null) // logged-in employee profile
  const [status, setStatus] = useState({ currentlyClockedIn: false, lastInAt: null, recentRecords: [] })

  // On mount: if logged in as employee (localStorage employeeAuth), fetch my status; else load employees for search mode
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const authRaw = localStorage.getItem('employeeAuth')
        if (authRaw) {
          try {
            JSON.parse(authRaw)
            // Attempt to fetch status; if unauthorized, clear and fall back
            const res = await attendanceAPI.employeeStatus(20)
            if (res.success) {
              setMe(res.data.employee)
              setStatus({
                currentlyClockedIn: !!res.data.currentlyClockedIn,
                lastInAt: res.data.lastInAt || null,
                recentRecords: res.data.recentRecords || []
              })
              return
            }
          } catch {
            // fall through to public mode
          }
        }
        // Public search mode
        const response = await employeeAPI.getPublic()
        if (response.success && response.data) {
          setEmployees(response.data)
          setFilteredEmployees(response.data)
        } else {
          setEmployees([])
          setFilteredEmployees([])
        }
      } catch (error) {
        console.error('Init failed:', error)
        setEmployees([])
        setFilteredEmployees([])
        if (!me) setMessage({ type: 'error', text: 'Unable to load data. Please try again later.' })
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees)
    } else {
      const filtered = employees.filter(employee => {
  const name = employee?.sessionClientId?.fullName || '';
        const employeeId = employee?.employeeId || '';
        const department = employee?.department || '';
        
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      setFilteredEmployees(filtered)
    }
  }, [searchTerm, employees])

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee)
  }

  const refreshStatus = async () => {
    try {
      const r = await attendanceAPI.employeeStatus(20)
      if (r.success) {
        setMe(r.data.employee)
        setStatus({
          currentlyClockedIn: !!r.data.currentlyClockedIn,
          lastInAt: r.data.lastInAt || null,
          recentRecords: r.data.recentRecords || []
        })
      }
    } catch {
      // ignore refresh error
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await authAPI.logout()
  } catch {
      // ignore
    } finally {
      localStorage.removeItem('employeeAuth')
      setLoading(false)
      window.location.href = '/employee/login'
    }
  }

  const handleClockAction = async (action) => {
    // In self mode, we don't need selectedEmployee; in search mode ensure selection
    if (!me && !selectedEmployee) return

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Perform the clock action using the current employee session
      const clockResponse = await attendanceAPI.employeeClock(action)
      
      if (clockResponse.success) {
        const employeeName = me?.sessionClientId?.fullName || selectedEmployee?.sessionClientId?.fullName || 'Employee'
        setMessage({
          type: 'success',
          text: `Successfully clocked ${(action || '').toLowerCase()} for ${employeeName} at ${new Date().toLocaleTimeString()}`
        })
        await refreshStatus()
        // In search mode, clear selection
        if (!me) {
          setTimeout(() => {
            setSelectedEmployee(null)
            setSearchTerm('')
            setMessage({ type: '', text: '' })
          }, 3000)
        }
      } else {
        throw new Error(clockResponse.message || 'Clock action failed')
      }
      
    } catch (error) {
      console.error('Clock action failed:', error)
      setMessage({
        type: 'error',
        text: 'Clock action failed. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const SelfHeader = () => (
    <div className="mb-6 sm:mb-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
    <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Attendance</h1>
      <p className="text-gray-600 text-sm sm:text-base">View your info, recent clock activity, and quickly clock in or out.</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {loading ? 'Signing out...' : 'Logout'}
        </button>
      </div>
    </div>
  )

  const PublicHeader = () => (
    <div className="mb-6 sm:mb-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
        Employee Clock In/Out
      </h1>
  <p className="text-gray-600 text-sm sm:text-base">
        Search for your name and clock in or out with a single click.
      </p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      {me ? <SelfHeader /> : <PublicHeader />}

      {/* Self mode: show profile and quick actions */}
      {me && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                {me?.sessionClientId?.fullName || 'Employee'}
              </h2>
              <p className="text-gray-600 text-sm">{me?.employeeId} • {me?.department} • {me?.title}</p>
            </div>
            <div className="text-sm">
              {status.currentlyClockedIn ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">Currently In</span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">Not Clocked In</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => handleClockAction('IN')}
              disabled={loading || status.currentlyClockedIn}
              className={`flex items-center justify-center space-x-2 py-3 sm:py-4 px-5 sm:px-6 rounded-lg text-base sm:text-lg font-semibold transition-colors text-white ${
                loading || status.currentlyClockedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>{loading ? 'Processing...' : 'Clock In'}</span>
            </button>
            <button
              onClick={() => handleClockAction('OUT')}
              disabled={loading || !status.currentlyClockedIn}
              className={`flex items-center justify-center space-x-2 py-3 sm:py-4 px-5 sm:px-6 rounded-lg text-base sm:text-lg font-semibold transition-colors text-white ${
                loading || !status.currentlyClockedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>{loading ? 'Processing...' : 'Clock Out'}</span>
            </button>
          </div>

          {/* Recent history */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Recent Activity</h3>
            {status.recentRecords && status.recentRecords.length > 0 ? (
              <div className="bg-gray-50 rounded-lg divide-y">
                {status.recentRecords.slice(0, 10).map((r) => (
                  <div key={r._id || r.timestamp} className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${r.action === 'IN' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Clock className={`${r.action === 'IN' ? 'text-green-600' : 'text-red-600'} h-4 w-4`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Clock {r.action}</div>
                        <div className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent attendance records.</p>
            )}
          </div>
        </div>
      )}

      {/* Public search Section (only when not logged in) */}
      {!me && (
      <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, employee ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg"
          />
        </div>

        {loading && (
          <div className="text-center py-6 text-gray-500">
            Loading employees...
          </div>
        )}

        {/* Employee List */}
        {searchTerm && filteredEmployees.length > 0 && (
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredEmployees.map((employee) => (
              <button
                key={employee._id}
                onClick={() => handleEmployeeSelect(employee)}
                className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedEmployee?._id === employee._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.sessionClientId.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {employee.employeeId} • {employee.department} • {employee.title}
                    </p>
                  </div>
                  {selectedEmployee?._id === employee._id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {searchTerm && filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No employees found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
      )}

      {/* Selected Employee */}
  {!me && selectedEmployee && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                Selected Employee
              </h2>
              <p className="text-gray-600 text-sm">Ready to clock in or out</p>
            </div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {selectedEmployee.sessionClientId.fullName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId}
              </div>
              <div>
                <span className="font-medium">Department:</span> {selectedEmployee.department}
              </div>
              <div>
                <span className="font-medium">Title:</span> {selectedEmployee.title}
              </div>
            </div>
          </div>

          {/* Clock Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => handleClockAction('IN')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 sm:py-4 px-5 sm:px-6 rounded-lg text-base sm:text-lg font-semibold transition-colors"
            >
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>{loading ? 'Processing...' : 'Clock In'}</span>
            </button>
            <button
              onClick={() => handleClockAction('OUT')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 sm:py-4 px-5 sm:px-6 rounded-lg text-base sm:text-lg font-semibold transition-colors"
            >
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>{loading ? 'Processing...' : 'Clock Out'}</span>
            </button>
          </div>

          <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
            Current time: {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {message.text && (
        <div className={`rounded-lg p-4 mb-6 sm:mb-8 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-5 sm:p-6 border border-blue-200">
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">
          {me ? 'Tips' : 'How to Use'}
        </h3>
        {me ? (
          <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
            <li>If you’re already clocked in, the Clock Out button will be enabled for a quick checkout.</li>
            <li>Use the Back button to navigate home. Your session stays active unless you log out.</li>
          </ul>
        ) : (
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Search for your name in the search box above</li>
            <li>Click on your name from the search results</li>
            <li>Click "Clock In" when you arrive or "Clock Out" when you leave</li>
            <li>Your attendance will be automatically recorded with the current timestamp</li>
          </ol>
        )}
      </div>
    </div>
  )
}
