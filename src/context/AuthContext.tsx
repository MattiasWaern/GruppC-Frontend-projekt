
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/user";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function getTokenExpiration(token: string): number | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) return null;

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    const payload = JSON.parse(atob(padded));

    if (
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp)
    ) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const expiration = getTokenExpiration(token);

  return expiration !== null && expiration > Date.now();
}

function getStoredUser(): User | null {
  try {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser || !isTokenValid(token)) {
      clearStoredAuth();
      return null;
    }

    const user: unknown = JSON.parse(storedUser);

    if (
      typeof user === "object" &&
      user !== null &&
      "userId" in user &&
      "name" in user &&
      "email" in user &&
      "role" in user &&
      typeof user.userId === "number" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      (typeof user.role === "number" || user.role === null)
    ) {
      return user as User;
    }

    clearStoredAuth();
    return null;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const isAdmin = user?.role === 3 || user?.role === 4;

  function login(userData: User, newToken: string) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  // Kontrollera token regelbundet och när sidan blir aktiv igen.
  useEffect(() => {
    function checkAuth() {
      const token = localStorage.getItem("token");

      if (!token || !isTokenValid(token)) {
        clearStoredAuth();
        setUser(null);
      }
    }

    checkAuth();

    const interval = window.setInterval(checkAuth, 30_000);

    window.addEventListener("focus", checkAuth);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth måste användas inom AuthProvider"
    );
  }

  return context;
}
