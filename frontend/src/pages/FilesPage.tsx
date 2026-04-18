import { useEffect, useMemo, useRef, useState } from 'react'
import { Folder, FileText, FileArchive, Image, Video, Download, Trash2, FolderPlus } from 'lucide-react'
import api from '../api/client'
import Loader from '../components/Loader'
import styles from './FilesPage.module.css'

interface FileEntry {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  folder: string
  isFolder: boolean
  createdAt: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const normalizePath = (value: string) => {
  const raw = value.trim()
  if (!raw || raw === '/') return '/'
  return `/${raw.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '')}`
}

const joinPath = (base: string, child: string) => {
  if (!child.trim()) return normalizePath(base)
  const b = normalizePath(base)
  return normalizePath(b === '/' ? `/${child}` : `${b}/${child}`)
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fileIcon = (mime: string) => {
  if (mime.startsWith('image/')) return <Image size={16} />
  if (mime.startsWith('video/')) return <Video size={16} />
  if (mime.includes('zip') || mime.includes('compressed')) return <FileArchive size={16} />
  return <FileText size={16} />
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [currentFolder, setCurrentFolder] = useState('/')
  const [newFolderName, setNewFolderName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchFiles = () => {
    setLoading(true)
    api.get('/files', { params: { folder: currentFolder } })
      .then(res => setFiles(res.data.files))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchFiles() }, [currentFolder])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum allowed size is 5 MB.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', currentFolder)
      await api.post('/files/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      fetchFiles()
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    const folderPath = joinPath(currentFolder, newFolderName)
    await api.post('/files/folders', { folderPath })
    setNewFolderName('')
    fetchFiles()
  }

  const handleDownload = async (file: FileEntry) => {
    const res = await api.get(`/files/${file.id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return
    await api.delete(`/files/${id}`)
    fetchFiles()
  }

  const breadcrumbs = useMemo(() => {
    if (currentFolder === '/') return [{ label: 'root', path: '/' }]
    const chunks = currentFolder.slice(1).split('/')
    const items: Array<{ label: string; path: string }> = [{ label: 'root', path: '/' }]
    chunks.forEach((part, idx) => {
      items.push({ label: part, path: `/${chunks.slice(0, idx + 1).join('/')}` })
    })
    return items
  }, [currentFolder])

  return (
    <div>
      <div className={styles.header}>
        <h1>Files</h1>
        <label className={styles.uploadBtn}>
          {uploading ? 'Uploading...' : '+ Upload file'}
          <input ref={fileRef} type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <p className={styles.hint}>Upload size should be less than 5 MB.</p>

      <div className={styles.breadcrumbs}>
        {breadcrumbs.map((item, idx) => (
          <button key={item.path} className={styles.crumbBtn} onClick={() => setCurrentFolder(item.path)}>
            {item.label}
            {idx < breadcrumbs.length - 1 && <span className={styles.sep}>/</span>}
          </button>
        ))}
      </div>

      <form className={styles.folderForm} onSubmit={handleCreateFolder}>
        <div className={styles.folderInputWrap}>
          <span className={styles.folderIconBubble}>
            <FolderPlus size={14} />
          </span>
          <input
            className={styles.input}
            placeholder="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
          />
        </div>
        <button className={styles.makeBtn} type="submit">Create folder</button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.list}>
        {loading && <Loader label="Loading files" />}
        {files.length === 0 && <p className={styles.empty}>No files or folders in this location.</p>}
        {files.map(file => (
          <div key={file.id} className={styles.fileCard}>
            <div className={styles.fileIcon}>
              {file.isFolder ? <Folder size={16} /> : fileIcon(file.mimeType)}
            </div>
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{file.filename}</div>
              <div className={styles.fileMeta}>
                {file.isFolder ? 'Folder' : `${formatBytes(file.sizeBytes)} · ${file.mimeType}`}
              </div>
            </div>
            <div className={styles.actions}>
              {file.isFolder ? (
                <button className={styles.dlBtn} onClick={() => setCurrentFolder(joinPath(file.folder, file.filename))}>Open</button>
              ) : (
                <button className={styles.dlBtn} onClick={() => handleDownload(file)} title="Download file">
                  <Download size={14} />
                </button>
              )}
              <button className={styles.delBtn} onClick={() => handleDelete(file.id)} title="Delete item">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
