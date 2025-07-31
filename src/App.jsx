import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d6efd',
    },
    secondary: {
      main: '#6c757d',
    },
    background: {
      default: '#f9f9f9',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You can add token validation here if needed
      setIsAuthenticated(true);
      // Try to get user data from localStorage or set default
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser({ email: 'user@example.com', username: 'user', role: 'user' });
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loginData) => {
    console.log('Login successful:', loginData);
    // Set user data based on login response
    if (loginData.user) {
      setUser(loginData.user);
    } else {
      setUser({
        email: loginData.email || 'user@example.com',
        username: loginData.username || 'user',
        role: loginData.role || 'user'
      });
    }
    setIsAuthenticated(true);
  };

  const handleSignup = (signupData) => {
    console.log('Signup successful:', signupData);
    // Set user data based on signup response
    if (signupData.user) {
      setUser(signupData.user);
    } else {
      setUser({
        email: signupData.email,
        username: signupData.username,
        role: signupData.role
      });
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ?
                <Navigate to="/dashboard" replace /> :
                <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ?
                <Navigate to="/dashboard" replace /> :
                <Signup onSignup={handleSignup} />
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            path="/"
            element={
              isAuthenticated ?
                <Navigate to="/dashboard" replace /> :
                <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
