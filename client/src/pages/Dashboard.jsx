import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCandidates } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, avgExp: 0, topSkills: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates().then(res => {
      const candidates = res.data;
      const total = candidates.length;
      const avgExp = total > 0 ? (candidates.reduce((s, c) => s + c.experience, 0) / total).toFixed(1) : 0;

      // Count skills
      const skillCount = {};
      candidates.forEach(c => c.skills.forEach(s => { skillCount[s] = (skillCount[s] || 0) + 1; }));
      const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

      setStats({ total, avgExp, topSkills });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading dashboard...</p></div>;

  const actions = [
    { icon: '➕', title: 'Add Candidate', desc: 'Register a new candidate profile', path: '/add', color: 'var(--accent-purple)' },
    { icon: '🎯', title: 'Basic Shortlist', desc: 'Match candidates by skills & experience', path: '/shortlist', color: 'var(--accent-cyan)' },
    { icon: '🤖', title: 'AI Shortlist', desc: 'Let AI rank and explain best fits', path: '/ai-shortlist', color: 'var(--accent-green)' },
    { icon: '👥', title: 'View All', desc: 'Browse and search all candidates', path: '/candidates', color: 'var(--accent-amber)' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your candidate pipeline</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.avgExp}</div>
          <div className="stat-label">Avg. Experience (yrs)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛠️</div>
          <div className="stat-value">{stats.topSkills.length}</div>
          <div className="stat-label">Unique Top Skills</div>
        </div>
      </div>

      {stats.topSkills.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>🔥 Top Skills in Pool</h3>
          <div className="chart-container" style={{ padding: 0 }}>
            {stats.topSkills.map(([skill, count]) => (
              <div className="chart-bar-group" key={skill}>
                <span className="chart-label">{skill}</span>
                <div className="chart-bar">
                  <div className="chart-bar-fill" style={{ width: `${(count / stats.total) * 100}%` }}>
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>⚡ Quick Actions</h3>
      <div className="card-grid">
        {actions.map(a => (
          <Link key={a.path} to={a.path} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ cursor: 'pointer' }}>
              <div className="stat-icon">{a.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{a.title}</div>
              <div className="stat-label">{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
