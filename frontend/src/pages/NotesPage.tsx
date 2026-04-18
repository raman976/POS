import React, { useEffect, useRef, useState } from 'react'
import { Bold, Italic, List, Trash2, PencilLine } from 'lucide-react'
import api from '../api/client'
import Loader from '../components/Loader'
import styles from './NotesPage.module.css'

interface Note {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

const createEmptyDraft = () => ({
  title: '',
  body: '',
})

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draft, setDraft] = useState(createEmptyDraft())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const editorRef = useRef<HTMLDivElement | null>(null)

  const fetchNotes = () => {
    setLoading(true)
    api.get('/notes').then(res => setNotes(res.data.notes)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotes() }, [])

  const resetEditor = () => {
    setDraft(createEmptyDraft())
    setEditingId(null)
    if (editorRef.current) editorRef.current.innerHTML = ''
  }

  const openCreate = () => {
    resetEditor()
    setShowForm(true)
  }

  const openEdit = (note: Note) => {
    setEditingId(note.id)
    setDraft({ title: note.title, body: note.body })
    setShowForm(true)
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = note.body
    })
  }

  const applyCommand = (command: 'bold' | 'italic' | 'insertUnorderedList') => {
    if (!editorRef.current) return
    editorRef.current.focus()
    document.execCommand(command)
    setDraft(prev => ({ ...prev, body: editorRef.current?.innerHTML ?? prev.body }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { title: draft.title.trim(), body: draft.body.trim() }
      if (editingId) {
        await api.patch(`/notes/${editingId}`, payload)
      } else {
        await api.post('/notes', payload)
      }
      resetEditor()
      setShowForm(false)
      fetchNotes()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return
    await api.delete(`/notes/${noteId}`)
    if (editingId === noteId) {
      resetEditor()
      setShowForm(false)
    }
    fetchNotes()
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Notes</h1>
        <button className={styles.addBtn} onClick={() => (showForm ? setShowForm(false) : openCreate())}>
          {showForm ? 'Cancel' : '+ New Note'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSave}>
          <input
            className={styles.input}
            placeholder="Title"
            value={draft.title}
            onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <div className={styles.toolbar}>
            <button type="button" className={styles.toolBtn} onClick={() => applyCommand('bold')} title="Bold">
              <Bold size={14} />
            </button>
            <button type="button" className={styles.toolBtn} onClick={() => applyCommand('italic')} title="Italic">
              <Italic size={14} />
            </button>
            <button type="button" className={styles.toolBtn} onClick={() => applyCommand('insertUnorderedList')} title="Bulleted list">
              <List size={14} />
            </button>
          </div>

          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning
            onInput={e => setDraft(prev => ({ ...prev, body: (e.target as HTMLDivElement).innerHTML }))}
            data-placeholder="Write your note..."
          />

          <button className={styles.submitBtn} type="submit" disabled={saving || !draft.body.trim() || !draft.title.trim()}>
            {saving ? 'Saving...' : editingId ? 'Update note' : 'Save note'}
          </button>
        </form>
      )}

      <div className={styles.list}>
        {loading && <Loader label="Loading notes" />}
        {notes.length === 0 && (
          <p className={styles.empty}>No notes yet. Create your first one.</p>
        )}
        {notes.map(note => (
          <article key={note.id} className={styles.noteCard}>
            <div className={styles.noteHead}>
              <h3 className={styles.noteTitle}>{note.title}</h3>
              <div className={styles.noteActions}>
                <button className={styles.iconBtn} onClick={() => openEdit(note)} title="Edit note">
                  <PencilLine size={15} />
                </button>
                <button className={styles.iconBtnDanger} onClick={() => handleDelete(note.id)} title="Delete note">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className={styles.noteBody} dangerouslySetInnerHTML={{ __html: note.body }} />
            <span className={styles.noteDate}>
              Updated {new Date(note.updatedAt ?? note.createdAt).toLocaleDateString()}
            </span>
          </article>
        ))}
      </div>
    </div>
  )
}
