import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const CENTER_LINKS = [
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/maps', label: 'Maps' },
  { to: '/requests', label: 'Requests' },
];

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>

        {/* Left — identity / home */}
        <NavLink to="/" className={styles.brand}>
          <span className={styles.brandIcon}>⚔</span>
          <span className={styles.brandName}>Server Monitor</span>
        </NavLink>

        {/* Center — community pages */}
        <ul className={styles.centerLinks}>
          {CENTER_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right — servers dashboard */}
        <NavLink
          to="/servers"
          className={({ isActive }) =>
            [styles.navLinkRight, isActive ? styles.navLinkActive : ''].join(' ')
          }
        >
          Servers
        </NavLink>

      </div>
    </nav>
  );
}
