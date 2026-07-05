import React from 'react'
import ReactDOM from 'react-dom/client'
import MasterDashboard from './components/MasterDashboard'
import './index.css' // Assumes your Tailwind utility styles live here

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MasterDashboard />
  </React.StrictMode>,
)
