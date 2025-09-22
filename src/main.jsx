import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { makeServer } from './mirage-server'
import { initializeDatabase } from './db/index.js'

async function startApp() {
  // Wait for database to be ready
  await initializeDatabase()
  
  
  
    makeServer()
    console.log('✅ MirageJS server started')


  // Render app
  const rootElement = document.getElementById('root')
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

startApp()