import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import Login from './pages/Login';
import ClientPortal from './pages/ClientPortal';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WaiterDashboard from './pages/WaiterDashboard';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<ClientPortal />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/waiter" element={<WaiterDashboard />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
