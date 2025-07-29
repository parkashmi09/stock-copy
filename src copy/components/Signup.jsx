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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  PersonAdd,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Rocket as RocketIcon,
  ArrowForward,
  Star,
  Circle
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../config';

const Signup = ({ onSignup }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'staff'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    // Validation
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        setError('');
        onSignup(data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced SVG Illustration Component
  const SignupIllustration = () => (
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
        opacity: 0.15,
        animation: 'float 6s ease-in-out infinite'
      }}>
        <Circle sx={{ position: 'absolute', top: '10%', left: '8%', fontSize: 40, color: 'white' }} />
        <Circle sx={{ position: 'absolute', top: '25%', right: '12%', fontSize: 30, color: 'white', animation: 'float 4s ease-in-out infinite 1s' }} />
        <Circle sx={{ position: 'absolute', bottom: '30%', left: '15%', fontSize: 35, color: 'white', animation: 'float 5s ease-in-out infinite 2s' }} />
        <Circle sx={{ position: 'absolute', bottom: '15%', right: '20%', fontSize: 25, color: 'white', animation: 'float 3.5s ease-in-out infinite 1.5s' }} />
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
          {/* Main Dashboard Platform */}
          <rect x="80" y="80" width="140" height="100" rx="12" fill="url(#platformGradient)" stroke="white" strokeWidth="2" opacity="0.95"/>
          
          {/* Central Monitor */}
          <rect x="100" y="90" width="100" height="70" rx="8" fill="url(#monitorGradient)" stroke="white" strokeWidth="2">
            <animate attributeName="opacity" values="0.9;0.7;0.9" dur="3s" repeatCount="indefinite"/>
          </rect>
          
          {/* Monitor Screen */}
          <rect x="105" y="95" width="90" height="55" rx="4" fill="url(#screenGradient)"/>
          
          {/* Animated Screen Content */}
          <rect x="115" y="105" width="20" height="8" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
          </rect>
          <rect x="140" y="105" width="20" height="8" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.5s"/>
          </rect>
          <rect x="165" y="105" width="20" height="8" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="1s"/>
          </rect>
          
          <rect x="115" y="120" width="20" height="8" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.3s"/>
          </rect>
          <rect x="140" y="120" width="20" height="8" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.8s"/>
          </rect>
          <rect x="165" y="120" width="20" height="8" rx="2" fill="white" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="1.3s"/>
          </rect>
          
          {/* Monitor Stand */}
          <rect x="135" y="170" width="30" height="15" fill="url(#standGradient)"/>
          <rect x="125" y="185" width="50" height="8" rx="4" fill="url(#standGradient)"/>
          
          {/* Floating Data Cards */}
          <g transform="translate(20, 120)">
            <rect x="0" y="0" width="45" height="35" rx="6" fill="url(#cardGradient1)" stroke="white" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.9;0.6;0.9" dur="3s" repeatCount="indefinite"/>
            </rect>
            <rect x="8" y="8" width="8" height="6" rx="2" fill="white" opacity="0.9"/>
            <rect x="20" y="8" width="8" height="6" rx="2" fill="white" opacity="0.9"/>
            <rect x="8" y="18" width="8" height="6" rx="2" fill="white" opacity="0.9"/>
            <rect x="20" y="18" width="8" height="6" rx="2" fill="white" opacity="0.9"/>
            <rect x="8" y="28" width="8" height="6" rx="2" fill="white" opacity="0.9"/>
            <rect x="20" y="28" width="8" height="6" rx="2" fill="white" opacity="0.9"/>
          </g>
          
          <g transform="translate(235, 120)">
            <rect x="0" y="0" width="45" height="35" rx="6" fill="url(#cardGradient2)" stroke="white" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.9;0.6;0.9" dur="3s" repeatCount="indefinite" begin="1.5s"/>
            </rect>
            <path d="M8 30 L15 25 L22 27 L30 23 L38 25" stroke="white" strokeWidth="2" fill="none">
              <animate attributeName="stroke-dasharray" values="0,40;40,0" dur="3s" repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* Animated Charts */}
          <g transform="translate(30, 160)">
            <rect x="0" y="0" width="60" height="30" rx="4" fill="url(#chartGradient1)" stroke="white" strokeWidth="1"/>
            <rect x="8" y="20" width="6" height="10" fill="white" opacity="0.8">
              <animate attributeName="height" values="10;15;10" dur="2s" repeatCount="indefinite"/>
            </rect>
            <rect x="18" y="18" width="6" height="12" fill="white" opacity="0.8">
              <animate attributeName="height" values="12;18;12" dur="2s" repeatCount="indefinite" begin="0.5s"/>
            </rect>
            <rect x="28" y="22" width="6" height="8" fill="white" opacity="0.8">
              <animate attributeName="height" values="8;13;8" dur="2s" repeatCount="indefinite" begin="1s"/>
            </rect>
            <rect x="38" y="20" width="6" height="10" fill="white" opacity="0.8">
              <animate attributeName="height" values="10;16;10" dur="2s" repeatCount="indefinite" begin="1.5s"/>
            </rect>
            <rect x="48" y="24" width="6" height="6" fill="white" opacity="0.8">
              <animate attributeName="height" values="6;12;6" dur="2s" repeatCount="indefinite" begin="2s"/>
            </rect>
          </g>
          
          <g transform="translate(210, 160)">
            <rect x="0" y="0" width="60" height="30" rx="4" fill="url(#chartGradient2)" stroke="white" strokeWidth="1"/>
            <path d="M8 25 L15 20 L22 22 L30 18 L38 20 L46 15" stroke="white" strokeWidth="2" fill="none">
              <animate attributeName="stroke-dasharray" values="0,50;50,0" dur="4s" repeatCount="indefinite"/>
            </path>
          </g>
          
          {/* Floating Icons with Enhanced Animation */}
          <g transform="translate(50, 90)">
            <circle cx="0" cy="0" r="18" fill="url(#iconGradient1)" stroke="white" strokeWidth="2">
              <animate attributeName="r" values="18;20;18" dur="3s" repeatCount="indefinite"/>
            </circle>
            <InventoryIcon sx={{ fontSize: 22, color: 'white', transform: 'translate(-11px, -11px)' }} />
          </g>
          
          <g transform="translate(250, 70)">
            <circle cx="0" cy="0" r="18" fill="url(#iconGradient2)" stroke="white" strokeWidth="2">
              <animate attributeName="r" values="18;20;18" dur="3s" repeatCount="indefinite" begin="1.5s"/>
            </circle>
            <AnalyticsIcon sx={{ fontSize: 22, color: 'white', transform: 'translate(-11px, -11px)' }} />
          </g>
          
          {/* Additional Floating Elements */}
          <g transform="translate(180, 40)">
            <circle cx="0" cy="0" r="12" fill="url(#accentGradient1)" stroke="white" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="4s" repeatCount="indefinite"/>
            </circle>
          </g>
          
          <g transform="translate(70, 50)">
            <circle cx="0" cy="0" r="10" fill="url(#accentGradient2)" stroke="white" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="4s" repeatCount="indefinite" begin="2s"/>
            </circle>
          </g>
          
          {/* Enhanced Gradients */}
          <defs>
            <linearGradient id="platformGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2ecc71"/>
              <stop offset="50%" stopColor="#27ae60"/>
              <stop offset="100%" stopColor="#2ecc71"/>
            </linearGradient>
            <linearGradient id="monitorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3498db"/>
              <stop offset="100%" stopColor="#2980b9"/>
            </linearGradient>
            <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c3e50"/>
              <stop offset="100%" stopColor="#34495e"/>
            </linearGradient>
            <linearGradient id="standGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#95a5a6"/>
              <stop offset="100%" stopColor="#7f8c8d"/>
            </linearGradient>
            <linearGradient id="cardGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e74c3c"/>
              <stop offset="100%" stopColor="#c0392b"/>
            </linearGradient>
            <linearGradient id="cardGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f39c12"/>
              <stop offset="100%" stopColor="#e67e22"/>
            </linearGradient>
            <linearGradient id="chartGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9b59b6"/>
              <stop offset="100%" stopColor="#8e44ad"/>
            </linearGradient>
            <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1abc9c"/>
              <stop offset="100%" stopColor="#16a085"/>
            </linearGradient>
            <linearGradient id="iconGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e91e63"/>
              <stop offset="100%" stopColor="#c2185b"/>
            </linearGradient>
            <linearGradient id="iconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9c27b0"/>
              <stop offset="100%" stopColor="#7b1fa2"/>
            </linearGradient>
            <linearGradient id="accentGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00bcd4"/>
              <stop offset="100%" stopColor="#0097a7"/>
            </linearGradient>
            <linearGradient id="accentGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9800"/>
              <stop offset="100%" stopColor="#f57c00"/>
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
          // background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
          // backgroundClip: 'text',
          // WebkitBackgroundClip: 'text',
          // WebkitTextFillColor: 'transparent',
          fontSize: isMobile ? '1.75rem' : '2rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Join Us Today!
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255,255,255,0.9)', 
          mb: 3,
          fontSize: '0.95rem',
          fontWeight: 300
        }}>
          Start your journey with our platform
        </Typography>
        
        {/* Feature Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RocketIcon sx={{ color: '#2ecc71', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Fast Setup</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ color: '#3498db', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Secure</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #2ecc71 100%)',
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
        <Star sx={{ position: 'absolute', top: '15%', left: '8%', fontSize: 18, animation: 'twinkle 3s ease-in-out infinite' }} />
        <Star sx={{ position: 'absolute', top: '25%', right: '12%', fontSize: 22, animation: 'twinkle 4s ease-in-out infinite 1s' }} />
        <Star sx={{ position: 'absolute', bottom: '35%', left: '12%', fontSize: 20, animation: 'twinkle 5s ease-in-out infinite 2s' }} />
        <Star sx={{ position: 'absolute', bottom: '25%', right: '15%', fontSize: 16, animation: 'twinkle 3.5s ease-in-out infinite 1.5s' }} />
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
              background: 'linear-gradient(45deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.1))',
              borderRadius: 3,
              pointerEvents: 'none'
            }} />

            <Box sx={{ display: 'flex', minHeight: isMobile ? 'auto' : 500 }}>
              {/* Left Side - Illustration */}
              {!isMobile && (
                <Slide direction="right" in={animate} timeout={800}>
                  <Box sx={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <SignupIllustration />
                  </Box>
                </Slide>
              )}

              {/* Right Side - Signup Form */}
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
                          background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
                          fontSize: '1.5rem',
                          boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)'
                        }}>
                          🚀
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
                          Create Account
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                          Join our Stock Management platform
                        </Typography>
                      </Box>
                    </Grow>
                  )}

                  {/* Desktop Header */}
                  {!isMobile && (
                    <Grow in={animate} timeout={1200}>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
                          Create Account
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                          Join our powerful stock management platform
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

                  {/* Signup Form */}
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
                              <Email sx={{ color: '#2ecc71', fontSize: 20 }} />
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
                        name="username"
                        label="Username"
                        value={formData.username}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#2ecc71', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        size="medium"
                        inputProps={{ style: { fontSize: '0.95rem' } }}
                        InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                      />

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel sx={{ fontSize: '0.9rem' }}>Role</InputLabel>
                        <Select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          label="Role"
                          sx={{ fontSize: '0.95rem' }}
                        >
                          <MenuItem value="staff" sx={{ fontSize: '0.9rem' }}>Staff</MenuItem>
                          <MenuItem value="admin" sx={{ fontSize: '0.9rem' }}>Admin</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#2ecc71', fontSize: 20 }} />
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

                      <TextField
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        sx={{ mb: 4 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#2ecc71', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                size="small"
                              >
                                {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
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
                          background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
                          borderRadius: 2,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #27ae60, #229954)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(46, 204, 113, 0.4)'
                          },
                          '&:disabled': {
                            background: 'linear-gradient(45deg, #95a5a6, #7f8c8d)',
                            transform: 'none',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Box>
                  </Grow>

                  {/* Login Link */}
                  <Grow in={animate} timeout={1600}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Already have an account?{' '}
                        <Link
                          component={RouterLink}
                          to="/login"
                          variant="body2"
                          sx={{
                            color: '#2ecc71',
                            textDecoration: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Sign in here
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

export default Signup; 