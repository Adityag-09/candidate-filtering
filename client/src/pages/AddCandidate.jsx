import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillInput from '../components/SkillInput';
import { useToast } from '../components/Toast';
import { addCandidate } from '../api';

export default function AddCandidate() {
  const [form, setForm] = useState({ name: '', email: '', experience: '', projects: '' });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || skills.length === 0) {
      toast('Please fill all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await addCandidate({ ...form, experience: Number(form.experience) || 0, skills });
      toast('Candidate added successfully!', 'success');
      setForm({ name: '', email: '', experience: '', projects: '' });
      setSkills([]);
      setTimeout(() => navigate('/candidates'), 800);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Add Candidate</h2>
        <p>Register a new candidate profile</p>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rahul Sharma" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. rahul@gmail.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Skills *</label>
            <SkillInput skills={skills} setSkills={setSkills} />
          </div>
          <div className="form-group">
            <label>Experience (years)</label>
            <input className="form-input" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} placeholder="e.g. 2" />
          </div>
          <div className="form-group">
            <label>Projects / Bio</label>
            <textarea className="form-textarea" name="projects" value={form.projects} onChange={handleChange} placeholder="Brief description of projects or background..." />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? '⏳ Adding...' : '➕ Add Candidate'}
          </button>
        </form>
      </div>
    </div>
  );
}
