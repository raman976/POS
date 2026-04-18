import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch(err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setError(msg || 'Registration failed. Please try again.')
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

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Get started with your personal workspace</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>Full name</label>
        <input className={styles.input} value={name}
          onChange={e => setName(e.target.value)} required placeholder="Your name" />

        <label className={styles.label}>Email address</label>
        <input className={styles.input} type="email" value={email}
          onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />

        <label className={styles.label}>Password</label>
        <input className={styles.input} type="password" value={password}
          onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" minLength={6} />

        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className={styles.foot}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
