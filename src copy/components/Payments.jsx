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
  Alert,
  Input,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  CloudUpload as UploadIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../config';

const Payments = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [openAddPayment, setOpenAddPayment] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    transactionId: '',
    customerName: '',
    productId: '',
    amountPaid: '',
    paymentType: 'online'
  });

  // Edit payment form state
  const [editPayment, setEditPayment] = useState({
    customerName: '',
    productId: '',
    amountPaid: '',
    paymentType: 'online'
  });

  // Fetch transactions and products on component mount
  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setIsFetchingTransactions(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.TRANSACTIONS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      } else {
        console.error('Failed to fetch transactions');
        showNotification('Failed to load transactions', 'error');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showNotification('Network error while loading transactions', 'error');
    } finally {
      setIsFetchingTransactions(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setIsFetchingProducts(true);
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
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
        showNotification('Failed to load products', 'error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Network error while loading products', 'error');
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove screenshot
  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  // Get selected product details
  const getSelectedProduct = (productId) => {
    return products.find(product => product._id === productId);
  };

  // Create new transaction
  const createTransaction = async () => {
    if (!newPayment.transactionId.trim() || !newPayment.customerName.trim() || 
        !newPayment.productId || !newPayment.amountPaid.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (isNaN(parseFloat(newPayment.amountPaid))) {
      showNotification('Amount must be a valid number', 'error');
      return;
    }

    const selectedProduct = getSelectedProduct(newPayment.productId);
    if (!selectedProduct) {
      showNotification('Please select a valid product', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append('transactionId', newPayment.transactionId);
      formData.append('customerName', newPayment.customerName);
      formData.append('productName', selectedProduct.name);
      formData.append('amountPaid', parseFloat(newPayment.amountPaid));
      formData.append('paymentType', newPayment.paymentType);
      
      if (screenshotFile) {
        formData.append('image', screenshotFile);
      }

      const response = await fetch(API_ENDPOINTS.TRANSACTIONS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh transactions after creation
        await fetchTransactions();
        setNewPayment({
          transactionId: '',
          customerName: '',
          productId: '',
          amountPaid: '',
          paymentType: 'online'
        });
        removeScreenshot();
        setOpenAddPayment(false);
        showNotification('Transaction created successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to create transaction', 'error');
      }
    } catch (error) {
      console.error('Transaction creation error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    
    // Find the product by name for editing
    const product = products.find(p => p.name === transaction.productName);
    
    setEditPayment({
      customerName: transaction.customerName,
      productId: product?._id || '',
      amountPaid: transaction.amountPaid.toString(),
      paymentType: transaction.paymentType
    });
    setOpenEditDialog(true);
  };

  // Update transaction
  const updateTransaction = async () => {
    if (!editPayment.customerName.trim() || !editPayment.productId || !editPayment.amountPaid.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (isNaN(parseFloat(editPayment.amountPaid))) {
      showNotification('Amount must be a valid number', 'error');
      return;
    }

    const selectedProduct = getSelectedProduct(editPayment.productId);
    if (!selectedProduct) {
      showNotification('Please select a valid product', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}/${selectedTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName: editPayment.customerName,
          productName: selectedProduct.name,
          amountPaid: parseFloat(editPayment.amountPaid),
          paymentType: editPayment.paymentType
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh transactions after update
        await fetchTransactions();
        setOpenEditDialog(false);
        setSelectedTransaction(null);
        showNotification('Transaction updated successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to update transaction', 'error');
      }
    } catch (error) {
      console.error('Transaction update error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  // Delete transaction
  const deleteTransaction = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}/${selectedTransaction._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh transactions after deletion
        await fetchTransactions();
        setOpenDeleteDialog(false);
        setSelectedTransaction(null);
        showNotification('Transaction deleted successfully!', 'success');
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to delete transaction', 'error');
      }
    } catch (error) {
      console.error('Transaction deletion error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusChip = (status) => {
    if (status === 'valid') {
      return (
        <Chip 
          icon={<CheckIcon />}
          label="Valid" 
          size="small" 
          color="success"
          sx={{ fontSize: '0.7rem' }}
        />
      );
    } else {
      return (
        <Chip 
          icon={<PendingIcon />}
          label="Pending" 
          size="small" 
          color="warning"
          sx={{ fontSize: '0.7rem' }}
        />
      );
    }
  };

  const getTypeChip = (type) => {
    if (type === 'online') {
      return (
        <Chip 
          label="Online" 
          size="small" 
          sx={{ 
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            fontSize: '0.7rem'
          }}
        />
      );
    } else {
      return (
        <Chip 
          label="Manual" 
          size="small" 
          sx={{ 
            backgroundColor: 'rgba(158, 158, 158, 0.1)',
            color: '#9e9e9e',
            fontSize: '0.7rem'
          }}
        />
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Payment Options Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PaymentIcon sx={{ mr: 2, color: '#667eea', fontSize: 28 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
            Payment Options
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddPayment(true)}
              fullWidth
              sx={{
                height: 60,
                borderColor: '#4caf50',
                color: '#4caf50',
                borderWidth: 2,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#45a049',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderWidth: 2
                }
              }}
            >
              Add Payment
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setOpenHistory(true)}
              fullWidth
              sx={{
                height: 60,
                borderColor: '#2196f3',
                color: '#2196f3',
                borderWidth: 2,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  borderWidth: 2
                }
              }}
            >
              View Payment History
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Add Payment Dialog */}
      <Dialog open={openAddPayment} onClose={() => setOpenAddPayment(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
          <AddIcon sx={{ mr: 1, color: '#4caf50' }} />
          + Add Payment (Validate UPI Transaction)
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID (UTR)"
                value={newPayment.transactionId}
                onChange={(e) => setNewPayment({ ...newPayment, transactionId: e.target.value })}
                variant="outlined"
                required
                placeholder="Enter UTR number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={newPayment.customerName}
                onChange={(e) => setNewPayment({ ...newPayment, customerName: e.target.value })}
                variant="outlined"
                required
                placeholder="Enter customer name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Product</InputLabel>
                <Select
                  value={newPayment.productId}
                  onChange={(e) => {
                    const selectedProduct = getSelectedProduct(e.target.value);
                    setNewPayment({ 
                      ...newPayment, 
                      productId: e.target.value,
                      amountPaid: selectedProduct ? selectedProduct.price.toString() : ''
                    });
                  }}
                  label="Select Product"
                  required
                  disabled={isFetchingProducts}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2">{product.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                          ₹{product.price.toLocaleString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Amount Paid"
                value={newPayment.amountPaid}
                onChange={(e) => setNewPayment({ ...newPayment, amountPaid: e.target.value })}
                variant="outlined"
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={newPayment.paymentType}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentType: e.target.value })}
                  label="Payment Type"
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Screenshot Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Payment Screenshot
              </Typography>
              
              {!screenshotPreview ? (
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)'
                    }
                  }}
                  onClick={() => document.getElementById('screenshot-upload').click()}
                >
                  <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                    Click to upload payment screenshot
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    PNG, JPG, JPEG up to 5MB
                  </Typography>
                  <input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </Box>
              ) : (
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={screenshotPreview}
                    alt="Payment Screenshot"
                    style={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                      borderRadius: 8,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    onClick={removeScreenshot}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenAddPayment(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={createTransaction}
            disabled={isLoading || !newPayment.transactionId.trim() || !newPayment.customerName.trim() || 
                     !newPayment.productId || !newPayment.amountPaid.trim()}
            variant="contained"
            startIcon={<CheckIcon />}
            sx={{
              background: 'linear-gradient(45deg, #4caf50, #45a049)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #3d8b40)'
              }
            }}
          >
            {isLoading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center' }}>
          <EditIcon sx={{ mr: 1, color: '#f39c12' }} />
          Edit Transaction
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={editPayment.customerName}
                onChange={(e) => setEditPayment({ ...editPayment, customerName: e.target.value })}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Product</InputLabel>
                <Select
                  value={editPayment.productId}
                  onChange={(e) => {
                    const selectedProduct = getSelectedProduct(e.target.value);
                    setEditPayment({ 
                      ...editPayment, 
                      productId: e.target.value,
                      amountPaid: selectedProduct ? selectedProduct.price.toString() : editPayment.amountPaid
                    });
                  }}
                  label="Select Product"
                  required
                  disabled={isFetchingProducts}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2">{product.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                          ₹{product.price.toLocaleString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount Paid"
                value={editPayment.amountPaid}
                onChange={(e) => setEditPayment({ ...editPayment, amountPaid: e.target.value })}
                variant="outlined"
                required
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={editPayment.paymentType}
                  onChange={(e) => setEditPayment({ ...editPayment, paymentType: e.target.value })}
                  label="Payment Type"
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
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
            onClick={updateTransaction}
            disabled={isLoading || !editPayment.customerName.trim() || 
                     !editPayment.productId || !editPayment.amountPaid.trim()}
            variant="contained"
            startIcon={<CheckIcon />}
            sx={{
              background: 'linear-gradient(45deg, #f39c12, #e67e22)',
              '&:hover': {
                background: 'linear-gradient(45deg, #e67e22, #d35400)'
              }
            }}
          >
            {isLoading ? 'Updating...' : 'Update Transaction'}
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
            Are you sure you want to delete transaction "{selectedTransaction?.transactionId}"? This action cannot be undone.
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
            onClick={deleteTransaction}
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
            {isLoading ? 'Deleting...' : 'Delete Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1, color: '#2196f3' }} />
            Transaction History
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchTransactions}
              disabled={isFetchingTransactions}
              size="small"
              sx={{
                borderColor: '#2196f3',
                color: '#2196f3',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)'
                }
              }}
            >
              Refresh
            </Button>
            <IconButton onClick={() => setOpenHistory(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {isFetchingTransactions ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading transactions...
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>TXN ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#667eea', fontWeight: 600 }}>
                          {item.transactionId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {item.customerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.productName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f39c12' }}>
                          ₹{item.amountPaid.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getTypeChip(item.paymentType)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditTransaction(item)}
                            sx={{ 
                              color: '#f39c12',
                              '&:hover': { backgroundColor: 'rgba(243, 156, 18, 0.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteTransaction(item)}
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
                  {paymentHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
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

export default Payments; 