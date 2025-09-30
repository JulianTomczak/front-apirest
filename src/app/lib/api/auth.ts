"use client";

import { AuthRequest, AuthResponse } from "../../types/auth";

export async function login(credentials: AuthRequest): Promise<AuthResponse> {
  const res = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    throw new Error("Credenciales inválidas");
  }

  const data = await res.json();
  
  // Guarda el token en localStorage
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  
  return data;
}



