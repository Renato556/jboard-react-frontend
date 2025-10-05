import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import JobBoard from './components/Job/JobBoard.jsx';
import Login from './components/User/Login.jsx';
import Profile from './components/User/Profile.jsx';
import ProtectedRoute from './components/User/ProtectedRoute.jsx';
import { authService } from './services/auth';
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    navigate('/home');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Carregando...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <JobBoard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Profile onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App
