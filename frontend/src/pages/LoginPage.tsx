import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch(err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setError(msg || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>P</div>
          <span className={styles.logoName}>Personal OS</span>
        </div>

        <div className={styles.divider} />

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your workspace</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>Email address</label>
        <input className={styles.input} type="email" value={email}
          onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />

        <label className={styles.label}>Password</label>
        <input className={styles.input} type="password" value={password}
          onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />

        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className={styles.foot}>
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  )
}
