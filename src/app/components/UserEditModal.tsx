"use client";

import { useState, useEffect } from "react";
import { updateUsuario } from "../lib/api/usuarios";
import { UserRequestDTO, UserResponseDTO } from "../types/user";

interface UserEditModalProps {
  user: UserResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserEditModal({ user, onClose, onSuccess }: UserEditModalProps) {
  const [form, setForm] = useState<UserRequestDTO>({
    name: user.name,
    mail: user.mail,
    password: "",
    role: user.role,
  });

  // Estado de errores por campo
  const [errors, setErrors] = useState<Partial<Record<keyof UserRequestDTO, string>>>({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setForm({
      name: user.name,
      mail: user.mail,
      password: "",
      role: user.role,
    });
    setErrors({});
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar error del campo mientras el usuario escribe
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setErrors({});
    setLoading(true);

    try {
      await updateUsuario(user.id, form);
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err && typeof err === "object") {
        setErrors(err); // mostrar errores por campo
      } else {
        setErrors({ name: "Error desconocido" });
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
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
          Editar Usuario
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              name="mail"
              placeholder="Correo electrónico"
              value={form.mail}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            />
            {errors.mail && <p className="text-red-500 text-sm mt-1">{errors.mail}</p>}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Nueva contraseña"
              value={form.password}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-important mt-2"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
