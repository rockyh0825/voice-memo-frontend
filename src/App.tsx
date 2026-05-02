import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DraftReviewPage from './pages/DraftReviewPage';
import TaskListPage from './pages/TaskListPage';
import VoiceInputPage from './pages/VoiceInputPage';
import { fetchTasks } from './api/tasks';

function InitialRedirect() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchTasks('draft')
      .then((drafts) => navigate(drafts.length > 0 ? '/draft' : '/tasks', { replace: true }))
      .catch(() => navigate('/tasks', { replace: true }))
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-3">🎤</div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InitialRedirect />} />
        <Route path="/draft" element={<DraftReviewPage />} />
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/voice" element={<VoiceInputPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
