"use client";

import { useState, useEffect, useCallback } from "react";
import { validateAuthToken } from "@/utils/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem("trading-journal-auth-token");
    const isAuth = !!authToken && validateAuthToken(authToken);
    setIsAuthenticated(isAuth);
    setIsLoaded(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("trading-journal-auth-token");
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    setIsAuthenticated,
    logout,
    isLoaded,
  };
}
