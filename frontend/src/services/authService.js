const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'getsy_auth_token';
const USER_KEY = 'getsy_auth_user';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(user, token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore storage errors */
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Login user
 */
export async function loginUser({ email, password }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok && data.user) {
      saveAuthSession(data.user, data.token);
      return { success: true, user: data.user, token: data.token };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch {
    // If backend is offline, simulate authenticating the demo customer
    const mockUser = {
      id: 'usr-demo-1',
      name: email.split('@')[0] ? (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)) : 'Sahil',
      email: email,
      role: 'customer'
    };
    const mockToken = 'mock-jwt-token-getsy-demo';
    saveAuthSession(mockUser, mockToken);
    return { success: true, user: mockUser, token: mockToken, isMock: true };
  }

  return { success: false, error: 'Invalid credentials. Please try again.' };
}

/**
 * Register user
 */
export async function registerUser({ name, email, password, role = 'customer', phone }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (res.ok && data.user) {
      saveAuthSession(data.user, data.token);
      return { success: true, user: data.user, token: data.token };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch {
    // Fallback simulation
    const mockUser = {
      id: `usr-${Date.now()}`,
      name: name || 'Sahil Varpe',
      email,
      phone: phone || '',
      role
    };
    const mockToken = `mock-token-${Date.now()}`;
    saveAuthSession(mockUser, mockToken);
    return { success: true, user: mockUser, token: mockToken, isMock: true };
  }

  return { success: false, error: 'Registration failed. Please try again.' };
}
