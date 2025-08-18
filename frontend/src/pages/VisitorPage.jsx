import { useState, useEffect } from 'react'
import { Search, Clock, CheckCircle, XCircle, ArrowLeft, User, Phone, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { employeeAPI, attendanceAPI } from '../lib/api'

export default function VisitorPage() {
  const [step, setStep] = useState(1) // 1: visitor info, 2: select host, 3: clock actions
  const [visitorInfo, setVisitorInfo] = useState({ name: '', phone: '', email: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [selectedHost, setSelectedHost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  // Load employees from API
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoadingEmployees(true)
  const response = await employeeAPI.getPublic()
        if (response.success && response.data) {
          setEmployees(response.data)
          setFilteredEmployees(response.data)
        }
      } catch (error) {
        console.error('Failed to load employees:', error)
        setEmployees([])
        setFilteredEmployees([])
        setMessage({ type: 'error', text: 'Unable to load employees. Please try again later.' })
      } finally {
        setIsLoadingEmployees(false)
      }
    }

    loadEmployees()
  }, [])

  useEffect(() => {
    const run = async () => {
      if (searchTerm.trim() === '') {
        setFilteredEmployees(employees)
        return
      }
      try {
        setIsLoadingEmployees(true)
        const resp = await employeeAPI.getPublic(searchTerm)
        if (resp.success) setFilteredEmployees(resp.data)
  } catch {
        // fallback to local filter
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
      } finally {
        setIsLoadingEmployees(false)
      }
    }
    run()
  }, [searchTerm, employees])

  const handleVisitorInfoSubmit = async (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!visitorInfo.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter your full name.' })
      return
    }
    if (!visitorInfo.email || !emailRegex.test(visitorInfo.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' })
      return
    }
    if (message.text) setMessage({ type: '', text: '' })
  try {
      // Fetch status by email to decide default action
      const statusResp = await attendanceAPI.visitorStatus(visitorInfo.email)
      if (statusResp.success) {
        setIsRegistered(!!statusResp.data.currentlyClockedIn)
      } else {
        setIsRegistered(false)
      }
    } catch {
      setIsRegistered(false)
    }
    setStep(2)
  }

  const handleHostSelect = (employee) => {
    setSelectedHost(employee)
    setStep(3)
  }

  const handleClockAction = async (action) => {
    if (!selectedHost || !visitorInfo.name) return

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Perform kiosk clock without auth
      const clockResponse = await attendanceAPI.visitorKioskClock({
        email: visitorInfo.email,
        name: visitorInfo.name,
        action,
        hostEmployeeId: selectedHost._id
      })
      
      if (clockResponse.success) {
  const hostName = selectedHost?.sessionClientId?.fullName || 'Host';
        setMessage({
          type: 'success',
          text: `Successfully clocked ${(action || '').toLowerCase()} for visitor ${visitorInfo.name} meeting ${hostName} at ${new Date().toLocaleTimeString()}`
        })
        
        if (action === 'OUT') {
          // Reset form after clock out
          setTimeout(() => {
            setStep(1)
            setVisitorInfo({ name: '', phone: '', email: '' })
            setSelectedHost(null)
            setSearchTerm('')
            setMessage({ type: '', text: '' })
            setIsRegistered(false)
          }, 3000)
  } else {
          setIsRegistered(true)
        }
      } else {
        throw new Error(clockResponse.message || 'Clock action failed')
      }
      
    } catch (error) {
      console.error('Visitor clock action failed:', error)
      setMessage({
        type: 'error',
        text: 'Clock action failed. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
  setVisitorInfo({ name: '', phone: '', email: '' })
    setSelectedHost(null)
    setSearchTerm('')
    setMessage({ type: '', text: '' })
    setIsRegistered(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
  <div className="mb-6 sm:mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Visitor Check In/Out
        </h1>
  <p className="text-gray-600 text-sm sm:text-base">
          Register as a visitor and log your visit details.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          {[
            { number: 1, title: 'Visitor Info', active: step >= 1 },
            { number: 2, title: 'Select Host', active: step >= 2 },
            { number: 3, title: 'Clock In/Out', active: step >= 3 }
          ].map((stepItem, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold ${
                stepItem.active ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {stepItem.number}
              </div>
              <span className={`ml-2 text-xs sm:text-sm font-medium ${
                stepItem.active ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {stepItem.title}
              </span>
              {index < 2 && (
                <div className={`w-10 sm:w-16 h-1 mx-3 sm:mx-4 ${
                  step > stepItem.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Visitor Information */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Enter Your Information
          </h2>
          <form onSubmit={handleVisitorInfoSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={visitorInfo.name}
                    onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={visitorInfo.email}
                    onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={visitorInfo.phone}
                    onChange={(e) => setVisitorInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 sm:px-6 rounded-lg font-semibold transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Select Host Employee */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Who are you visiting?
            </h2>
            <button
              onClick={() => setStep(1)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit visitor info
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Visitor:</span> {visitorInfo.name}
              {visitorInfo.phone && <span> • {visitorInfo.phone}</span>}
            </p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for the employee you're meeting..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg"
            />
          </div>

          {isLoadingEmployees && (
            <div className="text-center py-6 text-gray-500">Loading employees...</div>
          )}

          {/* Employee List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredEmployees.map((employee) => (
              <button
                key={employee._id}
                onClick={() => handleHostSelect(employee)}
                className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.sessionClientId.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {employee.department} • {employee.title}
                    </p>
                  </div>
                  <div className="text-blue-600">
                    <span className="text-sm font-medium">Select</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredEmployees.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No employees found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Clock Actions */}
      {step === 3 && selectedHost && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5 sm:mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Visit Summary
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Start Over
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Visitor Information</h3>
                <p className="text-gray-700">{visitorInfo.name}</p>
                {visitorInfo.phone && (
                  <p className="text-sm text-gray-600">{visitorInfo.phone}</p>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Meeting With</h3>
                <p className="text-gray-700">{selectedHost.sessionClientId.fullName}</p>
                <p className="text-sm text-gray-600">
                  {selectedHost.department} • {selectedHost.title}
                </p>
              </div>
            </div>
          </div>

          {/* Clock Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <button
        onClick={() => handleClockAction('IN')}
        disabled={loading || isRegistered}
              className={`flex items-center justify-center space-x-2 py-3 sm:py-4 px-5 sm:px-6 rounded-lg text-base sm:text-lg font-semibold transition-colors ${
                isRegistered 
                  ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white'
              }`}
            >
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>
                {isRegistered ? 'Checked In ✓' : loading ? 'Processing...' : 'Clock In'}
              </span>
            </button>
            <button
              onClick={() => handleClockAction('OUT')}
        disabled={loading || !isRegistered}
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
          Visitor Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
          <li>Enter your name and email</li>
          <li>Search and select the employee you're visiting</li>
          <li>If you’ve checked in before and haven’t clocked out, you’ll see Clock Out enabled</li>
          <li>Next time, the system remembers your email to toggle in/out</li>
        </ol>
      </div>
    </div>
  )
}
