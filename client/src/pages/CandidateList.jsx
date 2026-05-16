import { useState, useEffect } from 'react';
import SkillTag from '../components/SkillTag';
import { useToast } from '../components/Toast';
import { fetchCandidates, deleteCandidate } from '../api';

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = (q = '') => {
    setLoading(true);
    fetchCandidates(q).then(res => { setCandidates(res.data); setLoading(false); })
      .catch(err => { toast(err.message, 'error'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    load(e.target.value);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this candidate?')) return;
    try {
      await deleteCandidate(id);
      toast('Candidate deleted', 'success');
      load(search);
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Candidates</h2>
        <p>Browse and manage all registered candidates</p>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input className="form-input" value={search} onChange={handleSearch} placeholder="Search by name, email, or skill..." />
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div><p>Loading candidates...</p></div>
      ) : candidates.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👤</div><p>No candidates found. Add some first!</p></div>
      ) : (
        <div className="card-grid">
          {candidates.map(c => (
            <div key={c._id} className="card candidate-card">
              <div className="card-header">
                <div>
                  <div className="candidate-name">{c.name}</div>
                  <div className="candidate-email">{c.email}</div>
                </div>
              </div>
              <div className="candidate-exp">Experience: <span>{c.experience} years</span></div>
              {c.projects && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{c.projects}</p>}
              <div style={{ marginTop: 12 }}>
                <div className="skills-list">
                  {c.skills.map(s => <SkillTag key={s} skill={s} />)}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
