import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, NotebookPen, ListTodo, CalendarDays, Shield, FolderKanban } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/vault', label: 'Vault', icon: Shield },
  { to: '/files', label: 'Files', icon: FolderKanban },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>G</div>
          <div>
            <div className={styles.brandName}>Genie</div>
            <div className={styles.brandSub}>Your life workspace</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>Workspace</div>
          {navItems.map(item => {
            const Icon = item.icon
            return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              <span className={styles.navIcon}>
                <Icon size={16} strokeWidth={2} />
              </span>
              {item.label}
            </NavLink>
            )
          })}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{initials}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
