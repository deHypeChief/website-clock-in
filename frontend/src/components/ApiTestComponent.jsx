import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function ApiTestComponent() {
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await api.get('/')
        if (response.data) {
          setApiStatus(`✅ API Connected: ${response.data}`)
        }
      } catch (error) {
        console.error('API test failed:', error)
        setApiStatus(`❌ API Connection Failed: ${error.message}`)
      }
    }

    testAPI()
  }, [])

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        API Status
      </h3>
      <p className="text-sm text-yellow-700">
        {apiStatus}
      </p>
    </div>
  )
}
