import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FlightSearch from './components/FlightSearch'
import NotFoundPage from './components/NotFoundPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 shadow-[inset_0_0_200px_rgba(37,99,235,0.6)]">
              <FlightSearch />
            </div>
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App

