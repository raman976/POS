import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CircleDashed, Clock3, Trash2 } from 'lucide-react'
import api from '../api/client'
import Loader from '../components/Loader'
import styles from './TasksPage.module.css'

interface Task {
  id: string
  listName: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'done'
  dueDate: string | null
  createdAt: string
}

const statusCycle: Record<Task['status'], Task['status']> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [listName, setListName] = useState('General')
  const [newListName, setNewListName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTasks = () => {
    setLoading(true)
    api.get('/tasks').then(res => setTasks(res.data.tasks)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTasks() }, [])

  const knownLists = useMemo(() => {
    const set = new Set(tasks.map(task => task.listName || 'General'))
    return ['General', ...Array.from(set).filter(v => v !== 'General')]
  }, [tasks])

  const groupedTasks = useMemo(() => {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
      const key = task.listName || 'General'
      if (!acc[key]) acc[key] = []
      acc[key].push(task)
      return acc
    }, {})
  }, [tasks])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const chosenList = newListName.trim() || listName
      await api.post('/tasks', {
        listName: chosenList,
        title,
        description,
        priority,
        dueDate: dueDate || null,
      })
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setListName(chosenList)
      setNewListName('')
      setShowForm(false)
      fetchTasks()
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (task: Task) => {
    const next = statusCycle[task.status]
    await api.patch(`/tasks/${task.id}`, { status: next })
    fetchTasks()
  }

  const removeTask = async (id: string) => {
    if (!window.confirm('Delete this task?')) return
    await api.delete(`/tasks/${id}`)
    fetchTasks()
  }

  const statusIcon = (status: Task['status']) => {
    if (status === 'done') return <CheckCircle2 size={14} />
    if (status === 'in_progress') return <Clock3 size={14} />
    return <CircleDashed size={14} />
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Tasks</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New task'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.listLabel}>Choose a list category for this task</div>
          <div className={styles.row}>
            <select className={styles.select} value={listName} onChange={e => setListName(e.target.value)}>
              {knownLists.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <input
              className={styles.input}
              placeholder="Or create list"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
            />
          </div>

          <input
            className={styles.input}
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            className={styles.textarea}
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
          <div className={styles.row}>
            <select className={styles.select} value={priority}
              onChange={e => setPriority(e.target.value as typeof priority)}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input className={styles.input} type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)} />
          </div>
          <button className={styles.submitBtn} disabled={saving}>
            {saving ? 'Adding...' : 'Add task'}
          </button>
        </form>
      )}

      <div className={styles.groups}>
        {loading && <Loader label="Loading tasks" />}
        {Object.keys(groupedTasks).length === 0 && (
          <p className={styles.empty}>No tasks yet. Add your first task above.</p>
        )}

        {Object.entries(groupedTasks).map(([group, items]) => (
          <section key={group} className={styles.groupCard}>
            <div className={styles.groupTitle}>{group}</div>
            <div className={styles.list}>
              {items.map(task => (
                <div key={task.id} className={`${styles.taskCard} ${task.status === 'done' ? styles.done : ''}`}>
                  <div className={styles.taskLeft}>
                    <button className={styles.statusBtn} onClick={() => toggleStatus(task)} title="Cycle status">
                      {statusIcon(task.status)}
                    </button>
                    <div className={styles.taskMeta}>
                      <div className={styles.taskTitle}>{task.title}</div>
                      {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                    </div>
                  </div>
                  <div className={styles.taskRight}>
                    <span className={`${styles.badge} ${styles[task.priority]}`}>{task.priority}</span>
                    {task.dueDate && <span className={styles.due}>{new Date(task.dueDate).toLocaleDateString()}</span>}
                    <button className={styles.deleteBtn} onClick={() => removeTask(task.id)} title="Delete task">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
