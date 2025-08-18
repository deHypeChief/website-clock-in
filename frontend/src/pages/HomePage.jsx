import { Link } from 'react-router-dom'
import { Users, UserCheck, Clock4, Shield } from 'lucide-react'
import ApiTestComponent from '../components/ApiTestComponent'

export default function HomePage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* API Status Test */}
            {/* <ApiTestComponent /> */}

            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                    <img src='/Logo.svg' className='size-40' />

                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to GraceOnly Smart Attendance
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Efficiently track employee attendance and visitor check-ins with our
                    simple and intuitive system.
                </p>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Employee Clock In */}
                <Link
                    to="/employee"
                    className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200"
                >
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-green-100 group-hover:bg-green-200 transition-colors p-4 rounded-full">
                            <Users className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 text-center mb-3">
                        Employee Clock In
                    </h2>
                    <p className="text-gray-600 text-center mb-4">
                        Access your employee portal to clock in/out and track attendance.
                        Secure login required.
                    </p>
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700">
                            Access Portal
                            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div className="text-xs text-gray-500">Login required</div>
                    </div>
                </Link>

                {/* Visitor Check In */}
                <Link
                    to="/visitor"
                    className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200"
                >
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-blue-100 group-hover:bg-blue-200 transition-colors p-4 rounded-full">
                            <UserCheck className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 text-center mb-3">
                        Visitor Check In
                    </h2>
                    <p className="text-gray-600 text-center mb-4">
                        Register as a visitor, select who you're meeting, and log your
                        arrival and departure times.
                    </p>
                    <div className="text-center">
                        <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                            Check In
                            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </Link>
            </div>


            {/* Quick Access Links */}
            <div className="mt-16 bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                    Quick Access
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        to="/employee/login"
                        className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        <Users className="h-5 w-5 mr-2" />
                        Employee Login
                    </Link>
                    <Link
                        to="/admin/login"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        <Shield className="h-5 w-5 mr-2" />
                        Admin Login
                    </Link>
                    <Link
                        to="/visitor"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        <UserCheck className="h-5 w-5 mr-2" />
                        Visitor Check-in
                    </Link>
                </div>
            </div>
        </div>
    )
}
