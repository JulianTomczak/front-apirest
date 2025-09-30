"use client";

import { useState, useEffect } from "react";
import { getUsuarios } from "../lib/api/usuarios";
import { User } from "../types/user";
import { jwtDecode } from "jwt-decode";
import { createTarea } from "../lib/api/tareas";

interface TaskFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface DecodedToken {
  role: "USER" | "ADMIN";
  mail: string;
}

export default function TaskFormModal({ onClose, onSuccess }: TaskFormModalProps) {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    userId: 0, // solo para ADMIN
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  // Decodificamos el token para obtener el rol
  useEffect(() => {
    if (!token) return;
    const decoded = jwtDecode<DecodedToken>(token);
    setRole(decoded.role);
    if (decoded.role === "ADMIN") {
      // si es admin, cargamos todos los usuarios
      getUsuarios().then(data => setUsers(data.content));
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setLoading(true);

    try {
      // si es USER, enviamos "me" como placeholder y el backend usa el ID del token
      const userId = role === "ADMIN" ? form.userId : undefined;
      await createTarea({ ...form }, userId);
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative animate-fade-slide-up">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Crear Tarea</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Título de la tarea"
            value={form.title}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {role === "ADMIN" && (
            <select
              name="userId"
              value={form.userId}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value={0}>Selecciona un usuario</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.mail})</option>
              ))}
            </select>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-important mt-2"
          >
            {loading ? "Creando..." : "Crear Tarea"}
          </button>
        </form>
      </div>
    </div>
  );
}
