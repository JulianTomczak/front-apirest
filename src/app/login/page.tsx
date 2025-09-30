"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      const decoded = jwtDecode<DecodedToken>(data.token);
      router.replace("/");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-500">
      <div className="bg-white rounded-xl shadow-lg p-8 w-96 text-center fade-slide-up" style={{ animationDelay: "0.1s" }}>

        {/* Icono animado */}
        <div className="mb-4 flex justify-center fade-slide-up" style={{ animationDelay: "0.2s" }}>
          <img
            src="/gato-bailando.webp"
            alt="Gato bailando"
            className="w-16 h-16 rounded-full shadow-lg"
          />
        </div>

        {/* Título y descripción */}
        <h1 className="text-2xl font-bold text-purple-700 mb-2 fade-slide-up" style={{ animationDelay: "0.3s" }}>
          Iniciar Sesión
        </h1>
        <p className="text-gray-600 mb-6 fade-slide-up" style={{ animationDelay: "0.4s" }}>
          Accede para gestionar tus tareas y usuarios
        </p>

        {/* Formulario */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 fade-slide-up"
            style={{ animationDelay: "0.5s" }}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 fade-slide-up"
            style={{ animationDelay: "0.6s" }}
          />
          {error && (
            <p className="text-red-500 text-sm fade-slide-up" style={{ animationDelay: "0.7s" }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
