import React, { useEffect, useState } from 'react'
import { Copy, KeyRound, Trash2 } from 'lucide-react'
import api from '../api/client'
import Loader from '../components/Loader'
import styles from './VaultPage.module.css'

interface VaultEntry {
  id: string
  siteName: string
  siteUrl: string
  username: string
  notes: string
  expiresAt: string | null
  createdAt: string
}

export default function VaultPage() {
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [verifiedAt, setVerifiedAt] = useState<number>(0)

  const ensureAccountPasswordVerified = async () => {
    const stillValid = Date.now() - verifiedAt < 5 * 60 * 1000
    if (stillValid) return true

    const accountPassword = window.prompt('For security, enter your account password to continue:')
    if (!accountPassword) return false

    try {
      await api.post('/auth/verify-password', { password: accountPassword })
      setVerifiedAt(Date.now())
      return true
    } catch {
      window.alert('Incorrect account password')
      return false
    }
  }

  const fetchEntries = () => {
    setLoading(true)
    api.get('/vault')
      .then(res => setEntries(res.data.entries))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEntries() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/vault', { siteName, siteUrl, username, password, notes })
      setSiteName('')
      setSiteUrl('')
      setUsername('')
      setPassword('')
      setNotes('')
      setShowForm(false)
      fetchEntries()
    } finally {
      setSaving(false)
    }
  }

  const revealPassword = async (id: string) => {
    if (revealed[id]) {
      setRevealed(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      return
    }
    const ok = await ensureAccountPasswordVerified()
    if (!ok) return

    const res = await api.get(`/vault/${id}/reveal`)
    setRevealed(prev => ({ ...prev, [id]: res.data.password }))
  }

  const copyPassword = async (value: string) => {
    const ok = await ensureAccountPasswordVerified()
    if (!ok) return

    await navigator.clipboard.writeText(value)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this password entry?')) return
    await api.delete(`/vault/${id}`)
    fetchEntries()
  }

  const siteInitial = (name: string) => name.charAt(0).toUpperCase()

  return (
    <div>
      <div className={styles.header}>
        <h1>Password Vault</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Add password'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Site name *" value={siteName}
              onChange={e => setSiteName(e.target.value)} required />
            <input className={styles.input} placeholder="Site URL" value={siteUrl}
              onChange={e => setSiteUrl(e.target.value)} />
          </div>
          <div className={styles.row}>
            <input className={styles.input} placeholder="Username or email *" value={username}
              onChange={e => setUsername(e.target.value)} required />
            <input className={styles.input} type="password" placeholder="Password *" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>
          <textarea className={styles.textarea} placeholder="Notes (optional)" value={notes}
            onChange={e => setNotes(e.target.value)} rows={2} />
          <button className={styles.submitBtn} disabled={saving}>{saving ? 'Saving...' : 'Save entry'}</button>
        </form>
      )}

      <div className={styles.list}>
        {loading && <Loader label="Loading vault" />}
        {entries.length === 0 && <p className={styles.empty}>Your vault is empty. Add your first password above.</p>}
        {entries.map(entry => (
          <div key={entry.id} className={styles.card}>
            <div className={styles.cardIcon}>{siteInitial(entry.siteName)}</div>
            <div className={styles.cardInfo}>
              <div className={styles.siteName}>{entry.siteName}</div>
              <div className={styles.username}>{entry.username}</div>
              {revealed[entry.id] && (
                <div className={styles.passwordRow}>
                  <div className={styles.passwordReveal}>{revealed[entry.id]}</div>
                  <button className={styles.copyBtn} onClick={() => copyPassword(revealed[entry.id])} title="Copy password">
                    <Copy size={13} />
                  </button>
                </div>
              )}
            </div>
            <div className={styles.cardActions}>
              <button className={styles.revealBtn} onClick={() => revealPassword(entry.id)} title="Reveal password">
                <KeyRound size={14} />
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(entry.id)} title="Delete entry">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
