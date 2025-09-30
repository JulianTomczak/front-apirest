"use client";

import { useState } from "react";
import { createUsuario } from "../lib/api/usuarios";
import { UserRequestDTO } from "../types/user";

interface UserFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({ onClose, onSuccess }: UserFormModalProps) {
  const [form, setForm] = useState<UserRequestDTO>({
    name: "",
    mail: "",
    password: "",
    role: "USER", // valor por defecto
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      await createUsuario(form);
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
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
          Crear Usuario
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            name="mail"
            placeholder="Correo electrónico"
            value={form.mail}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-important mt-2">
            {loading ? "Creando..." : "Crear Usuario"}
          </button>
        </form>
      </div>
    </div>
  );
}
