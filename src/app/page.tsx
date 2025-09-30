"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  role?: string;
  sub?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<DecodedToken | null>(null);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        setUser(decoded);
      }
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-500 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-8">
        {/* Botón de Logout */}
        <div
          className="flex justify-end mb-6 fade-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <button onClick={handleLogout} className="btn-important">
            Desconectarse
          </button>
        </div>

        {/* Header */}
        <div
          className="tareas-header mb-6 text-center fade-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="icono-decorativo icono-tarea mx-auto">🏠</div>
          <h1 className="tareas-title">Dashboard</h1>
          <p className="text-foreground">Selecciona una sección para administrar</p>
        </div>

        {/* Tarjetas */}
        <div className="tareas-grid">
          {/* Administrar Tareas */}
          <div
            className="tarea-card pendiente cursor-pointer hover:shadow-lg transition fade-slide-up"
            style={{ animationDelay: "0.3s" }}
            onClick={() => router.push("/tareas")}
          >
            <h2 className="text-xl font-semibold">📝 Administrar Tareas</h2>
            <p>Ver, crear y gestionar todas tus tareas.</p>
          </div>

          {/* Administrar Usuarios (solo ADMIN) */}
          {user.role === "ADMIN" && (
            <div
              className="tarea-card completada cursor-pointer hover:shadow-lg transition fade-slide-up"
              style={{ animationDelay: "0.4s" }}
              onClick={() => router.push("/usuarios")}
            >
              <h2 className="text-xl font-semibold">👥 Administrar Usuarios</h2>
              <p>Ver y gestionar todos los usuarios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
