export interface StoredUser {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  role: "user" | "admin";
  isApproved: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  role: "user" | "admin";
  isApproved?: boolean;
  createdAt?: string;
}

const SESSION_STORAGE_KEY = "db.learn.session";
const AUTH_CHANGE_EVENT = "db-learn-auth-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function dispatchAuthChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Сұраныс орындалмады.");
  }

  return payload as T;
}

export function subscribeToAuthChanges(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getCurrentUser(): SessionUser | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function saveCurrentUser(user: SessionUser | null) {
  if (!isBrowser()) {
    return;
  }

  if (user) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  dispatchAuthChange();
}

export async function registerUser(data: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}) {
  const response = await requestJson<{
    message: string;
    user: SessionUser;
  }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  saveCurrentUser(response.user);
  return response.user;
}

export async function loginUser(email: string, password: string) {
  const response = await requestJson<{
    message: string;
    user: SessionUser;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveCurrentUser(response.user);
  return response.user;
}

export async function getRegisteredUsers(): Promise<StoredUser[]> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return [];
  }

  return requestJson<StoredUser[]>("/api/auth/users", {
    headers: {
      "X-User-Role": currentUser.role,
      "X-User-Email": currentUser.email,
    },
  });
}

export function logoutUser() {
  saveCurrentUser(null);
}

export function isAdmin(user: SessionUser | null) {
  return user?.role === "admin";
}
