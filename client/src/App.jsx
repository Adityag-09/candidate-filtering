import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import AddCandidate from './pages/AddCandidate';
import CandidateList from './pages/CandidateList';
import Shortlist from './pages/Shortlist';
import AIShortlist from './pages/AIShortlist';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddCandidate />} />
              <Route path="/candidates" element={<CandidateList />} />
              <Route path="/shortlist" element={<Shortlist />} />
              <Route path="/ai-shortlist" element={<AIShortlist />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
