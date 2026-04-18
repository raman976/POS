import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import api from '../api/client'
import Loader from '../components/Loader'
import styles from './CalendarPage.module.css'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
})

interface CalEvent {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  allDay: boolean
}

interface Task {
  id: string
  title: string
  dueDate: string | null
  listName: string
}

interface CalendarResource {
  type: 'event' | 'task'
  raw: CalEvent | Task
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const [eventsRes, tasksRes] = await Promise.all([
      api.get('/events'),
      api.get('/tasks').catch(() => ({ data: { tasks: [] } })),
    ])

    setEvents(eventsRes.data.events)
    setTasks(tasksRes.data.tasks)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const mappedEvents: Event[] = useMemo(() => {
    const realEvents = events.map(e => ({
      title: e.title,
      start: new Date(e.startTime),
      end: new Date(e.endTime),
      allDay: e.allDay,
      resource: { type: 'event', raw: e } as CalendarResource,
    }))

    const taskEvents = tasks
      .filter(task => task.dueDate)
      .map(task => ({
        title: `${task.title} (task)` ,
        start: new Date(task.dueDate as string),
        end: new Date(task.dueDate as string),
        allDay: true,
        resource: { type: 'task', raw: task } as CalendarResource,
      }))

    return [...realEvents, ...taskEvents]
  }, [events, tasks])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStartTime('')
    setEndTime('')
    setAllDay(false)
    setEditingId(null)
  }

  const openForEdit = (event: CalEvent) => {
    setEditingId(event.id)
    setTitle(event.title)
    setDescription(event.description)
    setStartTime(event.startTime.slice(0, 16))
    setEndTime(event.endTime.slice(0, 16))
    setAllDay(event.allDay)
    setShowForm(true)
  }

  const handleCreateOrUpdate = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    try {
      const payload = { title, description, startTime, endTime, allDay }
      if (editingId) {
        await api.patch(`/events/${editingId}`, payload)
      } else {
        await api.post('/events', payload)
      }
      resetForm()
      setShowForm(false)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  const removeEvent = async () => {
    if (!editingId) return
    if (!window.confirm('Delete this event?')) return
    await api.delete(`/events/${editingId}`)
    resetForm()
    setShowForm(false)
    fetchData()
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Calendar</h1>
        <button className={styles.addBtn} onClick={() => {
          if (showForm) {
            setShowForm(false)
            resetForm()
          } else {
            resetForm()
            setShowForm(true)
          }
        }}>
          {showForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleCreateOrUpdate}>
          <input className={styles.input} placeholder="Event title" value={title}
            onChange={e => setTitle(e.target.value)} required />
          <textarea className={styles.textarea} placeholder="Description" value={description}
            onChange={e => setDescription(e.target.value)} rows={2} />
          <div className={styles.row}>
            <div>
              <label className={styles.label}>Start</label>
              <input className={styles.input} type="datetime-local" value={startTime}
                onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label className={styles.label}>End</label>
              <input className={styles.input} type="datetime-local" value={endTime}
                onChange={e => setEndTime(e.target.value)} required />
            </div>
          </div>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} />
            All-day event
          </label>
          <div className={styles.actions}>
            <button className={styles.submitBtn} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update event' : 'Create event'}</button>
            {editingId && <button type="button" className={styles.deleteBtn} onClick={removeEvent}>Delete event</button>}
          </div>
        </form>
      )}

      <div className={styles.calWrap}>
        {loading && <Loader label="Loading calendar" />}
        <Calendar
          localizer={localizer}
          events={mappedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={(event) => {
            const payload = event.resource as CalendarResource
            if (payload?.type === 'task') {
              return { style: { backgroundColor: '#1f8a70', borderRadius: '4px' } }
            }
            return { style: { backgroundColor: 'var(--accent)', borderRadius: '4px' } }
          }}
          onSelectEvent={(event) => {
            const payload = event.resource as CalendarResource
            if (!payload || payload.type === 'task') return
            openForEdit(payload.raw as CalEvent)
          }}
        />
      </div>
    </div>
  )
}
