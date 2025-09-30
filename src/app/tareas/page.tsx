"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTareas, deleteTarea, filterTareas } from "../lib/api/tareas";
import { Task, PaginatedTasks } from "../types/task";
import ConfirmModal from "../components/ConfirmModal";
import TaskFormModal from "../components/TaskFormModal";

export default function TareasPage() {
  const router = useRouter();

  const [tareas, setTareas] = useState<Task[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState({ 
    title: "", 
    completed: "" as "" | "true" | "false", 
    dueBefore: "", 
    userId: "" 
  });

  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("USER");
  const [userIdFromToken, setUserIdFromToken] = useState(0);

  // Leer token y datos del usuario desde el cliente
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.replace("/login");
      return;
    }

    setToken(t);

    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      setUserRole(payload.role);
      setUserIdFromToken(payload.id);
    } catch {}
  }, [router]);

  const loadTareas = async (page: number = currentPage) => {
    if (!token) return;

    try {
      setLoading(true);
      const data: PaginatedTasks = await getTareas(page);
      setTareas(data.content);
      setPaginatedData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async (page: number = 0) => {
    if (!token) return;

    try {
      setLoading(true);
      const completed = filters.completed === "" ? undefined : filters.completed === "true";

      const userIdToSend = userRole === "ADMIN" 
        ? (filters.userId ? Number(filters.userId) : undefined)
        : userIdFromToken;

      const data = await filterTareas(
        { 
          title: filters.title || undefined, 
          completed,
          dueBefore: filters.dueBefore || undefined,
          userId: userIdToSend
        },
        page
      );
      setTareas(data.content);
      setPaginatedData(data);
      setCurrentPage(page);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTareas();
    }
  }, [token, currentPage]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteTarea(id, token);
      applyFilters(currentPage);
    } catch {
      alert("Error al eliminar tarea");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handlePreviousPage = () => currentPage > 0 && applyFilters(currentPage - 1);
  const handleNextPage = () => paginatedData && !paginatedData.last && applyFilters(currentPage + 1);
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const tareasCompletadas = tareas.filter(t => t.completed).length;
  const tareasPendientes = tareas.filter(t => !t.completed).length;

  // Renderizar solo si ya tenemos el token cargado
  if (!token) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-500 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-8">
        {/* Botones superior */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-2">
            <button onClick={() => router.push("/")} className="btn-secondary">← Volver</button>
            <button onClick={() => setShowTaskModal(true)} className="btn-modern">➕ Nueva Tarea</button>
          </div>
          <button onClick={handleLogout} className="btn-important">Desconectarse</button>
        </div>

        {/* Header */}
        <div className="tareas-header mb-6 text-center">
          <div className="icono-decorativo icono-tarea mx-auto">📝</div>
          <h1 className="tareas-title">Gestor de Tareas</h1>
          <p className="text-foreground">Organiza y gestiona todas tus actividades</p>
        </div>

        {/* Filtros */}
        <form onSubmit={e => { e.preventDefault(); applyFilters(); }} className="mb-6 flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={e => setFilters({...filters, title: e.target.value})}
              className="border rounded p-2"
              placeholder="Buscar por título"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Estado</label>
            <select
              name="completed"
              value={filters.completed}
              onChange={e => setFilters({...filters, completed: e.target.value as ""|"true"|"false"})}
              className="border rounded p-2"
            >
              <option value="">Todos</option>
              <option value="true">Completadas</option>
              <option value="false">Pendientes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha límite antes de</label>
            <input
              type="date"
              name="dueBefore"
              value={filters.dueBefore}
              onChange={e => setFilters({...filters, dueBefore: e.target.value})}
              className="border rounded p-2"
            />
          </div>
          {userRole === "ADMIN" && (
            <div>
              <label className="block text-sm font-medium">Usuario</label>
              <input
                type="number"
                name="userId"
                value={filters.userId}
                onChange={e => setFilters({...filters, userId: e.target.value})}
                className="border rounded p-2"
                placeholder="ID usuario"
              />
            </div>
          )}
          <button type="submit" className="btn-modern">Filtrar</button>
        </form>

        {/* Estadísticas */}
        <div className="estadisticas mb-6">
          {[ 
            { valor: tareas.length, label: "Total Tareas", color: "text-primary" },
            { valor: tareasCompletadas, label: "Completadas", color: "text-success" },
            { valor: tareasPendientes, label: "Pendientes", color: "text-warning" },
            { valor: paginatedData?.totalPages ?? 0, label: "Total Páginas", color: "text-primary-dark" }
          ].map((stat, i) => (
            <div key={i} className="estadistica-card fade-slide-up" style={{ animationDelay: `${0.1 + i*0.1}s` }}>
              <div className={`estadistica-valor ${stat.color}`}>{stat.valor}</div>
              <div className="estadistica-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tareas */}
        <div className="tareas-grid mb-6">
          {tareas.length > 0 ? tareas.map((t, i) => (
            <div key={t.id} className={`tarea-card ${t.completed ? "completada" : "pendiente"} fade-slide-up`} style={{ animationDelay: `${0.1 + i*0.1}s` }}>
              <p><strong>Descripción:</strong> {t.title}</p>
              <p>
                <span className={`estado-badge ${t.completed ? "estado-completada" : "estado-pendiente"}`}>
                  {t.completed ? "✅ Completada" : "⏳ Pendiente"}
                </span>
              </p>
              <p><strong>Vence:</strong> {new Date(t.dueDate).toLocaleDateString()}</p>
              <p><strong>Usuario:</strong> {t.user.name}</p>
              <p><strong>Creada:</strong> {new Date(t.createdAt).toLocaleDateString()}</p>
              <div className="flex justify-end mt-2">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-md shadow-sm text-sm"
                  onClick={() => setConfirmDeleteId(t.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )) : (
            <div className="estadistica-card text-center fade-slide-up">
              <span className="estadistica-label">No hay tareas</span>
            </div>
          )}
        </div>

        {/* Paginación */}
        {paginatedData && paginatedData.totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={handlePreviousPage} disabled={currentPage===0} className="btn-modern">Anterior</button>
            <span className="pagination-text">Página {currentPage+1} de {paginatedData.totalPages}</span>
            <button onClick={handleNextPage} disabled={paginatedData.last} className="btn-modern">Siguiente</button>
          </div>
        )}

      </div>

      {/* Modal para crear tarea */}
      {showTaskModal && (
        <TaskFormModal
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => applyFilters(currentPage)}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {confirmDeleteId !== null && (
        <ConfirmModal
          message="¿Deseas eliminar esta tarea?"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
