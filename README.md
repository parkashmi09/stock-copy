# Stock Management App

A modern, responsive stock management application built with React, Vite, Material UI, and Tailwind CSS. This PWA (Progressive Web App) provides comprehensive inventory management capabilities.

## Features

### 📊 Dashboard
- Real-time stock overview with key metrics
- Interactive charts showing stock levels
- Total stock, sold today, and remaining stock tracking

### 📦 Stock Management
- Add new stock items with categories and subcategories
- View current stock levels
- Edit and delete stock entries
- Track recently added items

### 📁 Category Management
- Create and manage product categories
- Organize products with subcategories
- Hierarchical product organization

### 💳 Payment System
- Add payment transactions with UPI validation
- Track payment history
- Support for online and manual payments
- Transaction status tracking

### 🚀 PWA Features
- Installable as a native app
- Offline capability
- Responsive design for all devices
- Fast loading with Vite

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **UI Framework**: Material UI + Tailwind CSS
- **Charts**: Material UI X Charts
- **PWA**: Vite PWA Plugin
- **Styling**: Tailwind CSS + Material UI

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
stock-management-react/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration with PWA
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## Key Components

- **Dashboard**: Overview with metrics and charts
- **Stock Management**: Add, view, edit, delete stock items
- **Category Management**: Organize products by categories
- **Payment System**: Track transactions and payments
- **Responsive Sidebar**: Navigation between sections

## PWA Features

- **Manifest**: App metadata and icons
- **Service Worker**: Offline functionality
- **Install Prompt**: Add to home screen
- **Responsive Design**: Works on all screen sizes

## Development

The app uses a modern React setup with:
- Functional components with hooks
- Material UI for consistent design
- Tailwind CSS for utility classes
- State management with React useState
- Responsive grid layouts

## Browser Support

- Chrome (recommended for PWA features)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use this project for your own applications.
