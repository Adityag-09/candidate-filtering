import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/add', icon: '➕', label: 'Add Candidate' },
  { path: '/candidates', icon: '👥', label: 'Candidates' },
  { path: '/shortlist', icon: '🎯', label: 'Shortlist' },
  { path: '/ai-shortlist', icon: '🤖', label: 'AI Shortlist' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">CS</div>
        <h1>CandidateAI</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
