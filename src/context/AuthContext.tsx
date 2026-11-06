
import {
  createContext,
  useContext,
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

function getStoredUser(): User | null {
  try {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) return null;

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

    return null;
  } catch {
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
    throw new Error("useAuth måste användas inom AuthProvider");
  }

  return context;
}
