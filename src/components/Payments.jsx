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
  InputAdornment,
  useTheme,
  useMediaQuery
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
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateNext as NextPageIcon,
  NavigateBefore as PrevPageIcon
} from '@mui/icons-material';
import { API_ENDPOINTS, API_BASE_URL } from '../config';

const Payments = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [openAddPayment, setOpenAddPayment] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingStatusId, setEditingStatusId] = useState(null);

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    transactionId: '',
    customerName: '',
    productId: '',
    amountPaid: '',
    paymentType: 'online',
    address: '',
    phoneNumber: '',
    note: ''
  });

  // Edit payment form state
  const [editPayment, setEditPayment] = useState({
    customerName: '',
    productId: '',
    amountPaid: '',
    paymentType: 'online',
    address: '',
    phoneNumber: '',
    note: ''
  });

  // Fetch transactions and products on component mount
  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  // Refetch transactions when filters or pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, pageSize, statusFilter, paymentTypeFilter]);

  // Fetch transactions from API with pagination
  const fetchTransactions = async (page = currentPage, limit = pageSize) => {
    setIsFetchingTransactions(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (paymentTypeFilter !== 'all') {
        params.append('paymentType', paymentTypeFilter);
      }

      const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Handle paginated response
        if (data.data && Array.isArray(data.data)) {
          setPaymentHistory(data.data);
          setTotalTransactions(data.pagination?.total || data.total || data.data.length);
          setTotalPages(data.pagination?.totalPages || data.totalPages || Math.ceil((data.pagination?.total || data.total || data.data.length) / limit));
          setCurrentPage(data.pagination?.currentPage || currentPage);
        } else if (Array.isArray(data)) {
          // Fallback for non-paginated response
          setPaymentHistory(data);
          setTotalTransactions(data.length);
          setTotalPages(1);
        }
      } else {
        showNotification(data.message || 'Failed to fetch transactions', 'error');
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
        !newPayment.productId || !newPayment.amountPaid.trim() ||
        !newPayment.address.trim() || !newPayment.phoneNumber.trim()) {
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

      console.log("token", token);
      
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append('transactionId', newPayment.transactionId);
      formData.append('customerName', newPayment.customerName);
      formData.append('productName', selectedProduct.name);
      formData.append('amountPaid', parseFloat(newPayment.amountPaid));
      formData.append('paymentType', newPayment.paymentType);
      formData.append('address', newPayment.address);
      formData.append('phoneNumber', newPayment.phoneNumber);
      formData.append('note', newPayment.note || '');
      
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
        await fetchTransactions(1, pageSize); // Go to first page after creating new transaction
        setNewPayment({
          transactionId: '',
          customerName: '',
          productId: '',
          amountPaid: '',
          paymentType: 'online',
          address: '',
          phoneNumber: '',
          note: ''
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

  // Handle view transaction
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenViewDialog(true);
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
      paymentType: transaction.paymentType,
      address: transaction.address || '',
      phoneNumber: transaction.phoneNumber || '',
      note: transaction.note || ''
    });
    setOpenEditDialog(true);
  };

  // Update transaction
  const updateTransaction = async () => {
    if (!editPayment.customerName.trim() || !editPayment.productId || !editPayment.amountPaid.trim() ||
        !editPayment.address.trim() || !editPayment.phoneNumber.trim()) {
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
          paymentType: editPayment.paymentType,
          address: editPayment.address,
          phoneNumber: editPayment.phoneNumber,
          note: editPayment.note || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh transactions after update
        await fetchTransactions(currentPage, pageSize);
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
    // Only allow admins to delete
    if (!isAdmin()) {
      showNotification('Only admin users can delete transactions', 'error');
      return;
    }
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
        await fetchTransactions(currentPage, pageSize);
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

  const getStatusChip = (status, transactionId, isClickable = false) => {
    const chipProps = {
      icon: status === 'completed' ? <CheckIcon sx={{ fontSize: 14 }} /> : 
            status === 'cancelled' ? <CloseIcon sx={{ fontSize: 14 }} /> : 
            <PendingIcon sx={{ fontSize: 14 }} />,
      label: status === 'completed' ? 'Completed' : 
             status === 'cancelled' ? 'Cancelled' : 'Pending',
      size: 'small',
      color: status === 'completed' ? 'success' : 
             status === 'cancelled' ? 'error' : 'warning',
      sx: { 
        fontSize: '0.65rem',
        height: 20,
        cursor: isClickable ? 'pointer' : 'default',
        '& .MuiChip-label': {
          padding: '0 6px'
        },
        ...(isClickable && {
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          },
          transition: 'all 0.2s ease'
        })
      }
    };

    if (isClickable) {
      chipProps.onClick = () => handleStatusChipClick(transactionId);
    }

    return <Chip {...chipProps} />;
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
            fontSize: '0.65rem',
            height: 20,
            '& .MuiChip-label': {
              padding: '0 6px'
            }
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
            fontSize: '0.65rem',
            height: 20,
            '& .MuiChip-label': {
              padding: '0 6px'
            }
          }}
        />
      );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get image URL - handle both full URLs and filenames
  const getImageUrl = (image) => {
    if (!image) return null;
    // Check if it's already a full URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // Otherwise, it's a filename, construct the URL
    return `${API_BASE_URL}/uploads/${image}`;
  };

  // Handle image click to open modal
  const handleImageClick = (image) => {
    if (image) {
      setSelectedImageUrl(getImageUrl(image));
      setOpenImageModal(true);
    }
  };

  // Get transaction status based on validation
  const getTransactionStatus = (transaction) => {
    // Return the actual status from the transaction or default to 'pending'
    return transaction.status || 'pending';
  };

  // Check if user is admin
  const isAdmin = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role === 'admin';
    }
    return false;
  };

  // Get filtered transactions (now handled by API pagination)
  const getFilteredTransactions = () => {
    return paymentHistory;
  };

  // Handle status chip click
  const handleStatusChipClick = (transactionId) => {
    if (!isAdmin()) {
      showNotification('Only admin users can update transaction status', 'error');
      return;
    }
    setEditingStatusId(transactionId);
  };

  // Update transaction status
  const updateTransactionStatus = async (transactionId, newStatus) => {
    // Check if user is admin
    if (!isAdmin()) {
      showNotification('Only admin users can update transaction status', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      console.log("token", token);
      const response = await fetch(`${API_ENDPOINTS.TRANSACTION_STATUS_UPDATE}/${transactionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh transactions after status update
        await fetchTransactions(currentPage, pageSize);
        setEditingStatusId(null); // Close the dropdown
        showNotification(`Transaction status updated to ${newStatus}!`, 'success');
      } else {
        showNotification(data.message || 'Failed to update transaction status', 'error');
      }
    } catch (error) {
      console.error('Transaction status update error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 3, px: isMobile ? 1 : 3 }}>
      {/* Payment Options Header */}
      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 0 }}>
            <PaymentIcon sx={{ mr: 2, color: '#667eea', fontSize: isMobile ? 24 : 28 }} />
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, color: '#2c3e50' }}>
              Payment Options
            </Typography>
            {isAdmin() && (
              <Chip 
                label="Admin - Can Approve Payments"
                size="small"
                sx={{ 
                  ml: 2, 
                  backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                  color: '#4caf50',
                  fontWeight: 600,
                  fontSize: isMobile ? '0.6rem' : '0.75rem'
                }}
              />
            )}
          </Box>
        </Box>
        
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddPayment(true)}
              fullWidth
              sx={{
                height: isMobile ? 50 : 60,
                borderColor: '#4caf50',
                color: '#4caf50',
                borderWidth: 2,
                fontSize: isMobile ? '0.9rem' : '1rem',
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
          
          {/* Status Summary */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
              mt: 1
            }}>
              <Chip 
                label={`Pending: ${paymentHistory.filter(t => getTransactionStatus(t) === 'pending').length}`}
                size="small"
                onClick={() => setStatusFilter('pending')}
                sx={{ 
                  backgroundColor: statusFilter === 'pending' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.1)', 
                  color: '#ff9800',
                  fontWeight: 600,
                  border: statusFilter === 'pending' ? '2px solid #ff9800' : 'none',
                  cursor: 'pointer'
                }}
              />
              <Chip 
                label={`Completed: ${paymentHistory.filter(t => getTransactionStatus(t) === 'completed').length}`}
                size="small"
                onClick={() => setStatusFilter('completed')}
                sx={{ 
                  backgroundColor: statusFilter === 'completed' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.1)', 
                  color: '#4caf50',
                  fontWeight: 600,
                  border: statusFilter === 'completed' ? '2px solid #4caf50' : 'none',
                  cursor: 'pointer'
                }}
              />
              <Chip 
                label={`Cancelled: ${paymentHistory.filter(t => getTransactionStatus(t) === 'cancelled').length}`}
                size="small"
                onClick={() => setStatusFilter('cancelled')}
                sx={{ 
                  backgroundColor: statusFilter === 'cancelled' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.1)', 
                  color: '#f44336',
                  fontWeight: 600,
                  border: statusFilter === 'cancelled' ? '2px solid #f44336' : 'none',
                  cursor: 'pointer'
                }}
              />
              <Chip 
                label={`All: ${paymentHistory.length}`}
                size="small"
                onClick={() => setStatusFilter('all')}
                sx={{ 
                  backgroundColor: statusFilter === 'all' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.1)', 
                  color: '#667eea',
                  fontWeight: 600,
                  border: statusFilter === 'all' ? '2px solid #667eea' : 'none',
                  cursor: 'pointer'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Add Payment Dialog */}
      <Dialog 
        open={openAddPayment} 
        onClose={() => setOpenAddPayment(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: '#2c3e50', 
          display: 'flex', 
          alignItems: 'center',
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          <AddIcon sx={{ mr: 1, color: '#4caf50' }} />
          + Add Payment (Validate UPI Transaction)
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Transaction ID (UTR)"
                value={newPayment.transactionId}
                onChange={(e) => setNewPayment({ ...newPayment, transactionId: e.target.value })}
                variant="outlined"
                required
                placeholder="Enter UTR number"
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newPayment.phoneNumber}
                onChange={(e) => setNewPayment({ ...newPayment, phoneNumber: e.target.value })}
                variant="outlined"
                required
                placeholder="Enter phone number"
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={newPayment.address}
                onChange={(e) => setNewPayment({ ...newPayment, address: e.target.value })}
                variant="outlined"
                required
                placeholder="Enter address"
                multiline
                rows={2}
                size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={newPayment.paymentType}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentType: e.target.value })}
                  label="Payment Type"
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note"
                value={newPayment.note}
                onChange={(e) => setNewPayment({ ...newPayment, note: e.target.value })}
                variant="outlined"
                placeholder="Enter any additional notes (optional)"
                multiline
                rows={3}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            {/* Screenshot Upload Section */}
            <Grid item xs={12}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Payment Screenshot
              </Typography>
              
              {!screenshotPreview ? (
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: isMobile ? 2 : 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)'
                    }
                  }}
                  onClick={() => document.getElementById('screenshot-upload').click()}
                >
                  <UploadIcon sx={{ fontSize: isMobile ? 36 : 48, color: '#ccc', mb: 2 }} />
                  <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: '#666', mb: 1 }}>
                    Click to upload payment screenshot
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
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
                      maxHeight: isMobile ? 200 : 300,
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
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setOpenAddPayment(false)}
            sx={{ color: '#666' }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={createTransaction}
            disabled={isLoading || !newPayment.transactionId.trim() || !newPayment.customerName.trim() || 
                     !newPayment.productId || !newPayment.amountPaid.trim() ||
                     !newPayment.address.trim() || !newPayment.phoneNumber.trim()}
            variant="contained"
            startIcon={<CheckIcon />}
            size={isMobile ? "small" : "medium"}
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
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: '#2c3e50', 
          display: 'flex', 
          alignItems: 'center',
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          <EditIcon sx={{ mr: 1, color: '#f39c12' }} />
          Edit Transaction
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={editPayment.customerName}
                onChange={(e) => setEditPayment({ ...editPayment, customerName: e.target.value })}
                variant="outlined"
                required
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editPayment.phoneNumber}
                onChange={(e) => setEditPayment({ ...editPayment, phoneNumber: e.target.value })}
                variant="outlined"
                required
                placeholder="Enter phone number"
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editPayment.address}
                onChange={(e) => setEditPayment({ ...editPayment, address: e.target.value })}
                variant="outlined"
                required
                placeholder="Enter address"
                multiline
                rows={2}
                size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                >
                  {products.map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={editPayment.paymentType}
                  onChange={(e) => setEditPayment({ ...editPayment, paymentType: e.target.value })}
                  label="Payment Type"
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note"
                value={editPayment.note}
                onChange={(e) => setEditPayment({ ...editPayment, note: e.target.value })}
                variant="outlined"
                placeholder="Enter any additional notes (optional)"
                multiline
                rows={3}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setOpenEditDialog(false)}
            sx={{ color: '#666' }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateTransaction}
            disabled={isLoading || !editPayment.customerName.trim() || 
                     !editPayment.productId || !editPayment.amountPaid.trim() ||
                     !editPayment.address.trim() || !editPayment.phoneNumber.trim()}
            variant="contained"
            startIcon={<CheckIcon />}
            size={isMobile ? "small" : "medium"}
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
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: '#2c3e50',
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant={isMobile ? "body2" : "body1"} sx={{ mt: 2 }}>
            Are you sure you want to delete transaction "{selectedTransaction?.transactionId}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: '#666' }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={deleteTransaction}
            disabled={isLoading}
            variant="contained"
            color="error"
            size={isMobile ? "small" : "medium"}
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

      {/* Transaction History Section */}
      <Box sx={{ mb: isMobile ? 3 : 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: isMobile ? 2 : 3,
          pb: 2,
          borderBottom: '2px solid #e0e0e0',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 0 }}>
              <HistoryIcon sx={{ mr: 2, color: '#2196f3', fontSize: isMobile ? 24 : 28 }} />
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, color: '#2c3e50' }}>
                Transaction History
              </Typography>
            </Box>
            <Chip 
              label={`${totalTransactions} transactions`}
              size="small"
              sx={{ 
                ml: isMobile ? 0 : 2, 
                mt: isMobile ? 1 : 0,
                backgroundColor: 'rgba(33, 150, 243, 0.1)', 
                color: '#2196f3' 
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Filter Dropdown */}
            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 120 : 150 }}>
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter Status"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                  }
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            {/* Payment Type Filter Dropdown */}
            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 120 : 150 }}>
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                label="Payment Type"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                  }
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>

            {/* Page Size Dropdown */}
            <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 80 : 100 }}>
              <InputLabel>Per Page</InputLabel>
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
                label="Per Page"
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                  }
                }}
              >
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchTransactions()}
              disabled={isFetchingTransactions}
              size={isMobile ? "small" : "medium"}
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
          </Box>
        </Box>

        {/* Transaction Table */}
        {isFetchingTransactions ? (
          <Box sx={{ p: isMobile ? 2 : 4, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading transactions...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            {isMobile ? (
              // Mobile Card View
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {getFilteredTransactions().map((item, index) => (
                  <Card 
                    key={item._id}
                    sx={{ 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                      borderRadius: 2,
                      '&:hover': { 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              mr: 1.5, 
                              backgroundColor: '#667eea',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}
                          >
                            {item.transactionId.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              color: '#667eea', 
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          >
                            {item.transactionId}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditTransaction(item)}
                            sx={{ 
                              color: '#f39c12',
                              backgroundColor: 'rgba(243, 156, 18, 0.1)',
                              width: 28,
                              height: 28,
                              '&:hover': { 
                                backgroundColor: 'rgba(243, 156, 18, 0.2)'
                              }
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          {isAdmin() && (
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteTransaction(item)}
                              sx={{ 
                                color: '#e74c3c',
                                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                width: 28,
                                height: 28,
                                '&:hover': { 
                                  backgroundColor: 'rgba(231, 76, 60, 0.2)'
                                }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      
                      {/* Content */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Customer:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {item.customerName}
                          </Typography>
                        </Box>
                        
                        {item.phoneNumber && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              Phone:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              {item.phoneNumber}
                            </Typography>
                          </Box>
                        )}
                        
                        {item.address && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              Address:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50', textAlign: 'right', maxWidth: '60%' }}>
                              {item.address}
                            </Typography>
                          </Box>
                        )}
                        
                        {item.note && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              Note:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50', textAlign: 'right', maxWidth: '60%' }}>
                              {item.note}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Product:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {item.productName}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Amount:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#f39c12' }}>
                            ₹{item.amountPaid.toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Type:
                          </Typography>
                          {getTypeChip(item.paymentType)}
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Status:
                          </Typography>
                          {editingStatusId === item._id ? (
                            <FormControl size="small" sx={{ minWidth: 80 }}>
                              <Select
                                value={getTransactionStatus(item)}
                                onChange={(e) => updateTransactionStatus(item._id, e.target.value)}
                                onBlur={() => setEditingStatusId(null)}
                                autoFocus
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 24,
                                  '& .MuiSelect-select': {
                                    padding: '2px 6px',
                                    fontSize: '0.65rem'
                                  }
                                }}
                              >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            getStatusChip(getTransactionStatus(item), item._id, isAdmin())
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Date:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            {formatDate(item.createdAt || item.updatedAt)}
                          </Typography>
                        </Box>
                        
                        {/* Image Display */}
                        {item.image && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                              Screenshot:
                            </Typography>
                            <Box sx={{ 
                              width: 50, 
                              height: 35, 
                              borderRadius: 1, 
                              overflow: 'hidden',
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => handleImageClick(item.image)}
                            >
                              <img
                                src={getImageUrl(item.image)}
                                alt="Payment Screenshot"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <Box sx={{ 
                                display: 'none',
                                width: '100%', 
                                height: '100%', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                fontSize: '0.6rem',
                                color: '#666'
                              }}>
                                No Image
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                
                {getFilteredTransactions().length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      No transactions found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Start by adding your first payment transaction
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenAddPayment(true)}
                      size="small"
                    >
                      Add First Transaction
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              // Desktop Table View
              <TableContainer 
                component={Paper} 
                sx={{ 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                  borderRadius: 2,
                  maxWidth: '100%',
                  overflowX: 'auto'
                }}
              >
                <Table sx={{ minWidth: 700 }} aria-label="transaction table">
                                      <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 120, maxWidth: 120, padding: '8px 4px' }}>
                          Transaction ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          Customer
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          Product
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 80, maxWidth: 80, padding: '8px 4px' }}>
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 90, maxWidth: 90, padding: '8px 4px' }}>
                          Payment Type
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 120, maxWidth: 120, padding: '8px 4px' }}>
                          Note
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 120, maxWidth: 120, padding: '8px 4px' }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 70, maxWidth: 70, padding: '8px 4px' }}>
                          Screenshot
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2c3e50', fontSize: '0.75rem', width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  <TableBody>
                    {getFilteredTransactions().map((item, index) => (
                      <TableRow 
                        key={item._id}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          transition: 'background-color 0.2s ease',
                          height: 48 // Reduced row height
                        }}
                      >
                        <TableCell sx={{ width: 120, maxWidth: 120, padding: '8px 4px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 0.5, 
                                backgroundColor: '#667eea',
                                fontSize: '0.65rem',
                                fontWeight: 600
                              }}
                            >
                              {item.transactionId.substring(0, 2).toUpperCase()}
                            </Avatar>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                color: '#667eea', 
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.transactionId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            color: '#2c3e50',
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.customerName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500, 
                            color: '#2c3e50',
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.productName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: 80, maxWidth: 80, padding: '8px 4px' }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 700, 
                            color: '#f39c12',
                            fontSize: '0.7rem'
                          }}>
                            ₹{item.amountPaid.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: 90, maxWidth: 90, padding: '8px 4px' }}>
                          {getTypeChip(item.paymentType)}
                        </TableCell>
                        <TableCell sx={{ width: 120, maxWidth: 120, padding: '8px 4px' }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 500, 
                            color: '#2c3e50',
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} title={item.note || 'No note'}>
                            {item.note || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: 120, maxWidth: 120, padding: '8px 4px' }}>
                          {editingStatusId === item._id ? (
                            <FormControl size="small" sx={{ minWidth: 70 }}>
                              <Select
                                value={getTransactionStatus(item)}
                                onChange={(e) => updateTransactionStatus(item._id, e.target.value)}
                                onBlur={() => setEditingStatusId(null)}
                                autoFocus
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 24,
                                  '& .MuiSelect-select': {
                                    padding: '2px 4px',
                                    fontSize: '0.65rem'
                                  }
                                }}
                              >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            getStatusChip(getTransactionStatus(item), item._id, isAdmin())
                          )}
                        </TableCell>
                        <TableCell sx={{ width: 70, maxWidth: 70, padding: '8px 4px' }}>
                          {item.image ? (
                            <Box sx={{ 
                              width: 35, 
                              height: 25, 
                              borderRadius: 1, 
                              overflow: 'hidden',
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => handleImageClick(item.image)}
                            title="Click to view full image"
                            >
                              <img
                                src={getImageUrl(item.image)}
                                alt="Payment Screenshot"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <Box sx={{ 
                                display: 'none',
                                width: '100%', 
                                height: '100%', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                fontSize: '0.45rem',
                                color: '#666'
                              }}>
                                No Image
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                              No Image
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            {formatDate(item.createdAt || item.updatedAt)}
                          </Typography>
                        </TableCell>
                                                                        <TableCell sx={{ width: 100, maxWidth: 100, padding: '8px 4px' }}>
                          <Box sx={{ display: 'flex', gap: 0.3 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewTransaction(item)}
                              sx={{ 
                                color: '#2196f3',
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                width: 24,
                                height: 24,
                                '&:hover': { 
                                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                              title="View Transaction"
                            >
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditTransaction(item)}
                              sx={{ 
                                color: '#f39c12',
                                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                                width: 24,
                                height: 24,
                                '&:hover': { 
                                  backgroundColor: 'rgba(243, 156, 18, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                              title="Edit Transaction"
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            {isAdmin() && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteTransaction(item)}
                                sx={{ 
                                  color: '#e74c3c',
                                  backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                  width: 24,
                                  height: 24,
                                  '&:hover': { 
                                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                                title="Delete Transaction"
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {getFilteredTransactions().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ReceiptIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                              No transactions found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Start by adding your first payment transaction
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => setOpenAddPayment(true)}
                              sx={{ mt: 2 }}
                            >
                              Add First Transaction
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* Summary Footer */}
            {getFilteredTransactions().length > 0 && (
              <Box sx={{ 
                p: isMobile ? 1.5 : 2, 
                backgroundColor: '#f8f9fa', 
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '0 0 8px 8px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 0
              }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                    Showing <strong>{getFilteredTransactions().length}</strong> of <strong>{totalTransactions}</strong> transactions
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>
                    Total Amount: <strong style={{ color: '#f39c12' }}>
                      ₹{getFilteredTransactions().reduce((sum, item) => sum + item.amountPaid, 0).toLocaleString()}
                    </strong>
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 1,
                mt: 2,
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 2
              }}>
                <IconButton
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  size="small"
                  sx={{ 
                    color: currentPage === 1 ? '#ccc' : '#2196f3',
                    '&:hover': {
                      backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(33, 150, 243, 0.1)'
                    }
                  }}
                >
                  <FirstPageIcon />
                </IconButton>
                
                <IconButton
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  size="small"
                  sx={{ 
                    color: currentPage === 1 ? '#ccc' : '#2196f3',
                    '&:hover': {
                      backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(33, 150, 243, 0.1)'
                    }
                  }}
                >
                  <PrevPageIcon />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <IconButton
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        size="small"
                        sx={{
                          minWidth: 32,
                          height: 32,
                          backgroundColor: currentPage === pageNum ? '#2196f3' : 'transparent',
                          color: currentPage === pageNum ? 'white' : '#666',
                          '&:hover': {
                            backgroundColor: currentPage === pageNum ? '#1976d2' : 'rgba(33, 150, 243, 0.1)'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {pageNum}
                        </Typography>
                      </IconButton>
                    );
                  })}
                </Box>

                <IconButton
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  size="small"
                  sx={{ 
                    color: currentPage === totalPages ? '#ccc' : '#2196f3',
                    '&:hover': {
                      backgroundColor: currentPage === totalPages ? 'transparent' : 'rgba(33, 150, 243, 0.1)'
                    }
                  }}
                >
                  <NextPageIcon />
                </IconButton>

                <IconButton
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  size="small"
                  sx={{ 
                    color: currentPage === totalPages ? '#ccc' : '#2196f3',
                    '&:hover': {
                      backgroundColor: currentPage === totalPages ? 'transparent' : 'rgba(33, 150, 243, 0.1)'
                    }
                  }}
                >
                  <LastPageIcon />
                </IconButton>

                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', ml: 1 }}>
                  Page {currentPage} of {totalPages}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* View Transaction Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          color: '#2c3e50', 
          display: 'flex', 
          alignItems: 'center',
          fontSize: isMobile ? '1.1rem' : '1.25rem'
        }}>
          <VisibilityIcon sx={{ mr: 1, color: '#2196f3' }} />
          Transaction Details
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 1 }}>
              {/* Transaction ID Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                  Transaction Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2, 
                          backgroundColor: '#667eea',
                          fontSize: '1rem',
                          fontWeight: 600
                        }}
                      >
                        {selectedTransaction.transactionId.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#667eea' }}>
                          {selectedTransaction.transactionId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Transaction ID
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#f39c12' }}>
                        ₹{selectedTransaction.amountPaid.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Amount Paid
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Customer & Product Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                  Customer & Product Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                        Customer Information
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50', mb: 0.5 }}>
                        {selectedTransaction.customerName}
                      </Typography>
                      {selectedTransaction.phoneNumber && (
                        <Typography variant="body2" sx={{ color: '#2c3e50', mb: 0.5 }}>
                          Phone: {selectedTransaction.phoneNumber}
                        </Typography>
                      )}
                      {selectedTransaction.address && (
                        <Typography variant="body2" sx={{ color: '#2c3e50', mb: 0.5 }}>
                          Address: {selectedTransaction.address}
                        </Typography>
                      )}
                      {selectedTransaction.note && (
                        <Typography variant="body2" sx={{ color: '#2c3e50', mb: 0.5 }}>
                          Note: {selectedTransaction.note}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Customer ID: {selectedTransaction._id}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                        Product Information
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50', mb: 0.5 }}>
                        {selectedTransaction.productName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Product ID: {selectedTransaction.productId || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Payment Details Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                  Payment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                        Payment Type
                      </Typography>
                      {getTypeChip(selectedTransaction.paymentType)}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                        Status
                      </Typography>
                      {getStatusChip(getTransactionStatus(selectedTransaction))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                        Date
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {formatDate(selectedTransaction.createdAt || selectedTransaction.updatedAt)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Screenshot Section */}
              {selectedTransaction.image && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                    Payment Screenshot
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    p: 2, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 2 
                  }}>
                    <Box sx={{ 
                      maxWidth: 400, 
                      maxHeight: 300, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleImageClick(selectedTransaction.image)}
                    title="Click to view full image"
                    >
                      <img
                        src={getImageUrl(selectedTransaction.image)}
                        alt="Payment Screenshot"
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <Box sx={{ 
                        display: 'none',
                        width: '100%', 
                        height: 200, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        fontSize: '0.875rem',
                        color: '#666'
                      }}>
                        No Image Available
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Admin Status Update Section */}
              {isAdmin() && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                    Status Management
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Update transaction status:
                    </Typography>
                    <FormControl size="medium" sx={{ minWidth: 200 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={getTransactionStatus(selectedTransaction)}
                        onChange={(e) => updateTransactionStatus(selectedTransaction._id, e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button 
            onClick={() => setOpenViewDialog(false)}
            sx={{ color: '#666' }}
            size={isMobile ? "small" : "medium"}
          >
            Close
          </Button>
          {isAdmin() && (
            <Button 
              onClick={() => {
                setOpenViewDialog(false);
                handleEditTransaction(selectedTransaction);
              }}
              variant="contained"
              startIcon={<EditIcon />}
              size={isMobile ? "small" : "medium"}
              sx={{
                background: 'linear-gradient(45deg, #f39c12, #e67e22)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #e67e22, #d35400)'
                }
              }}
            >
              Edit Transaction
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Image Modal Dialog */}
      <Dialog
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'white',
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment Screenshot
          </Typography>
          <IconButton
            onClick={() => setOpenImageModal(false)}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: isMobile ? 2 : 4,
          backgroundColor: 'rgba(0, 0, 0, 0.9)'
        }}>
          {selectedImageUrl && (
            <Box sx={{ 
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '80vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src={selectedImageUrl}
                alt="Payment Screenshot Full Size"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: 8
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <Box sx={{ 
                display: 'none',
                width: '100%', 
                minHeight: 200, 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 4
              }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Image not available
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => window.open(selectedImageUrl, '_blank')}
            variant="outlined"
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Open in New Tab
          </Button>
          <Button
            onClick={() => setOpenImageModal(false)}
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: 'black',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            Close
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

export default Payments; 