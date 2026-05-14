import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AddWinePage from './pages/AddWinePage.jsx'
import CellarPage from './pages/CellarPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ManageStoragePage from './pages/ManageStoragePage.jsx'

import './index.css'

function ProtectedRoute({ children }) {
  const { session } = useAuth()
  if (session === undefined) return null // loading
  if (!session) return <Navigate to="/login" replace />
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/cellar" replace />} />
          <Route path="/cellar" element={<ProtectedRoute><CellarPage /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddWinePage /></ProtectedRoute>} />
          <Route path="/manage-storage" element={<ProtectedRoute><ManageStoragePage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
