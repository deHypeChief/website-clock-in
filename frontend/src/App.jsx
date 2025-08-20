import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EmployeePage from './pages/EmployeePage'
import EmployeeLogin from './pages/EmployeeLogin'
import VisitorPage from './pages/VisitorPage'
import AdminPage from './pages/AdminPage'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/visitor" element={<VisitorPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAuth="admin">
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}
