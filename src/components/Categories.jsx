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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../config';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', categoryId: '' });
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSubcategoryDialog, setOpenSubcategoryDialog] = useState(false);
  const [openEditCategoryDialog, setOpenEditCategoryDialog] = useState(false);
  const [openEditSubcategoryDialog, setOpenEditSubcategoryDialog] = useState(false);
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] = useState(false);
  const [openDeleteSubcategoryDialog, setOpenDeleteSubcategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [editCategory, setEditCategory] = useState({ name: '' });
  const [editSubcategory, setEditSubcategory] = useState({ name: '', categoryId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    setIsFetchingCategories(true);
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
        
        // Extract all subcategories from categories
        const allSubcategories = data.reduce((acc, category) => {
          return acc.concat(category.subcategories || []);
        }, []);
        setSubcategories(allSubcategories);
      } else {
        console.error('Failed to fetch categories');
        showNotification('Failed to load categories', 'error');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('Network error while loading categories', 'error');
    } finally {
      setIsFetchingCategories(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Category API functions
  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      showNotification('Please enter a category name', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.CATEGORY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategory.name })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh categories after creation
        await fetchCategories();
        setNewCategory({ name: '' });
        setOpenCategoryDialog(false);
        showNotification('Category created successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to create category', 'error');
      }
    } catch (error) {
      console.error('Category creation error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setEditCategory({ name: category.name });
    setOpenEditCategoryDialog(true);
  };

  // Update category
  const updateCategory = async () => {
    if (!editCategory.name.trim()) {
      showNotification('Please enter a category name', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES_UPDATE}/${selectedCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editCategory.name })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh categories after update
        await fetchCategories();
        setOpenEditCategoryDialog(false);
        setSelectedCategory(null);
        showNotification('Category updated successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to update category', 'error');
      }
    } catch (error) {
      console.error('Category update error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setOpenDeleteCategoryDialog(true);
  };

  // Delete category
  const deleteCategory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.CATEGORIES_DELETE}/${selectedCategory._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh categories after deletion
        await fetchCategories();
        setOpenDeleteCategoryDialog(false);
        setSelectedCategory(null);
        showNotification('Category deleted successfully!', 'success');
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Category deletion error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Subcategory API functions
  const createSubcategory = async () => {
    if (!newSubcategory.name.trim() || !newSubcategory.categoryId) {
      showNotification('Please enter subcategory name and select category', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.SUBCATEGORY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newSubcategory.name,
          categoryId: newSubcategory.categoryId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh categories after creation to get updated subcategories
        await fetchCategories();
        setNewSubcategory({ name: '', categoryId: '' });
        setOpenSubcategoryDialog(false);
        showNotification('Subcategory created successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to create subcategory', 'error');
      }
    } catch (error) {
      console.error('Subcategory creation error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit subcategory
  const handleEditSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setEditSubcategory({ 
      name: subcategory.name, 
      categoryId: subcategory.category 
    });
    setOpenEditSubcategoryDialog(true);
  };

  // Update subcategory
  const updateSubcategory = async () => {
    if (!editSubcategory.name.trim() || !editSubcategory.categoryId) {
      showNotification('Please enter subcategory name and select category', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.SUB_CATEGORIES_UPDATE}/${selectedSubcategory._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editSubcategory.name,
          categoryId: editSubcategory.categoryId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh categories after update
        await fetchCategories();
        setOpenEditSubcategoryDialog(false);
        setSelectedSubcategory(null);
        showNotification('Subcategory updated successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to update subcategory', 'error');
      }
    } catch (error) {
      console.error('Subcategory update error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete subcategory
  const handleDeleteSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setOpenDeleteSubcategoryDialog(true);
  };

  // Delete subcategory
  const deleteSubcategory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.SUB_CATEGORIES_DELETE}/${selectedSubcategory._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh categories after deletion
        await fetchCategories();
        setOpenDeleteSubcategoryDialog(false);
        setSelectedSubcategory(null);
        showNotification('Subcategory deleted successfully!', 'success');
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to delete subcategory', 'error');
      }
    } catch (error) {
      console.error('Subcategory deletion error:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
  
      <Grid container spacing={3}>
        {/* Categories Section */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Card Header with Gradient */}
            <Box sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 3,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }} />
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Categories
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {categories.length} categories available
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={fetchCategories}
                      disabled={isFetchingCategories}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.5)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        },
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenCategoryDialog(true)}
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-1px)'
                        },
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      + Add Category
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {isFetchingCategories ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Loading categories...
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {categories.length > 0 ? (
                    <Box sx={{ p: 2 }}>
                      {categories.map((category, index) => (
                        <Box
                          key={category._id}
                          sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                                {category.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                ID: {category._id}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#667eea', fontSize: '0.8rem', mt: 0.5 }}>
                                {category.subcategories?.length || 0} subcategories
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditCategory(category)}
                                sx={{ 
                                  color: '#667eea',
                                  '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteCategory(category)}
                                sx={{ 
                                  color: '#e74c3c',
                                  '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.1)' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CategoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                        No Categories Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Get started by adding your first category
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenCategoryDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                          }
                        }}
                      >
                        Add First Category
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Subcategories Section */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Card Header with Gradient */}
            <Box sx={{
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              p: 3,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }} />
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Subcategories
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {subcategories.length} subcategories available
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={fetchCategories}
                      disabled={isFetchingCategories}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.5)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        },
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenSubcategoryDialog(true)}
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-1px)'
                        },
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      + Add Subcategory
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 0 }}>
              {isFetchingCategories ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Loading subcategories...
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {subcategories.length > 0 ? (
                    <Box sx={{ p: 2 }}>
                      {subcategories.map((subcategory, index) => {
                        // Find parent category name
                        const parentCategory = categories.find(cat => cat._id === subcategory.category);
                        return (
                          <Box
                            key={subcategory._id}
                            sx={{
                              p: 2,
                              mb: 2,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                              border: '1px solid rgba(0,0,0,0.05)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0.5 }}>
                                  {subcategory.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                  ID: {subcategory._id}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Typography variant="body2" sx={{ color: '#764ba2', fontSize: '0.8rem' }}>
                                    Parent: {parentCategory?.name || 'Unknown Category'}
                                  </Typography>
                                  <Chip 
                                    label={parentCategory?.name || 'Unknown'} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: 'rgba(118, 75, 162, 0.1)',
                                      color: '#764ba2',
                                      fontSize: '0.7rem'
                                    }} 
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditSubcategory(subcategory)}
                                  sx={{ 
                                    color: '#667eea',
                                    '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteSubcategory(subcategory)}
                                  sx={{ 
                                    color: '#e74c3c',
                                    '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.1)' }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CategoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                        No Subcategories Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Add subcategories to organize your products better
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenSubcategoryDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #764ba2, #667eea)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #6a4190, #5a6fd8)'
                          }
                        }}
                      >
                        Add First Subcategory
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Add New Category
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ name: e.target.value })}
            sx={{ mt: 2 }}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCategoryDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={createCategory} 
            variant="contained"
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
              }
            }}
          >
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={openEditCategoryDialog} onClose={() => setOpenEditCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1, color: '#667eea' }} />
            Edit Category
          </Box>
          <IconButton onClick={() => setOpenEditCategoryDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={editCategory.name}
            onChange={(e) => setEditCategory({ name: e.target.value })}
            sx={{ mt: 2 }}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditCategoryDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={updateCategory} 
            variant="contained"
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(45deg, #f39c12, #e67e22)',
              '&:hover': {
                background: 'linear-gradient(45deg, #e67e22, #d35400)'
              }
            }}
          >
            {isLoading ? 'Updating...' : 'Update Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={openDeleteCategoryDialog} onClose={() => setOpenDeleteCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteCategoryDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={deleteCategory}
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
            {isLoading ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={openSubcategoryDialog} onClose={() => setOpenSubcategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Add New Subcategory
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subcategory Name"
            value={newSubcategory.name}
            onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={newSubcategory.categoryId}
              onChange={(e) => setNewSubcategory({ ...newSubcategory, categoryId: e.target.value })}
              label="Parent Category"
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenSubcategoryDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={createSubcategory} 
            variant="contained"
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(45deg, #764ba2, #667eea)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6a4190, #5a6fd8)'
              }
            }}
          >
            {isLoading ? 'Creating...' : 'Create Subcategory'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={openEditSubcategoryDialog} onClose={() => setOpenEditSubcategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1, color: '#764ba2' }} />
            Edit Subcategory
          </Box>
          <IconButton onClick={() => setOpenEditSubcategoryDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subcategory Name"
            value={editSubcategory.name}
            onChange={(e) => setEditSubcategory({ ...editSubcategory, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={editSubcategory.categoryId}
              onChange={(e) => setEditSubcategory({ ...editSubcategory, categoryId: e.target.value })}
              label="Parent Category"
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditSubcategoryDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={updateSubcategory} 
            variant="contained"
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(45deg, #f39c12, #e67e22)',
              '&:hover': {
                background: 'linear-gradient(45deg, #e67e22, #d35400)'
              }
            }}
          >
            {isLoading ? 'Updating...' : 'Update Subcategory'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Subcategory Confirmation Dialog */}
      <Dialog open={openDeleteSubcategoryDialog} onClose={() => setOpenDeleteSubcategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to delete "{selectedSubcategory?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteSubcategoryDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={deleteSubcategory}
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
            {isLoading ? 'Deleting...' : 'Delete Subcategory'}
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

export default Categories; 