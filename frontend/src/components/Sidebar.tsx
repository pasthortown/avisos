import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';
import { BiSortAlt2 } from 'react-icons/bi';
import { FiSettings } from 'react-icons/fi';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <MdDashboard /> },
  { to: '/priorizacion', label: 'Priorización', icon: <BiSortAlt2 /> },
  { to: '/gestion', label: 'Gestión', icon: <FiSettings /> },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${expanded ? styles.expanded : styles.collapsed}`}>
      <button className={styles.toggleBtn} onClick={() => setExpanded(!expanded)}>
        <HiOutlineMenu />
      </button>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={`${styles.label} ${expanded ? styles.labelVisible : ''}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
