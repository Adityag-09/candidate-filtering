import { useState } from 'react';
import SkillInput from '../components/SkillInput';
import SkillTag from '../components/SkillTag';
import { useToast } from '../components/Toast';
import { aiShortlist, aiInterviewQuestions } from '../api';

export default function AIShortlist() {
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [minExperience, setMinExperience] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionsFor, setQuestionsFor] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) { toast('Add at least one required skill', 'error'); return; }
    setLoading(true);
    setResults(null);
    setQuestionsFor(null);
    try {
      const res = await aiShortlist({ requiredSkills, preferredSkills, minExperience: Number(minExperience) || 0 });
      setResults(res.data);
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleGenQuestions = async (candidate) => {
    setLoadingQ(true);
    setQuestionsFor(candidate.name);
    setQuestions([]);
    try {
      const res = await aiInterviewQuestions({
        candidateName: candidate.name,
        skills: candidate.skills,
        experience: candidate.experience,
        jobSkills: requiredSkills,
      });
      setQuestions(res.data);
    } catch (err) { toast(err.message, 'error'); setQuestionsFor(null); }
    finally { setLoadingQ(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🤖 AI Shortlist</h2>
        <p>Let AI analyze and rank candidates with detailed explanations</p>
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
            <input className="form-input" type="number" min="0" value={minExperience} onChange={e => setMinExperience(e.target.value)} placeholder="e.g. 2" />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? '🤖 AI is thinking...' : '🤖 AI Shortlist'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>AI is analyzing candidate profiles...</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This may take a few seconds</p>
        </div>
      )}

      {results && !loading && (
        <>
          {results.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📊 AI Match Scores</h3>
              <div className="chart-container" style={{ padding: 0 }}>
                {results.map((c, i) => (
                  <div className="chart-bar-group" key={i}>
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

          <div className="card-grid">
            {results.map((c, i) => (
              <div key={i} className="card candidate-card">
                <div className="card-header">
                  <div>
                    <div className="candidate-name">{c.name}</div>
                    <div className="candidate-email">{c.email}</div>
                  </div>
                  <span className={`tier-badge ${c.tier.toLowerCase()}`}>{c.tier}</span>
                </div>
                <div className="score-bar-wrapper">
                  <div className="score-bar-label">
                    <span>AI Score</span>
                    <span className="score-value">{c.matchScore}%</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-bar-fill" style={{ width: `${c.matchScore}%` }}></div>
                  </div>
                </div>
                <div className="candidate-exp">Experience: <span>{c.experience} years</span></div>
                <div style={{ marginTop: 12 }}>
                  <div className="skills-list">
                    {c.skills.map(s => <SkillTag key={s} skill={s} />)}
                  </div>
                </div>
                <div className="ai-explanation">{c.explanation}</div>
                <div className="card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleGenQuestions(c)}>
                    💡 Interview Questions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {questionsFor && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>💡 Interview Questions for {questionsFor}</h3>
          {loadingQ ? (
            <div className="loading-state"><div className="spinner"></div><p>Generating questions...</p></div>
          ) : (
            questions.map((q, i) => (
              <div key={i} className="question-card card" style={{ marginBottom: 12 }}>
                <div className="q-header">
                  <span className="q-category">{q.category}</span>
                  <span className={`q-difficulty ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                </div>
                <div className="q-text">{q.question}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
