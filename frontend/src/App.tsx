import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NotesPage from './pages/NotesPage'
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'
import VaultPage from './pages/VaultPage'
import FilesPage from './pages/FilesPage'
import Layout from './components/Layout'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="vault" element={<VaultPage />} />
      <Route path="files" element={<FilesPage />} />
    </Route>
  </Routes>
)

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
