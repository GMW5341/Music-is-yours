// ============================================================================
// Authentication Library
// JWT 기반 인증 시스템 (회원가입, 로그인, 세션 관리)
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  tier: "free" | "starter" | "pro" | "studio";
  credits: number;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

// ============================================================================
// Token management (client-side)
// ============================================================================

const TOKEN_KEY = "miy_auth_token";
const USER_KEY = "miy_auth_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ============================================================================
// Simple JWT helpers (demo - production에서는 서버 사이드 검증 필요)
// ============================================================================

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

const JWT_SECRET = "miy-demo-secret-2024";

export function createToken(user: AuthUser): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  );
  const signature = base64UrlEncode(JWT_SECRET + "." + header + "." + payload);
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string; email: string; name: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ============================================================================
// In-memory user store (demo - production에서는 DB 사용)
// ============================================================================

interface StoredUser extends AuthUser {
  passwordHash: string;
}

const USERS_STORAGE_KEY = "miy_users_db";

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Simple hash (demo only - production에서는 bcrypt 등 사용)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// Auth API functions
// ============================================================================

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const { email, password, name } = req;

  if (!email || !password || !name) {
    return { success: false, error: "모든 필드를 입력해주세요." };
  }

  if (password.length < 6) {
    return { success: false, error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return { success: false, error: "이미 가입된 이메일입니다." };
  }

  const passwordHash = await hashPassword(password);
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email,
    name,
    tier: "free",
    credits: 10,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(newUser);
  saveUsers(users);

  const { passwordHash: _, ...user } = newUser;
  const token = createToken(user);
  storeAuth(token, user);

  return { success: true, user, token };
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const { email, password } = req;

  if (!email || !password) {
    return { success: false, error: "이메일과 비밀번호를 입력해주세요." };
  }

  const users = getUsers();
  const found = users.find((u) => u.email === email);
  if (!found) {
    return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const passwordHash = await hashPassword(password);
  if (found.passwordHash !== passwordHash) {
    return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const { passwordHash: _, ...user } = found;
  const token = createToken(user);
  storeAuth(token, user);

  return { success: true, user, token };
}

export function logout(): void {
  clearAuth();
}

export function getCurrentUser(): AuthUser | null {
  const token = getStoredToken();
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) {
    clearAuth();
    return null;
  }

  return getStoredUser();
}
