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
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../config';

const StockManagement = () => {
  const [stockData, setStockData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStocks, setIsFetchingStocks] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // New stock form state
  const [newStock, setNewStock] = useState({
    name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    subcategory: ''
  });

  // Edit stock form state
  const [editStock, setEditStock] = useState({
    name: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    subcategory: ''
  });

  // Fetch stocks and categories on component mount
  useEffect(() => {
    fetchStocks();
    fetchCategories();
  }, []);

  // Fetch stocks from API
  const fetchStocks = async () => {
    setIsFetchingStocks(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.STOCKS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStockData(data);
      } else {
        console.error('Failed to fetch stocks');
        showNotification('Failed to load stocks', 'error');
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      showNotification('Network error while loading stocks', 'error');
    } finally {
      setIsFetchingStocks(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CATEGORIES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        
        // Extract all subcategories
        const allSubcategories = data.reduce((acc, category) => {
          return acc.concat(category.subcategories || []);
        }, []);
        setSubcategories(allSubcategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Create new stock
  const createStock = async () => {
    if (!newStock.name.trim() || !newStock.quantity || !newStock.price || !newStock.category || !newStock.subcategory) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.STOCKS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newStock.name,
          description: newStock.description,
          quantity: parseInt(newStock.quantity),
          price: parseFloat(newStock.price),
          category: newStock.category,
          subcategory: newStock.subcategory
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh stocks after creation
        await fetchStocks();
        setNewStock({
          name: '',
          description: '',
          quantity: '',
          price: '',
          category: '',
          subcategory: ''
        });
        setOpenStockDialog(false);
        showNotification('Stock created successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to create stock', 'error');
      }
    } catch (error) {
      console.error('Stock creation error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit stock
  const handleEditStock = (stock) => {
    setSelectedStock(stock);
    setEditStock({
      name: stock.name,
      description: stock.description || '',
      quantity: stock.quantity.toString(),
      price: stock.price.toString(),
      category: stock.category?._id || '',
      subcategory: stock.subcategory?._id || ''
    });
    setOpenEditDialog(true);
  };

  // Update stock
  const updateStock = async () => {
    if (!editStock.name.trim() || !editStock.quantity || !editStock.price || !editStock.category || !editStock.subcategory) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.STOCKS_UPDATE}/${selectedStock._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editStock.name,
          description: editStock.description,
          quantity: parseInt(editStock.quantity),
          price: parseFloat(editStock.price),
          category: editStock.category,
          subcategory: editStock.subcategory
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh stocks after update
        await fetchStocks();
        setOpenEditDialog(false);
        setSelectedStock(null);
        showNotification('Stock updated successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to update stock', 'error');
      }
    } catch (error) {
      console.error('Stock update error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete stock
  const handleDeleteStock = (stock) => {
    setSelectedStock(stock);
    setOpenDeleteDialog(true);
  };

  // Delete stock
  const deleteStock = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.STOCKS_DELETE}/${selectedStock._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh stocks after deletion
        await fetchStocks();
        setOpenDeleteDialog(false);
        setSelectedStock(null);
        showNotification('Stock deleted successfully!', 'success');
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to delete stock', 'error');
      }
    } catch (error) {
      console.error('Stock deletion error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.price), 0);

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
                {stockData.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Products
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
                {stockData.filter(item => item.quantity < 10).length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock Table */}
      <Card sx={{ 
        borderRadius: 3, 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
              Stock Inventory
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchStocks}
                disabled={isFetchingStocks}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenStockDialog(true)}
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                  }
                }}
              >
                Add New Product
              </Button>
            </Box>
          </Box>
          
          {isFetchingStocks ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading stocks...
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subcategory</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockData.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.category?.name || 'Unknown'} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.subcategory?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: item.quantity < 10 ? '#e74c3c' : '#2ecc71' 
                          }}
                        >
                          {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f39c12' }}>
                          ₹{item.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.quantity < 10 ? 'Low Stock' : 'In Stock'} 
                          size="small" 
                          color={item.quantity < 10 ? 'error' : 'success'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: '#667eea',
                              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditStock(item)}
                            sx={{ 
                              color: '#f39c12',
                              '&:hover': { backgroundColor: 'rgba(243, 156, 18, 0.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteStock(item)}
                            sx={{ 
                              color: '#e74c3c',
                              '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {stockData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        No stocks found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Stock Dialog */}
      <Dialog open={openStockDialog} onClose={() => setOpenStockDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Add New Stock
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={newStock.name}
                onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                value={newStock.description}
                onChange={(e) => setNewStock({ ...newStock, description: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newStock.quantity}
                onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={newStock.price}
                onChange={(e) => setNewStock({ ...newStock, price: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newStock.category}
                  onChange={(e) => setNewStock({ ...newStock, category: e.target.value, subcategory: '' })}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={newStock.subcategory}
                  onChange={(e) => setNewStock({ ...newStock, subcategory: e.target.value })}
                  label="Subcategory"
                  required
                  disabled={!newStock.category}
                >
                  {subcategories
                    .filter(sub => sub.category === newStock.category)
                    .map((subcategory) => (
                      <MenuItem key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenStockDialog(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={createStock}
            disabled={isLoading || !newStock.name.trim() || !newStock.quantity || !newStock.price || !newStock.category || !newStock.subcategory}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
              }
            }}
          >
            {isLoading ? 'Creating...' : 'Create Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Edit Stock
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={editStock.name}
                onChange={(e) => setEditStock({ ...editStock, name: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                value={editStock.description}
                onChange={(e) => setEditStock({ ...editStock, description: e.target.value })}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={editStock.quantity}
                onChange={(e) => setEditStock({ ...editStock, quantity: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={editStock.price}
                onChange={(e) => setEditStock({ ...editStock, price: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editStock.category}
                  onChange={(e) => setEditStock({ ...editStock, category: e.target.value, subcategory: '' })}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={editStock.subcategory}
                  onChange={(e) => setEditStock({ ...editStock, subcategory: e.target.value })}
                  label="Subcategory"
                  required
                  disabled={!editStock.category}
                >
                  {subcategories
                    .filter(sub => sub.category === editStock.category)
                    .map((subcategory) => (
                      <MenuItem key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenEditDialog(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateStock}
            disabled={isLoading || !editStock.name.trim() || !editStock.quantity || !editStock.price || !editStock.category || !editStock.subcategory}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #f39c12, #e67e22)',
              '&:hover': {
                background: 'linear-gradient(45deg, #e67e22, #d35400)'
              }
            }}
          >
            {isLoading ? 'Updating...' : 'Update Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to delete "{selectedStock?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={deleteStock}
            disabled={isLoading}
            variant="contained"
            color="error"
            sx={{
              background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c0392b, #a93226)'
              }
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StockManagement; 