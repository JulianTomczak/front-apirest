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

  // Errores por campo
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  // Decodificamos el token para obtener el rol
  useEffect(() => {
    if (!token) return;
    const decoded = jwtDecode<DecodedToken>(token);
    setRole(decoded.role);
    if (decoded.role === "ADMIN") {
      getUsuarios().then(data => setUsers(data.content));
    }
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Limpiar error del campo mientras el usuario escribe
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setErrors({});
    setLoading(true);

    try {
      const userId = role === "ADMIN" ? form.userId : undefined;
      await createTarea({ ...form }, userId);
      onSuccess();
      onClose();
    } catch (err: any) {
      // Si el backend devuelve errores por campo
      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({ title: "Error desconocido" });
      }
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
          <div>
            <input
              type="text"
              name="title"
              placeholder="Título de la tarea"
              value={form.title}
              onChange={handleChange}
              className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <textarea
              name="description"
              placeholder="Descripción"
              value={form.description}
              onChange={handleChange}
              className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full ${
                errors.dueDate ? "border-red-500" : ""
              }`}
            />
            {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
          </div>

          {role === "ADMIN" && (
            <div>
              <select
                name="userId"
                value={form.userId}
                onChange={handleChange}
                className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full ${
                  errors.userId ? "border-red-500" : ""
                }`}
              >
                <option value={0}>Selecciona un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.mail})</option>
                ))}
              </select>
              {errors.userId && <p className="text-red-500 text-sm mt-1">{errors.userId}</p>}
            </div>
          )}

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
