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
  NavigateBefore as PrevPageIcon,
  Search as SearchIcon
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
  const [isDragging, setIsDragging] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    transactionId: '',
    customerName: '',
    products: [], // Array of { productId, productName, quantity, price }
    paymentType: 'online',
    address: '',
    phoneNumber: '',
    note: ''
  });

  // Edit payment form state
  const [editPayment, setEditPayment] = useState({
    customerName: '',
    products: [], // Array of { productId, productName, quantity, price }
    paymentType: 'online',
    address: '',
    phoneNumber: '',
    note: ''
  });
  const [selectedEditProductId, setSelectedEditProductId] = useState('');

  // Fetch transactions and products on component mount
  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Refetch transactions when filters, pagination, or search changes
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, pageSize, statusFilter, paymentTypeFilter, debouncedSearchTerm]);

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

      if (debouncedSearchTerm.trim()) {
        params.append('searchTerm', debouncedSearchTerm.trim());
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
        const errorMessage = data.error || data.message || 'Failed to fetch transactions';
        showNotification(errorMessage, 'error');
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
        const data = await response.json();
        const errorMessage = data.error || data.message || 'Failed to load products';
        console.error('Failed to fetch products:', errorMessage);
        showNotification(errorMessage, 'error');
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
    const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileUpload(e);
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

  // Get products display - handle both products array and productName (legacy)
  const getProductsDisplay = (transaction) => {
    if (transaction.products && transaction.products.length > 0) {
      return transaction.products;
    }
    // Legacy format - single productName
    if (transaction.productName) {
      return [{
        productName: transaction.productName,
        quantity: 1,
        price: transaction.amountPaid || 0
      }];
    }
    return [];
  };

  // Get products summary text for display
  const getProductsSummary = (transaction) => {
    const productsList = getProductsDisplay(transaction);
    if (productsList.length === 0) return 'No products';
    if (productsList.length === 1) {
      return `${productsList[0].productName}${productsList[0].quantity > 1 ? ` (x${productsList[0].quantity})` : ''}`;
    }
    return `${productsList.length} products`;
  };

  // Calculate total amount from products
  const calculateTotalAmount = (productsList) => {
    return productsList.reduce((total, product) => {
      const quantity = parseInt(product.quantity) || 0; // Convert to number for calculation, use 0 if empty
      const price = product.price || 0; // Use 0 if price is undefined
      return total + (price * quantity);
    }, 0);
  };

  // Add product to the list
  const addProduct = (productId) => {
    const product = getSelectedProduct(productId);
    if (!product) return;

    // Check if product already exists
    const existingIndex = newPayment.products.findIndex(p => p.productId === productId);
    if (existingIndex >= 0) {
      // Increment quantity if product already exists
      const updatedProducts = [...newPayment.products];
      const currentQty = parseInt(updatedProducts[existingIndex].quantity) || 0;
      updatedProducts[existingIndex].quantity = (currentQty + 1).toString();
      setNewPayment({ ...newPayment, products: updatedProducts });
    } else {
      // Add new product with empty quantity (user will enter it)
      setNewPayment({
        ...newPayment,
        products: [...newPayment.products, {
          productId: product._id,
          productName: product.name,
          quantity: '', // Empty initially, user will enter
          price: product.price
        }]
      });
    }
  };

  // Remove product from the list
  const removeProduct = (index) => {
    const updatedProducts = newPayment.products.filter((_, i) => i !== index);
    setNewPayment({ ...newPayment, products: updatedProducts });
  };

  // Update product quantity
  const updateProductQuantity = (index, quantity) => {
    // Store as string in state (can be empty), will convert to number in payload
    const updatedProducts = [...newPayment.products];
    updatedProducts[index].quantity = quantity; // Keep as string, can be empty
    setNewPayment({ ...newPayment, products: updatedProducts });
  };

  // Create new transaction
  const createTransaction = async () => {
    if (!newPayment.transactionId.trim() || !newPayment.customerName.trim() || 
        newPayment.products.length === 0 ||
        !newPayment.address.trim() || !newPayment.phoneNumber.trim()) {
      showNotification('Please fill in all required fields and add at least one product', 'error');
      return;
    }

    // Check if all products have valid quantities
    const productsWithQuantity = newPayment.products.filter(p => p.quantity && parseInt(p.quantity) > 0);
    if (productsWithQuantity.length === 0) {
      showNotification('Please enter quantity for at least one product', 'error');
      return;
    }

    const totalAmount = calculateTotalAmount(newPayment.products);
    if (totalAmount <= 0) {
      showNotification('Total amount must be greater than 0. Please enter valid quantities.', 'error');
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
      
      // Add products array as JSON - convert quantity to number
      const productsPayload = newPayment.products
        .filter(p => p.quantity && parseInt(p.quantity) > 0) // Filter out products with no quantity
        .map(p => ({
          productName: p.productName,
          quantity: parseInt(p.quantity) // Convert string to number
        }));
      formData.append('products', JSON.stringify(productsPayload));
      
      formData.append('amountPaid', totalAmount);
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
          products: [],
          paymentType: 'online',
          address: '',
          phoneNumber: '',
          note: ''
        });
        removeScreenshot();
        setSelectedProductId('');
        setIsDragging(false);
        setOpenAddPayment(false);
        showNotification('Transaction created successfully!', 'success');
      } else {
        const errorMessage = data.error || data.message || 'Failed to create transaction';
        showNotification(errorMessage, 'error');
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
    
    // Handle both products array and legacy productName format
    const productsList = getProductsDisplay(transaction);
    
    // Convert products to edit format
    const editProducts = productsList.map(p => {
      const product = products.find(prod => prod.name === p.productName);
      return {
        productId: product?._id || '',
        productName: p.productName,
        quantity: p.quantity.toString(),
        price: p.price
      };
    });
    
    setEditPayment({
      customerName: transaction.customerName,
      products: editProducts,
      paymentType: transaction.paymentType,
      address: transaction.address || '',
      phoneNumber: transaction.phoneNumber || '',
      note: transaction.note || ''
    });
    setOpenEditDialog(true);
  };

  // Add product to edit form
  const addEditProduct = (productId) => {
    const product = getSelectedProduct(productId);
    if (!product) return;

    const existingIndex = editPayment.products.findIndex(p => p.productId === productId);
    if (existingIndex >= 0) {
      const updatedProducts = [...editPayment.products];
      const currentQty = parseInt(updatedProducts[existingIndex].quantity) || 0;
      updatedProducts[existingIndex].quantity = (currentQty + 1).toString();
      setEditPayment({ ...editPayment, products: updatedProducts });
    } else {
      setEditPayment({
        ...editPayment,
        products: [...editPayment.products, {
          productId: product._id,
          productName: product.name,
          quantity: '',
          price: product.price
        }]
      });
    }
  };

  // Remove product from edit form
  const removeEditProduct = (index) => {
    const updatedProducts = editPayment.products.filter((_, i) => i !== index);
    setEditPayment({ ...editPayment, products: updatedProducts });
  };

  // Update product quantity in edit form
  const updateEditProductQuantity = (index, quantity) => {
    const updatedProducts = [...editPayment.products];
    updatedProducts[index].quantity = quantity;
    setEditPayment({ ...editPayment, products: updatedProducts });
  };

  // Update transaction
  const updateTransaction = async () => {
    if (!editPayment.customerName.trim() || editPayment.products.length === 0 ||
        !editPayment.address.trim() || !editPayment.phoneNumber.trim()) {
      showNotification('Please fill in all required fields and add at least one product', 'error');
      return;
    }

    const productsWithQuantity = editPayment.products.filter(p => p.quantity && parseInt(p.quantity) > 0);
    if (productsWithQuantity.length === 0) {
      showNotification('Please enter quantity for at least one product', 'error');
      return;
    }

    const totalAmount = calculateTotalAmount(editPayment.products);
    if (totalAmount <= 0) {
      showNotification('Total amount must be greater than 0. Please enter valid quantities.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare products payload
      const productsPayload = editPayment.products
        .filter(p => p.quantity && parseInt(p.quantity) > 0)
        .map(p => ({
          productName: p.productName,
          quantity: parseInt(p.quantity)
        }));

      const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS}/${selectedTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName: editPayment.customerName,
          products: productsPayload,
          amountPaid: totalAmount,
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
        setSelectedEditProductId('');
        setSelectedTransaction(null);
        showNotification('Transaction updated successfully!', 'success');
      } else {
        const errorMessage = data.error || data.message || 'Failed to update transaction';
        showNotification(errorMessage, 'error');
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
        const errorMessage = data.error || data.message || 'Failed to delete transaction';
        showNotification(errorMessage, 'error');
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
        const errorMessage = data.error || data.message || 'Failed to update transaction status';
        showNotification(errorMessage, 'error');
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
        onClose={() => {
          setOpenAddPayment(false);
          setSelectedProductId('');
          setIsDragging(false);
        }} 
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
            {/* Product Selection */}
            <Grid item xs={12}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Products
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: isMobile ? '100%' : 250 }}>
                  <InputLabel>Select Product</InputLabel>
                  <Select
                    value={selectedProductId}
                    onChange={(e) => {
                      if (e.target.value) {
                        addProduct(e.target.value);
                        setSelectedProductId(''); // Reset selection
                      }
                    }}
                    label="Select Product"
                    disabled={isFetchingProducts}
                    size={isMobile ? "small" : "medium"}
                  >
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body2">{product.name}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                            ₹{(product.price || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Selected Products List */}
              {newPayment.products.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {newPayment.products.map((product, index) => (
                    <Card key={index} sx={{ mb: 1.5, p: 2, backgroundColor: '#f8f9fa' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: 150 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                            {product.productName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ₹{(product.price || 0).toLocaleString()} per unit
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            label="Quantity"
                            value={product.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only numbers or empty string
                              if (value === '' || /^\d+$/.test(value)) {
                                updateProductQuantity(index, value);
                              }
                            }}
                            placeholder="Enter quantity"
                            size="small"
                            inputProps={{ style: { width: 60, textAlign: 'center' } }}
                            sx={{ width: 100 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f39c12', minWidth: 80 }}>
                            = ₹{((product.price || 0) * (parseInt(product.quantity) || 0)).toLocaleString()}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => removeProduct(index)}
                            sx={{ color: '#e74c3c' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                        Total Amount:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f39c12' }}>
                        ₹{calculateTotalAmount(newPayment.products).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
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
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    border: `2px dashed ${isDragging ? '#667eea' : '#ccc'}`,
                    borderRadius: 2,
                    p: isMobile ? 2 : 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)'
                    }
                  }}
                  onClick={() => document.getElementById('screenshot-upload').click()}
                >
                  <UploadIcon sx={{ 
                    fontSize: isMobile ? 36 : 48, 
                    color: isDragging ? '#667eea' : '#ccc', 
                    mb: 2,
                    transition: 'color 0.3s ease'
                  }} />
                  <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: isDragging ? '#667eea' : '#666', mb: 1, fontWeight: isDragging ? 600 : 400 }}>
                    {isDragging ? 'Drop the image here' : 'Click to upload or drag and drop'}
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
            onClick={() => {
              setOpenAddPayment(false);
              setSelectedProductId('');
            }}
            sx={{ color: '#666' }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={createTransaction}
            disabled={isLoading || !newPayment.transactionId.trim() || !newPayment.customerName.trim() || 
                     newPayment.products.length === 0 ||
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
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedEditProductId('');
        }} 
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
            {/* Product Selection */}
            <Grid item xs={12}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Products
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: isMobile ? '100%' : 250 }}>
                  <InputLabel>Select Product</InputLabel>
                  <Select
                    value={selectedEditProductId}
                    onChange={(e) => {
                      if (e.target.value) {
                        addEditProduct(e.target.value);
                        setSelectedEditProductId('');
                      }
                    }}
                    label="Select Product"
                    disabled={isFetchingProducts}
                    size={isMobile ? "small" : "medium"}
                  >
                    {products.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body2">{product.name}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                            ₹{(product.price || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Selected Products List */}
              {editPayment.products.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {editPayment.products.map((product, index) => (
                    <Card key={index} sx={{ mb: 1.5, p: 2, backgroundColor: '#f8f9fa' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: 150 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                            {product.productName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            ₹{(product.price || 0).toLocaleString()} per unit
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            label="Quantity"
                            value={product.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d+$/.test(value)) {
                                updateEditProductQuantity(index, value);
                              }
                            }}
                            placeholder="Enter quantity"
                            size="small"
                            inputProps={{ style: { width: 60, textAlign: 'center' } }}
                            sx={{ width: 100 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f39c12', minWidth: 80 }}>
                            = ₹{((product.price || 0) * (parseInt(product.quantity) || 0)).toLocaleString()}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => removeEditProduct(index)}
                            sx={{ color: '#e74c3c' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                  <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                        Total Amount:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f39c12' }}>
                        ₹{calculateTotalAmount(editPayment.products).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
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
            onClick={() => {
              setOpenEditDialog(false);
              setSelectedEditProductId('');
            }}
            sx={{ color: '#666' }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateTransaction}
            disabled={isLoading || !editPayment.customerName.trim() || 
                     editPayment.products.length === 0 ||
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
            {/* Search Input */}
            <TextField
              size={isMobile ? "small" : "medium"}
              placeholder="Search by UTR or Phone Number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: isMobile ? 18 : 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: isMobile ? 200 : 250,
                '& .MuiOutlinedInput-root': {
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }
              }}
            />
            
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
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            Products:
                          </Typography>
                          {getProductsDisplay(item).map((product, idx) => (
                            <Box key={idx} sx={{ pl: 1, borderLeft: '2px solid #667eea' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {product.productName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Qty: {product.quantity || 1} × ₹{(product.price || 0).toLocaleString()} = ₹{((product.quantity || 1) * (product.price || 0)).toLocaleString()}
                              </Typography>
                            </Box>
                          ))}
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {getProductsDisplay(item).map((product, idx) => (
                              <Typography 
                                key={idx}
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500, 
                                  color: '#2c3e50',
                                  fontSize: '0.65rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={`${product.productName} (Qty: ${product.quantity})`}
                              >
                                {product.productName} {product.quantity > 1 && `(x${product.quantity})`}
                              </Typography>
                            ))}
                          </Box>
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
                      {getProductsDisplay(selectedTransaction).length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {getProductsDisplay(selectedTransaction).map((product, idx) => (
                            <Box key={idx} sx={{ p: 1.5, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50', mb: 0.5 }}>
                                {product.productName}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Quantity: <strong>{product.quantity || 1}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Price: <strong>₹{(product.price || 0).toLocaleString()}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#f39c12', fontWeight: 600 }}>
                                  Subtotal: <strong>₹{((product.quantity || 1) * (product.price || 0)).toLocaleString()}</strong>
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No products found
                        </Typography>
                      )}
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