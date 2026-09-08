"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  exp: number;
  role?: string;
  sub?: string;
  id?: number;
}

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      router.replace("/login");
      setIsChecking(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(stored);
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp > now) {
        setToken(stored);
        setUser(decoded);
      } else {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    } catch (err) {
      console.error("Token inválido", err);
      localStorage.removeItem("token");
      router.replace("/login");
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  return { token, user, isChecking };
}