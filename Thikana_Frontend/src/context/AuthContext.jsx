import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getTokenPayload = (token) => {
  try {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) return null;

    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '='));
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  const payload = getTokenPayload(token);
  return Boolean(payload?.exp && payload.exp * 1000 > Date.now());
};

const storedToken = localStorage.getItem('thikana_token');
const initialToken = storedToken && isTokenValid(storedToken) ? storedToken : null;

if (!initialToken && storedToken) {
  localStorage.removeItem('thikana_token');
  localStorage.removeItem('thikana_user');
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('thikana_user') || 'null'),
  );

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to sign in');
    localStorage.setItem('thikana_token', data.token);
    setToken(data.token);
    try {
      const userResponse = await fetch(`${API_URL}/user/get-user-data`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (userResponse.status === 401) {
        logout();
        return;
      }
      const userData = await userResponse.json();
      if (userResponse.ok && userData.data) updateUser(userData.data);
    } catch {
      // A valid login still succeeds if profile hydration is temporarily unavailable.
    }
  };

  const register = async (form) => {
    const response = await fetch(`${API_URL}/auth/register-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to create your account');
    return data;
  };

  const updateUser = (nextUser) => {
    localStorage.setItem('thikana_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('thikana_token');
    localStorage.removeItem('thikana_user');
    setToken(null);
    setUser(null);
  };

  const authenticatedFetch = useCallback(async (input, options = {}) => {
    const response = await fetch(input, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (response.status === 401) {
      logout();
    }

    return response;
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      register,
      logout,
      updateUser,
      authenticatedFetch,
      apiUrl: API_URL,
    }),
    [token, user, authenticatedFetch],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
