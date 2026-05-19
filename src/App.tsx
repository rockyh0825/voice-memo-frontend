import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DraftReviewPage from './pages/DraftReviewPage';
import TaskListPage from './pages/TaskListPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { fetchTasks } from './api/tasks';

function InitialRedirect() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchTasks('draft')
      .then((drafts) =>
        navigate(drafts.length > 0 ? '/draft' : '/tasks', { replace: true, state: drafts.length > 0 ? { drafts } : undefined })
      )
      .catch(() => navigate('/tasks', { replace: true }))
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><InitialRedirect /></ProtectedRoute>} />
        <Route path="/draft" element={<ProtectedRoute><DraftReviewPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TaskListPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
