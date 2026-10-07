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
import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './auth/useAuth'
import RouteGuard from './auth/RouteGuard'

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

function AppLayout() {
  const { sessionError } = useAuth()

  return (
    <>
      <ScrollToRoute />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {sessionError && (
            <div className="container pt-3">
              <div className="alert alert-warning" role="alert">{sessionError}</div>
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchRoute />} />
            <Route path="/artist/:id" element={<ArtistProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<RouteGuard allowedRoles={['Customer']} />}>
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/dashboard/customer" element={<CustomerDashboardPage />} />
            </Route>
            <Route element={<RouteGuard allowedRoles={['Professional']} />}>
              <Route path="/dashboard/professional" element={<ProfessionalDashboardPage />} />
            </Route>
            <Route element={<RouteGuard allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminPanelPage />} />
            </Route>
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

function SearchRoute() {
  const { search } = useLocation()
  return <SearchPage key={search} />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}
