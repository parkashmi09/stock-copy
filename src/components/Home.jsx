import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Divider,
  Badge,
  Chip,
  Container
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Inventory as InventoryIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import StockChart from './StockChart';
import { API_BASE_URL } from '../config';

const Home = ({ stockData, recentStock, paymentHistory }) => {
  const [weeklySales, setWeeklySales] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch weekly sales data
  useEffect(() => {
    const fetchWeeklySales = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/weekly-sales`);
        if (response.ok) {
          const data = await response.json();
          setWeeklySales(data);
        } else {
          console.error('Failed to fetch weekly sales data');
        }
      } catch (error) {
        console.error('Error fetching weekly sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklySales();
  }, []);

  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
  const soldToday = 8;
  const remainingStock = totalStock - soldToday;
  const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Chart data using API data
  const salesData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Sales (₹)',
        data: [
          weeklySales.Monday || 0,
          weeklySales.Tuesday || 0,
          weeklySales.Wednesday || 0,
          weeklySales.Thursday || 0,
          weeklySales.Friday || 0,
          weeklySales.Saturday || 0,
          weeklySales.Sunday || 0
        ],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const stockChartData = {
    labels: ['Books', 'Clothing', 'Electronics', 'Footwear', 'Awards'],
    datasets: [
      {
        label: 'Stock Quantity',
        data: [29, 20, 33, 15, 12],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
   
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                mx: 'auto', 
                mb: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)'
              }}>
                <InventoryIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                {totalStock}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                mx: 'auto', 
                mb: 2,
                background: 'linear-gradient(45deg, #2ecc71, #27ae60)'
              }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                {soldToday}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sold Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                mx: 'auto', 
                mb: 2,
                background: 'linear-gradient(45deg, #f39c12, #e67e22)'
              }}>
                <MoneyIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                ₹{totalValue.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                mx: 'auto', 
                mb: 2,
                background: 'linear-gradient(45deg, #e74c3c, #c0392b)'
              }}>
                <CartIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                {remainingStock}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Remaining Stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2c3e50' }}>
                Sales Analytics
              </Typography>
              <Box sx={{ height: 300 }}>
                {loading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography>Loading sales data...</Typography>
                  </Box>
                ) : (
                  <StockChart data={salesData} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2c3e50' }}>
                Stock Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <StockChart data={stockChartData} type="doughnut" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2c3e50' }}>
                Recent Stock Updates
              </Typography>
              {recentStock.map((item, index) => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 2, 
                  mb: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                      {item.product}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.category} • {item.subcategory}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#667eea' }}>
                      Qty: {item.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      ₹{item.price}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2c3e50' }}>
                Recent Payments
              </Typography>
              {paymentHistory.map((payment, index) => (
                <Box key={payment.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 2, 
                  mb: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                      {payment.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {payment.product} • {payment.time}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#667eea' }}>
                      {payment.amount}
                    </Typography>
                    <Chip 
                      label={payment.status} 
                      size="small" 
                      color={payment.status === 'valid' ? 'success' : 'warning'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 