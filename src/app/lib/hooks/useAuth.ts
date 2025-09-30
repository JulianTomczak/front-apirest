"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  role?: string;
  [key: string]: any;
}

export function useAuth() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp > now) {
        setAuth({ isAuthenticated: true, role: decoded.role });
      } else {
        localStorage.removeItem("token");
        setAuth({ isAuthenticated: false });
        router.replace("/login");
      }
    } catch (err) {
      console.error("Token inválido", err);
      localStorage.removeItem("token");
      setAuth({ isAuthenticated: false });
      router.replace("/login");
    }
  }, [router]);

  return auth;
}
