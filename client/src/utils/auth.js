// Authentication utilities for managing JWT tokens

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeToken = () => {
  localStorage.removeItem('authToken');
};

export const isLoggedIn = () => {
  return !!getToken();
};

export const getAuthHeaders = () => {
  const token = getToken();
  if (token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  return {
    'Content-Type': 'application/json'
  };
};

export const verifyToken = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch('http://localhost:5000/auth/verify', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};
