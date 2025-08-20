import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function EmployeeLogin() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/employee', { replace: true })
  }, [navigate])
  return null
}
