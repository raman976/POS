import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NotebookPen, ListTodo, CalendarDays, FolderKanban } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import styles from './DashboardPage.module.css'

interface Stats {
  notes: number
  tasks: number
  events: number
  files: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ notes: 0, tasks: 0, events: 0, files: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/notes').catch(() => ({ data: { notes: [] } })),
      api.get('/tasks').catch(() => ({ data: { tasks: [] } })),
      api.get('/events').catch(() => ({ data: { events: [] } })),
      api.get('/files').catch(() => ({ data: { files: [] } })),
    ]).then(([notes, tasks, events, files]) => {
      setStats({
        notes: notes.data.notes?.length ?? 0,
        tasks: tasks.data.tasks?.length ?? 0,
        events: events.data.events?.length ?? 0,
        files: files.data.files?.length ?? 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Notes', count: stats.notes, to: '/notes', icon: NotebookPen },
    { label: 'Tasks', count: stats.tasks, to: '/tasks', icon: ListTodo },
    { label: 'Events', count: stats.events, to: '/calendar', icon: CalendarDays },
    { label: 'Files', count: stats.files, to: '/files', icon: FolderKanban },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <h1 className={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]}</h1>
      <p className={styles.sub}>Here's what's in your workspace today.</p>

      <p className={styles.sectionTitle}>Overview</p>
      <div className={styles.grid}>
        {cards.map(card => (
          <Link key={card.label} to={card.to} className={styles.card}>
            <div className={styles.cardIcon}>
              <card.icon size={20} strokeWidth={2} />
            </div>
            <div className={styles.cardCount}>{card.count}</div>
            <div className={styles.cardLabel}>{card.label}</div>
          </Link>
        ))}
      </div>

      <div className={styles.quickLinks}>
        <p className={styles.sectionTitle}>Quick actions</p>
        <div className={styles.linkRow}>
          <Link to="/notes" className={styles.quickBtn}>+ New note</Link>
          <Link to="/tasks" className={styles.quickBtn}>+ New task</Link>
          <Link to="/calendar" className={styles.quickBtn}>+ New event</Link>
          <Link to="/vault" className={styles.quickBtn}>+ Add password</Link>
        </div>
      </div>
    </div>
  )
}
