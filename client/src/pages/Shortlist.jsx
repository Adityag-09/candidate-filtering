import { useState } from 'react';
import SkillInput from '../components/SkillInput';
import SkillTag from '../components/SkillTag';
import { useToast } from '../components/Toast';
import { matchCandidates } from '../api';

export default function Shortlist() {
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [minExperience, setMinExperience] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) { toast('Add at least one required skill', 'error'); return; }
    setLoading(true);
    try {
      const res = await matchCandidates({ requiredSkills, preferredSkills, minExperience: Number(minExperience) || 0 });
      setResults(res.data);
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🎯 Basic Shortlist</h2>
        <p>Match candidates by skill overlap and experience</p>
      </div>

      <div className="card" style={{ maxWidth: 640, marginBottom: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Required Skills *</label>
            <SkillInput skills={requiredSkills} setSkills={setRequiredSkills} />
          </div>
          <div className="form-group">
            <label>Preferred Skills (optional)</label>
            <SkillInput skills={preferredSkills} setSkills={setPreferredSkills} />
          </div>
          <div className="form-group">
            <label>Minimum Experience (years)</label>
            <input className="form-input" type="number" min="0" value={minExperience} onChange={e => setMinExperience(e.target.value)} placeholder="e.g. 1" />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Matching...' : '🎯 Find Matches'}
          </button>
        </form>
      </div>

      {results && (
        <>
          {/* Score Chart */}
          {results.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📊 Match Score Distribution</h3>
              <div className="chart-container" style={{ padding: 0 }}>
                {results.map(c => (
                  <div className="chart-bar-group" key={c._id}>
                    <span className="chart-label">{c.name}</span>
                    <div className="chart-bar">
                      <div className="chart-bar-fill" style={{
                        width: `${c.matchScore}%`,
                        background: c.tier === 'High' ? 'linear-gradient(90deg, #10b981, #06b6d4)' :
                          c.tier === 'Medium' ? 'linear-gradient(90deg, #f59e0b, #f97316)' :
                          'linear-gradient(90deg, #f43f5e, #e11d48)'
                      }}>
                        {c.matchScore}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔍</div><p>No candidates found.</p></div>
          ) : (
            <div className="card-grid">
              {results.map(c => (
                <div key={c._id} className="card candidate-card">
                  <div className="card-header">
                    <div>
                      <div className="candidate-name">{c.name}</div>
                      <div className="candidate-email">{c.email}</div>
                    </div>
                    <span className={`tier-badge ${c.tier.toLowerCase()}`}>{c.tier}</span>
                  </div>
                  <div className="score-bar-wrapper">
                    <div className="score-bar-label">
                      <span>Match Score</span>
                      <span className="score-value">{c.matchScore}%</span>
                    </div>
                    <div className="score-bar">
                      <div className="score-bar-fill" style={{ width: `${c.matchScore}%` }}></div>
                    </div>
                  </div>
                  <div className="candidate-exp">Experience: <span>{c.experience} years</span> {!c.meetsExperience && <span style={{ color: 'var(--accent-rose)', fontSize: 11 }}>(below minimum)</span>}</div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Skills:</div>
                    <div className="skills-list">
                      {c.skills.map(s => <SkillTag key={s} skill={s} matched={c.matchedSkills.map(ms => ms.toLowerCase()).includes(s.toLowerCase())} />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
