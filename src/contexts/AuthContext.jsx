import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('AuthContext Init - Token exists:', !!token);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Set token in axios defaults
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('AuthContext Init - User set:', parsedUser.email, 'Role:', parsedUser.role);
      } catch (e) {
        console.error('Error parsing user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // Clear axios default header if no token
      delete api.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext - Login attempt:', email);
      
      // Clear any existing data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      
      console.log('AuthContext - Login response:', userData.email, 'Role:', userData.role);
      
      if (userData.token) {
        // Store new data
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        setUser(userData);
        console.log('AuthContext - Login successful');
        return userData;
      } else {
        throw new Error('No token in response');
      }
    } catch (error) {
      console.error('AuthContext - Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const newUser = response.data;
      
      if (newUser.token) {
        localStorage.setItem('token', newUser.token);
        localStorage.setItem('user', JSON.stringify(newUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${newUser.token}`;
        setUser(newUser);
      }
      
      return newUser;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext - Logging out...');
    
    // Clear localStorage completely
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear axios default headers
    delete api.defaults.headers.common['Authorization'];
    
    // Clear state
    setUser(null);
    
    console.log('AuthContext - Logout complete');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};