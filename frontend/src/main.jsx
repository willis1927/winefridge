import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'

import './index.css'
import App from './App retired.jsx'
import App2 from './App2.jsx'

console.log('main.jsx running')

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <AuthProvider>
    <App2 />
  </AuthProvider>
    
  </StrictMode>,
)
