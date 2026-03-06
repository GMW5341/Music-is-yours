"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  AuthUser,
  AuthState,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
} from "@/lib/auth";
import { initSubscription } from "@/lib/subscription";

interface AuthContextType extends AuthState {
  login: (req: LoginRequest) => Promise<AuthResponse>;
  register: (req: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) {
      initSubscription(stored.id);
    }
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (req: LoginRequest): Promise<AuthResponse> => {
    const res = await authLogin(req);
    if (res.success && res.user) {
      initSubscription(res.user.id);
      setUser(res.user);
    }
    return res;
  }, []);

  const register = useCallback(async (req: RegisterRequest): Promise<AuthResponse> => {
    const res = await authRegister(req);
    if (res.success && res.user) {
      initSubscription(res.user.id);
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
