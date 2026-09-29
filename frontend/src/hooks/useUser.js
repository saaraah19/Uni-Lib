// src/hooks/useUser.js
import { useState, useEffect } from 'react';

// Helper function inside the same file
const normalizeUser = (userData) => {
  if (!userData) return null;
  
  return {
    id: userData.id || userData._id,
    name: userData.name || userData.username || 'Unknown',
    email: userData.email || '',
    role: userData.role || 'user',
    userCode: userData.userCode || 'Not assigned',
    createdAt: userData.createdAt || null,
    token: userData.token,
  };
};

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Normalize when loading
        setUser(normalizeUser(parsedUser));
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Ensure token is included
    const userWithToken = { ...userData, token };
    // Normalize before storing
    const normalizedUser = normalizeUser(userWithToken);
    
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', token);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    const normalizedUser = normalizeUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  return { user, login, logout, updateUser, loading };
};