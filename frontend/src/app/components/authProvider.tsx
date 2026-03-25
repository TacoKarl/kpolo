// components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { refreshAccessToken, getUserRoles } from "../lib/auth";

type AuthContextType = {
  roles: string[];
  updateRoles: () => void;
};

const AuthContext = createContext<AuthContextType>({ 
  roles: ["Guest"],
  updateRoles: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<string[]>(["Guest"]);

  const updateRoles = () => setRoles(getUserRoles());

  useEffect(() => {
    refreshAccessToken().then((token) => {
      if (token) updateRoles();
    });
  }, []);

  return (
    <AuthContext.Provider value={{ roles, updateRoles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
