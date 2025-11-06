import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Grid,
  Container,
  IconButton,
  Avatar,
  Divider,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import Home from './Home';
import StockManagement from './StockManagement';
import Categories from './Categories';
import StockChart from './StockChart';
import Payments from './Payments';
import {
  Home as HomeIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon
} from '@mui/icons-material'

const Dashboard = ({ user, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Enhanced mock data
  const [stockData, setStockData] = useState([
    { id: 1, product: 'Book A', category: 'Books', subcategory: 'Literature', quantity: 19, price: 299 },
    { id: 2, product: 'T-Shirt', category: 'Clothing', subcategory: 'Casual', quantity: 5, price: 499 },
    { id: 3, product: 'Trophy', category: 'Awards', subcategory: 'Gold', quantity: 12, price: 799 },
    { id: 4, product: 'Laptop', category: 'Electronics', subcategory: 'Computers', quantity: 8, price: 45000 },
    { id: 5, product: 'Headphones', category: 'Electronics', subcategory: 'Audio', quantity: 25, price: 1500 },
    { id: 6, product: 'Sneakers', category: 'Footwear', subcategory: 'Sports', quantity: 15, price: 2500 }
  ])
  const [recentStock, setRecentStock] = useState([
    { id: 1, product: 'Sample Book', category: 'Books', subcategory: 'Exam', quantity: 10, price: 199 },
    { id: 2, product: 'Graphic Tee', category: 'Clothing', subcategory: 'Printed', quantity: 15, price: 399 }
  ])
  const [paymentHistory, setPaymentHistory] = useState([
    { id: 1, product: 'Book A', name: 'Ravi', amount: '₹299', txnId: 'UTR12345678', status: 'valid', time: '15-Jul-2025 10:22 AM', type: 'Online' },
    { id: 2, product: 'T-Shirt', name: 'Neha', amount: '₹499', txnId: 'UTR98765432', status: 'pending', time: '15-Jul-2025 11:05 AM', type: 'Manual' }
  ])

  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0)
  const soldToday = 8
  const remainingStock = totalStock - soldToday
  const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  const drawerWidth = isMobile ? 240 : 280

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Filter menu items based on user role
  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'staff'] },
    { text: 'Stock Management', icon: <InventoryIcon />, path: '/dashboard/stock-management', roles: ['admin'] },
    { text: 'Categories', icon: <CategoryIcon />, path: '/dashboard/categories', roles: ['admin'] },
    { text: 'Payments', icon: <PaymentIcon />, path: '/dashboard/payments', roles: ['admin', 'staff'] }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.role || 'staff')
  )

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Beautiful Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3a8a 0%, #3730a3 50%, #1e3a8a 100%)',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5 }}>
            Stock Manager
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
            Admin Dashboard
          </Typography>
        </Box>
        
        <List sx={{ mt: 2, flex: 1, pr: 4 }}>
          {menuItems.map((item, index) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(5px)',
                  transition: 'all 0.3s ease'
                },
                ...(location.pathname === item.path && {
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                })
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    color: 'white'
                  } 
                }}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 2, color: 'white', fontWeight: 'bold' }}>
            Quick Stats
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>Total Stock:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e40af' }}>{totalStock}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'white' }}>Today's Sales:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>{soldToday}</Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, background: '#f8fafc' }}>
        {/* Top App Bar */}
        <AppBar position="static" elevation={0} sx={{ 
          background: 'white', 
          color: '#333',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <InventoryIcon sx={{ mr: 1, color: '#667eea' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.25rem', color: '#333' }}>
                  {location.pathname === '/dashboard' && 'Dashboard Overview'}
                  {location.pathname === '/dashboard/stock-management' && 'Stock Management'}
                  {location.pathname === '/dashboard/categories' && 'Category Management'}
                  {location.pathname === '/dashboard/payments' && 'Payment System'}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              {!isMobile && (
                <>
                  <IconButton sx={{ color: '#667eea' }}>
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', width: 32, height: 32 }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                      {user?.username || 'User'}
                    </Typography>
                  </Box>
                </>
              )}
              {isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', width: 28, height: 28 }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.8rem' }}>
                    {user?.username || 'User'}
                  </Typography>
                </Box>
              )}
              <Button
                variant="contained"
                size="small"
                onClick={onLogout}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  px: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Home stockData={stockData} recentStock={recentStock} paymentHistory={paymentHistory} />} />
            <Route path="/stock-management" element={<StockManagement stockData={stockData} />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 