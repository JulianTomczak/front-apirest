"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTareas, deleteTarea, filterTareas, patchTarea, updateTarea } from "../lib/api/tareas";
import { Task, PaginatedTasks, TaskUpdateDTO } from "../types/task";
import ConfirmModal from "../components/ConfirmModal";
import TaskFormModal from "../components/TaskFormModal";
import TaskEditModal from "../components/TaskEditModal";

export default function TareasPage() {
  const router = useRouter();

  const [tareas, setTareas] = useState<Task[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
    } catch { }
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
        { title: filters.title || undefined, completed, dueBefore: filters.dueBefore || undefined, userId: userIdToSend },
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
    if (token) loadTareas();
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

  const handleTaskUpdated = (updatedTask: Task) => {
    setTareas(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleMarkCompleted = async (taskId: number) => {
    if (!token) return;
    try {
      const updatedTask = await patchTarea(taskId, { completed: true }, token);
      handleTaskUpdated(updatedTask);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handlePreviousPage = () => currentPage > 0 && applyFilters(currentPage - 1);
  const handleNextPage = () => paginatedData && !paginatedData.last && applyFilters(currentPage + 1);
  const handleLogout = () => { localStorage.removeItem("token"); router.replace("/login"); };

  const tareasCompletadas = tareas.filter(t => t.completed).length;
  const tareasPendientes = tareas.filter(t => !t.completed).length;

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
        <form
          onSubmit={e => { e.preventDefault(); applyFilters(); }}
          className="filtros-container"
        >
          <div className="filtro-group">
            <label className="filtro-label">Título</label>
            <input
              type="text"
              value={filters.title}
              onChange={e => setFilters({ ...filters, title: e.target.value })}
              className="filtro-input"
              placeholder="Buscar por título..."
            />
          </div>

          <div className="filtro-group">
            <label className="filtro-label">Estado</label>
            <select
              value={filters.completed}
              onChange={e => setFilters({ ...filters, completed: e.target.value as "" | "true" | "false" })}
              className="filtro-input"
            >
              <option value="">Todos</option>
              <option value="true">Completadas</option>
              <option value="false">Pendientes</option>
            </select>
          </div>

          <div className="filtro-group">
            <label className="filtro-label">Fecha límite antes de</label>
            <input
              type="date"
              value={filters.dueBefore}
              onChange={e => setFilters({ ...filters, dueBefore: e.target.value })}
              className="filtro-input"
            />
          </div>

          {userRole === "ADMIN" && (
            <div className="filtro-group">
              <label className="filtro-label">ID Usuario</label>
              <input
                type="number"
                value={filters.userId}
                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                className="filtro-input"
                placeholder="Filtrar por usuario..."
              />
            </div>
          )}

          <div className="filtro-group flex flex-col justify-end">
            <button type="submit" className="btn-modern w-full">
              🔍 Filtrar
            </button>
          </div>
        </form>

        {/* Estadísticas */}
        <div className="estadisticas-container">
          <div className="estadistica-card fade-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="estadistica-icono">📊</div>
            <div className="estadistica-valor">{tareas.length}</div>
            <div className="estadistica-label">Total Tareas</div>
            {tareas.length > 0 && (
              <div className="estadistica-tendencia">
                <span>📈</span>
                <span>{((tareasCompletadas / tareas.length) * 100).toFixed(0)}% completado</span>
              </div>
            )}
          </div>

          <div className="estadistica-card estadistica-completadas fade-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="estadistica-icono">✅</div>
            <div className="estadistica-valor">{tareasCompletadas}</div>
            <div className="estadistica-label">Completadas</div>
            {tareas.length > 0 && (
              <div className="estadistica-tendencia">
                <span>🎯</span>
                <span>{Math.round((tareasCompletadas / tareas.length) * 100)}% del total</span>
              </div>
            )}
          </div>

          <div className="estadistica-card estadistica-pendientes fade-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="estadistica-icono">⏳</div>
            <div className="estadistica-valor">{tareasPendientes}</div>
            <div className="estadistica-label">Pendientes</div>
            {tareasPendientes > 0 && (
              <div className="estadistica-tendencia" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                <span>⚠️</span>
                <span>Por completar</span>
              </div>
            )}
          </div>

          <div className="estadistica-card estadistica-paginas fade-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="estadistica-icono">📑</div>
            <div className="estadistica-valor">{paginatedData?.totalPages ?? 0}</div>
            <div className="estadistica-label">Total Páginas</div>
            {paginatedData && (
              <div className="estadistica-tendencia" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <span>📍</span>
                <span>Pág. {currentPage + 1} de {paginatedData.totalPages}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tareas */}
        <div className="tareas-grid mb-6">
          {tareas.length > 0 ? tareas.map((t, i) => (
            <div key={t.id} className={`tarea-card ${t.completed ? "completada" : "pendiente"}`}>
              {/* Header con estado en esquina */}
              <div className="tarea-card-header">
                <div className="tarea-field">
                  <span className="tarea-label">Título</span>
                  <span className="tarea-value title">{t.title}</span>
                </div>
                <div className="tarea-estado-corner">
                  <span className={`estado-badge ${t.completed ? "estado-completada" : "estado-pendiente"}`}>
                    {t.completed ? "✅ Completada" : "⏳ Pendiente"}
                  </span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="tarea-card-content">
                <div className="tarea-field">
                  <span className="tarea-label">Descripción</span>
                  <span className="tarea-value description">{t.description}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="tarea-field">
                    <span className="tarea-label">Vence</span>
                    <span className="tarea-value">
                      📅 {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="tarea-field">
                    <span className="tarea-label">Usuario</span>
                    <span className="tarea-value">
                      👤 {t.user.name}
                    </span>
                  </div>
                </div>

                <div className="tarea-field">
                  <span className="tarea-label">Creada</span>
                  <span className="tarea-value">
                    🗓️ {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="tarea-actions">
                <button
                  className="btn-action btn-editar"
                  onClick={() => setEditingTask(t)}
                >
                  ✏️ Editar
                </button>
                {!t.completed && (
                  <button
                    className="btn-action btn-completar"
                    onClick={() => handleMarkCompleted(t.id)}
                  >
                    ✅ Completar
                  </button>
                )}
                <button
                  className="btn-action btn-eliminar"
                  onClick={() => setConfirmDeleteId(t.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          )) : (
            !loading && (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No hay tareas
                </h3>
                <p className="text-gray-500">
                  {Object.values(filters).some(v => v)
                    ? "Intenta con otros filtros"
                    : "Crea tu primera tarea"
                  }
                </p>
              </div>
            )
          )}
        </div>

        {/* Paginación */}
        {paginatedData && paginatedData.totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={handlePreviousPage} disabled={currentPage === 0} className="btn-modern">Anterior</button>
            <span className="pagination-text">Página {currentPage + 1} de {paginatedData.totalPages}</span>
            <button onClick={handleNextPage} disabled={paginatedData.last} className="btn-modern">Siguiente</button>
          </div>
        )}
      </div>

      {/* Modal para crear tarea */}
      {showTaskModal && <TaskFormModal onClose={() => setShowTaskModal(false)} onSuccess={() => applyFilters(currentPage)} />}

      {/* Modal de edición */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={handleTaskUpdated} // actualiza la tarea localmente
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {confirmDeleteId !== null && <ConfirmModal message="¿Deseas eliminar esta tarea?" onConfirm={() => handleDelete(confirmDeleteId)} onCancel={() => setConfirmDeleteId(null)} />}
    </div>
  );
}
