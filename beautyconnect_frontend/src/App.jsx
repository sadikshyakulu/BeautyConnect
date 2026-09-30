import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ArtistProfilePage from './pages/ArtistProfilePage'
import BookingPage from './pages/BookingPage'
import AuthPage from './pages/AuthPage'
import ProfessionalDashboardPage from './pages/ProfessionalDashboardPage'
import AdminPanelPage from './pages/AdminPanelPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'

function ScrollToRoute() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, search, hash])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToRoute />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/artist/:id" element={<ArtistProfilePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard/professional" element={<ProfessionalDashboardPage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/dashboard/customer" element={<CustomerDashboardPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
