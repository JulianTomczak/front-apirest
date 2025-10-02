"use client";

import { useState } from "react";
import { TaskResponseDTO, TaskUpdateDTO } from "../types/task";
import { patchTarea, updateTarea } from "../lib/api/tareas";

interface TaskEditModalProps {
  task: TaskResponseDTO;
  onClose: () => void;
  onSuccess: (updatedTask: TaskResponseDTO) => void;
}

export default function TaskEditModal({ task, onClose, onSuccess }: TaskEditModalProps) {
  const token = localStorage.getItem("token")!;
  const [form, setForm] = useState<TaskUpdateDTO>({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate.split("T")[0],
    completed: task.completed,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "completed" ? value === "true" : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedTask = await updateTarea(task.id, form, token);
      onSuccess(updatedTask);
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
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Editar Tarea</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Título"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Descripción"
          />
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              name="completed"
              value={form.completed ? "true" : "false"}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
            >
              <option value="false">Pendiente</option>
              <option value="true">Completada</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-important mt-2">
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
