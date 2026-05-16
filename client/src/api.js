const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export async function fetchCandidates(search = '') {
  const url = search ? `${API}/candidates?search=${encodeURIComponent(search)}` : `${API}/candidates`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function addCandidate(candidate) {
  const res = await fetch(`${API}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function deleteCandidate(id) {
  const res = await fetch(`${API}/candidates/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function matchCandidates(job) {
  const res = await fetch(`${API}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function aiShortlist(job) {
  const res = await fetch(`${API}/ai/shortlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function aiInterviewQuestions(payload) {
  const res = await fetch(`${API}/ai/interview-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}
