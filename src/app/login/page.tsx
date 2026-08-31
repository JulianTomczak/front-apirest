"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "../lib/api/auth";
import { AuthRequest } from "../types/auth";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  role?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<AuthRequest>({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await login(form);
      localStorage.setItem("token", data.token);
      jwtDecode<DecodedToken>(data.token);
      router.replace("/");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <Image src="/gato-bailando.webp" alt="Gato bailando" width={48} height={48} className="rounded-xl" />
        </div>

        <h1 className="auth-title">Iniciar Sesión</h1>
        <p className="auth-subtitle">Accede para gestionar tus tareas y usuarios</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-username">
              Usuario
            </label>
            <input
              id="login-username"
              type="text"
              name="username"
              placeholder="Tu usuario"
              value={form.username}
              onChange={handleChange}
              className="auth-input"
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="error-banner" style={{ marginTop: "0.5rem" }}>
              ⚠️ {error}
            </p>
          )}

          <button type="submit" className="btn-apply w-full" style={{ marginTop: "1rem" }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
