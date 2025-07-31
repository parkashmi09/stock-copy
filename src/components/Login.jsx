import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Container,
  Paper,
  Avatar,
  Divider,
  Link,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Login as LoginIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  ArrowForward,
  Star,
  Circle
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../config';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Store user data including username in localStorage
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        onLogin(data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced SVG Illustration Component
  const LoginIllustration = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      p: 3,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite'
      }}>
        <Circle sx={{ position: 'absolute', top: '10%', left: '10%', fontSize: 40, color: 'white' }} />
        <Circle sx={{ position: 'absolute', top: '20%', right: '15%', fontSize: 30, color: 'white', animation: 'float 4s ease-in-out infinite 1s' }} />
        <Circle sx={{ position: 'absolute', bottom: '30%', left: '20%', fontSize: 25, color: 'white', animation: 'float 5s ease-in-out infinite 2s' }} />
      </Box>

      {/* Main Illustration */}
      <Box sx={{ 
        width: isMobile ? '70%' : '60%', 
        maxWidth: 300,
        mb: 3,
        position: 'relative',
        zIndex: 2
      }}>
        <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Animated Dashboard */}
          <rect x="100" y="60" width="100" height="80" rx="8" fill="url(#mainGradient)" stroke="white" strokeWidth="2" opacity="0.9"/>
          
          {/* Glowing Effect */}
          <rect x="100" y="60" width="100" height="80" rx="8" fill="url(#glowGradient)" opacity="0.3"/>
          
          {/* Screen */}
          <rect x="110" y="70" width="80" height="50" rx="4" fill="url(#screenGradient)"/>
          
          {/* Animated Screen Content */}
          <rect x="120" y="80" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
          </rect>
          <rect x="140" y="80" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.5s"/>
          </rect>
          <rect x="160" y="80" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="1s"/>
          </rect>
          <rect x="180" y="80" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="1.5s"/>
          </rect>
          
          <rect x="120" y="95" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.3s"/>
          </rect>
          <rect x="140" y="95" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.8s"/>
          </rect>
          <rect x="160" y="95" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="1.3s"/>
          </rect>
          <rect x="180" y="95" width="15" height="10" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="1.8s"/>
          </rect>
          
          {/* Stand */}
          <rect x="140" y="140" width="20" height="25" fill="url(#standGradient)"/>
          <rect x="135" y="165" width="30" height="8" rx="4" fill="url(#standGradient)"/>
          
          {/* Animated Charts */}
          <g transform="translate(30, 120)">
            <rect x="0" y="0" width="50" height="30" rx="4" fill="url(#chartGradient1)" stroke="white" strokeWidth="1"/>
            <path d="M8 25 L15 20 L22 22 L30 18 L38 20" stroke="white" strokeWidth="2" fill="none">
              <animate attributeName="stroke-dasharray" values="0,50;50,0" dur="3s" repeatCount="indefinite"/>
            </path>
          </g>
          
          <g transform="translate(220, 120)">
            <rect x="0" y="0" width="50" height="30" rx="4" fill="url(#chartGradient2)" stroke="white" strokeWidth="1"/>
            <rect x="10" y="20" width="6" height="10" fill="white" opacity="0.8">
              <animate attributeName="height" values="10;15;10" dur="2s" repeatCount="indefinite"/>
            </rect>
            <rect x="20" y="18" width="6" height="12" fill="white" opacity="0.8">
              <animate attributeName="height" values="12;18;12" dur="2s" repeatCount="indefinite" begin="0.5s"/>
            </rect>
            <rect x="30" y="22" width="6" height="8" fill="white" opacity="0.8">
              <animate attributeName="height" values="8;13;8" dur="2s" repeatCount="indefinite" begin="1s"/>
            </rect>
          </g>
          
          {/* Floating Icons with Animation */}
          <g transform="translate(50, 80)">
            <circle cx="0" cy="0" r="12" fill="url(#iconGradient1)" stroke="white" strokeWidth="2">
              <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite"/>
            </circle>
            <InventoryIcon sx={{ fontSize: 16, color: 'white', transform: 'translate(-8px, -8px)' }} />
          </g>
          
          <g transform="translate(250, 60)">
            <circle cx="0" cy="0" r="12" fill="url(#iconGradient2)" stroke="white" strokeWidth="2">
              <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite" begin="1.5s"/>
            </circle>
            <AnalyticsIcon sx={{ fontSize: 16, color: 'white', transform: 'translate(-8px, -8px)' }} />
          </g>
          
          {/* Enhanced Gradients */}
          <defs>
            <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea"/>
              <stop offset="50%" stopColor="#764ba2"/>
              <stop offset="100%" stopColor="#667eea"/>
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#667eea"/>
            </linearGradient>
            <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c3e50"/>
              <stop offset="100%" stopColor="#34495e"/>
            </linearGradient>
            <linearGradient id="standGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#95a5a6"/>
              <stop offset="100%" stopColor="#7f8c8d"/>
            </linearGradient>
            <linearGradient id="chartGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e74c3c"/>
              <stop offset="100%" stopColor="#c0392b"/>
            </linearGradient>
            <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f39c12"/>
              <stop offset="100%" stopColor="#e67e22"/>
            </linearGradient>
            <linearGradient id="iconGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e91e63"/>
              <stop offset="100%" stopColor="#c2185b"/>
            </linearGradient>
            <linearGradient id="iconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9c27b0"/>
              <stop offset="100%" stopColor="#7b1fa2"/>
            </linearGradient>
          </defs>
        </svg>
      </Box>
      
      {/* Welcome Text */}
      <Box sx={{ textAlign: 'center', maxWidth: 280, position: 'relative', zIndex: 2 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          mb: 2, 
          color:'white',
          // background: 'linear-gradient(45deg, #667eea, #764ba2)',
          // backgroundClip: 'text',
          // WebkitBackgroundClip: 'text',
          // WebkitTextFillColor: 'transparent',
          fontSize: isMobile ? '1.75rem' : '2rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Welcome Back!
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          mb: 3,
          fontSize: '0.95rem',
          fontWeight: 300
        }}>
          Access your stock management dashboard
        </Typography>
        
        {/* Feature Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ color: '#2ecc71', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Secure</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#f39c12', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Analytics</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        pointerEvents: 'none'
      }}>
        <Star sx={{ position: 'absolute', top: '10%', left: '5%', fontSize: 20, animation: 'twinkle 3s ease-in-out infinite' }} />
        <Star sx={{ position: 'absolute', top: '20%', right: '10%', fontSize: 15, animation: 'twinkle 4s ease-in-out infinite 1s' }} />
        <Star sx={{ position: 'absolute', bottom: '30%', left: '15%', fontSize: 25, animation: 'twinkle 5s ease-in-out infinite 2s' }} />
        <Star sx={{ position: 'absolute', bottom: '20%', right: '20%', fontSize: 18, animation: 'twinkle 3.5s ease-in-out infinite 1.5s' }} />
      </Box>

      <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Fade in={animate} timeout={1000}>
          <Card sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            minHeight: isMobile ? 'auto' : 500,
            position: 'relative'
          }}>
            {/* Card Glow Effect */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: 3,
              pointerEvents: 'none'
            }} />

            <Box sx={{ display: 'flex', minHeight: isMobile ? 'auto' : 500 }}>
              {/* Left Side - Illustration */}
              {!isMobile && (
                <Slide direction="right" in={animate} timeout={800}>
                  <Box sx={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <LoginIllustration />
                  </Box>
                </Slide>
              )}

              {/* Right Side - Login Form */}
              <Slide direction="left" in={animate} timeout={800}>
                <Box sx={{ 
                  flex: 1, 
                  p: isMobile ? 3 : 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {/* Mobile Header */}
                  {isMobile && (
                    <Grow in={animate} timeout={1200}>
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Avatar sx={{
                          width: 60,
                          height: 60,
                          mx: 'auto',
                          mb: 2,
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          fontSize: '1.5rem',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}>
                          🔐
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
                          Welcome Back
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                          Sign in to your account
                        </Typography>
                      </Box>
                    </Grow>
                  )}

                  {/* Desktop Header */}
                  {!isMobile && (
                    <Grow in={animate} timeout={1200}>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
                          Sign In
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                          Access your stock management dashboard
                        </Typography>
                      </Box>
                    </Grow>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <Fade in={!!error}>
                      <Alert severity="error" sx={{ mb: 3, fontSize: '0.9rem' }}>
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  {/* Login Form */}
                  <Grow in={animate} timeout={1400}>
                    <Box component="form" onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#667eea', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        size="medium"
                        inputProps={{ style: { fontSize: '0.95rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                      />

                      <TextField
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        sx={{ mb: 4 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#667eea', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        size="medium"
                        inputProps={{ style: { fontSize: '0.95rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="medium"
                        disabled={isLoading}
                        endIcon={isLoading ? null : <ArrowForward sx={{ fontSize: 20 }} />}
                        sx={{
                          mb: 3,
                          py: 1.2,
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          borderRadius: 2,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                          },
                          '&:disabled': {
                            background: 'linear-gradient(45deg, #95a5a6, #7f8c8d)',
                            transform: 'none',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Box>
                  </Grow>

                  {/* Signup Link */}
                  <Grow in={animate} timeout={1600}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Don't have an account?{' '}
                        <Link
                          component={RouterLink}
                          to="/signup"
                          variant="body2"
                          sx={{
                            color: '#667eea',
                            textDecoration: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Sign up here
                        </Link>
                      </Typography>
                    </Box>
                  </Grow>

          
                </Box>
              </Slide>
            </Box>
          </Card>
        </Fade>
      </Container>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes twinkle {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.1); }
          }
        `}
      </style>
    </Box>
  );
};

export default Login; 