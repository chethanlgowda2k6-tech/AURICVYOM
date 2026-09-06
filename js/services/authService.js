// AURICVYOM Centralized Authentication Service
// Connects to Node.js/Prisma API (http://localhost:5001/api/v1/auth) with resilient client simulation fallback

const API_BASE_URL = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "auricvyom_access_token",
  REFRESH_TOKEN: "auricvyom_refresh_token",
  USER: "auricvyom_user_session"
};

class AuthService {
  constructor() {
    this.accessToken = this.getStoredToken();
    this.refreshToken = this.getStoredRefreshToken();
    this.currentUser = this.getStoredUser();
  }

  getStoredToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null;
    } catch (e) {
      return null;
    }
  }

  getStoredRefreshToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
    } catch (e) {
      return null;
    }
  }

  getStoredUser() {
    try {
      const u = localStorage.getItem(STORAGE_KEYS.USER);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  setSession(accessToken, refreshToken, user) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.currentUser = user;

    try {
      if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      else localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      else localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn("Error saving session to storage:", e);
    }
  }

  clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser = null;

    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn("Error clearing session:", e);
    }
  }

  isAuthenticated() {
    return !!(this.accessToken && this.currentUser);
  }

  async register({ name, email, password, phone }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please verify your details.");
      }

      this.setSession(data.data.accessToken, data.data.refreshToken, data.data.user);
      return { success: true, user: data.data.user, message: data.message };
    } catch (err) {
      // Check if network / server down: fallback simulation
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        console.warn("Backend unreachable, using client auth simulation for demo:", err);
        const simUser = {
          id: "sim-" + Date.now(),
          name: name || "Noble Traveler",
          email: email,
          phone: phone || "+91 98765 43210",
          role: "USER",
          preferredCurrency: "INR",
          tier: "Auric Diamond Member",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          loyaltyPoints: 1250,
          preferences: { travelStyle: "Luxury & Curated", budgetRange: "₹25K–₹50K" }
        };
        const simToken = "sim_token_" + Date.now();
        this.setSession(simToken, "sim_refresh_" + Date.now(), simUser);
        return { success: true, user: simUser, message: "Welcome to AuricVyom (Demo Mode)." };
      }
      throw err;
    }
  }

  async login({ email, password }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "We couldn't sign you in. Please check your email and password.");
      }

      this.setSession(data.data.accessToken, data.data.refreshToken, data.data.user);
      return { success: true, user: data.data.user, message: data.message };
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        console.warn("Backend unreachable, using client auth simulation for demo:", err);
        const simUser = {
          id: "sim-" + Date.now(),
          name: email.split("@")[0].replace(/[^a-zA-Z]/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Noble Traveler",
          email: email,
          phone: "+91 98801 23456",
          role: "USER",
          preferredCurrency: "INR",
          tier: "Auric Diamond Member",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          loyaltyPoints: 14850,
          preferences: { travelStyle: "Luxury & Nature", budgetRange: "₹25K–₹50K" }
        };
        const simToken = "sim_token_" + Date.now();
        this.setSession(simToken, "sim_refresh_" + Date.now(), simUser);
        return { success: true, user: simUser, message: `Welcome back, ${simUser.name}!` };
      }
      throw err;
    }
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        }).catch(() => {});
      }
    } finally {
      this.clearSession();
    }
    return { success: true };
  }

  async getMe() {
    if (!this.accessToken) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

      if (res.status === 401) {
        // Try refresh token
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          return this.getMe();
        }
        this.clearSession();
        return null;
      }

      const data = await res.json();
      if (data.success && data.data?.user) {
        this.currentUser = { ...this.currentUser, ...data.data.user };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
        return this.currentUser;
      }
    } catch (e) {
      console.warn("Error fetching /auth/me:", e);
      return this.currentUser;
    }
    return null;
  }

  async refreshTokens() {
    if (!this.refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.accessToken) {
        this.accessToken = data.data.accessToken;
        this.refreshToken = data.data.refreshToken;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, this.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken);
        return true;
      }
    } catch (e) {
      console.warn("Token refresh error:", e);
    }
    return false;
  }

  async forgotPassword(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      return data;
    } catch (e) {
      return {
        success: true,
        message: "If an account exists with this email, recovery instructions have been sent."
      };
    }
  }

  async resetPassword({ token, newPassword }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password.");
      }
      return data;
    } catch (e) {
      if (e.message.includes("Failed to fetch")) {
        return {
          success: true,
          message: "Your password has been successfully reset (Demo Mode). You may now sign in."
        };
      }
      throw e;
    }
  }

  async updatePreferences(preferences) {
    if (!this.accessToken) {
      if (this.currentUser) {
        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
      }
      return { success: true };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(preferences)
      });

      const data = await res.json();
      if (this.currentUser) {
        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
      }
      return data;
    } catch (e) {
      if (this.currentUser) {
        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
      }
      return { success: true };
    }
  }

  // Google OAuth Abstraction
  async continueWithGoogle() {
    // Check if Google OAuth Client ID is configured
    const clientId = window.AURICVYOM_GOOGLE_CLIENT_ID || null;

    if (!clientId) {
      return {
        configured: false,
        message: "Google OAuth is ready for integration. To enable live Google sign-in, add your GOOGLE_CLIENT_ID to the environment configuration.",
        demoUser: {
          name: "Aarav Sharma (Google)",
          email: "aarav.google@auricvyom.com",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        }
      };
    }

    // When configured with real OAuth redirect
    const redirectUri = encodeURIComponent(window.location.origin + "/login");
    const scope = encodeURIComponent("profile email");
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  }
}

export const authService = new AuthService();
