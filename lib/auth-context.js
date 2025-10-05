"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Decode the JWT token to get user info
          const decoded = jwt.decode(token);
          console.log('Decoded JWT token:', decoded);
          console.log('Token length:', token.length);
          console.log('Token starts with:', token.substring(0, 20));
          
          if (decoded && decoded._id) {
            const userData = {
              _id: decoded._id,
              username: decoded.username,
              email: decoded.email,
              profileImage: decoded.profileImage
            };
            console.log('Setting user data:', userData);
            setUser(userData);
          } else {
            console.log('JWT decode failed. Decoded:', decoded);
            console.log('Token payload (first 100 chars):', token.substring(0, 100));
            console.log('Token length:', token.length);
            console.log('Token structure check:');
            console.log('- Has 3 parts:', token.split('.').length === 3);
            console.log('- Parts:', token.split('.').map(part => part.length));
            console.error('Failed to decode JWT token or missing _id:', decoded);
            // Try to get user data from localStorage as fallback
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Using stored user data:', parsedUser);
                setUser(parsedUser);
              } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }
            } else {
              localStorage.removeItem('token');
            }
          }
        } else {
          console.log('No token found in localStorage');
        }
      } catch (error) {
        console.error('Failed to load user from token:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data as fallback
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
