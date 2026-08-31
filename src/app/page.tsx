"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import PageHeader from "./components/PageHeader";
import AppTopBar from "./components/AppTopBar";

interface DecodedToken {
  exp: number;
  role?: string;
  sub?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<DecodedToken | null>(null);

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

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-r from-purple-400 to-indigo-500 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-5 sm:p-7">
        <AppTopBar onLogout={handleLogout} />

        <PageHeader title="Dashboard" subtitle="Selecciona una sección para administrar" icon="🏠" />

        <div className="cards-grid">
          <div className="nav-card" onClick={() => router.push("/tareas")}>
            <div className="nav-card-icon">📝</div>
            <div className="nav-card-body">
              <p className="nav-card-title">Administrar Tareas</p>
              <p className="nav-card-text">Ver, crear y gestionar todas tus tareas.</p>
            </div>
            <span className="nav-card-arrow" aria-hidden="true">
              →
            </span>
          </div>

          {user.role === "ADMIN" && (
            <div className="nav-card" onClick={() => router.push("/usuarios")}>
              <div className="nav-card-icon">👥</div>
              <div className="nav-card-body">
                <p className="nav-card-title">Administrar Usuarios</p>
                <p className="nav-card-text">Ver y gestionar todos los usuarios.</p>
              </div>
              <span className="nav-card-arrow" aria-hidden="true">
                →
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
