import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'

import './index.css'
import App from './App.jsx'

console.log('main.jsx running')

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <AuthProvider>
    <App />
  </AuthProvider>
    
  </StrictMode>,
)
