"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getTareas, deleteTarea, filterTareas, patchTarea } from "../lib/api/tareas";
import { Task, PaginatedTasks } from "../types/task";
import ConfirmModal from "../components/ConfirmModal";
import TaskFormModal from "../components/TaskFormModal";
import TaskEditModal from "../components/TaskEditModal";
import PageHeader from "../components/PageHeader";
import AppTopBar from "../components/AppTopBar";
import KpiRow from "../components/KpiRow";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../lib/hooks/useAuth";

export default function TareasPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const userRole = user?.role ?? "USER";
  const userIdFromToken = user?.id ?? 0;

  const [tareas, setTareas] = useState<Task[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    title: "",
    completed: "" as "" | "true" | "false",
    dueBefore: "",
    userId: "",
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = async (page: number, size: number, useFilters: boolean) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      let data: PaginatedTasks;
      if (useFilters) {
        const completed = filters.completed === "" ? undefined : filters.completed === "true";
        const userIdToSend =
          userRole === "ADMIN" ? (filters.userId ? Number(filters.userId) : undefined) : userIdFromToken;
        data = await filterTareas(
          {
            title: filters.title || undefined,
            completed,
            dueBefore: filters.dueBefore || undefined,
            userId: userIdToSend,
          },
          page,
          size
        );
      } else {
        data = await getTareas(page, size);
      }
      setTareas(data.content);
      setPaginatedData(data);
      setCurrentPage(data.number);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPage(currentPage, pageSize, filtersApplied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const applyFilters = (page: number = 0) => {
    setFiltersApplied(true);
    fetchPage(page, pageSize, true);
  };

  const clearFilters = () => {
    setFilters({ title: "", completed: "", dueBefore: "", userId: "" });
    setFiltersApplied(false);
    setShowMoreFilters(false);
    fetchPage(0, pageSize, false);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteTarea(id, token);
      applyFilters(currentPage);
    } catch {
      setError("Error al eliminar tarea");
    } finally {
      setConfirmDeleteId(null);
      setOpenMenuId(null);
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTareas(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleMarkCompleted = async (taskId: number) => {
    if (!token) return;
    try {
      const updatedTask = await patchTarea(taskId, { completed: true }, token);
      handleTaskUpdated(updatedTask);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOpenMenuId(null);
    }
  };

  const goToPage = (page: number) => fetchPage(page, pageSize, filtersApplied);
  const handlePageSize = (size: number) => {
    setPageSize(size);
    fetchPage(0, size, filtersApplied);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    if (openMenuId === null) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const hasActiveFilters = filtersApplied || Object.values(filters).some(v => v);
  const tareasCompletadas = tareas.filter(t => t.completed).length;
  const tareasPendientes = tareas.filter(t => !t.completed).length;
  const total = paginatedData?.totalElements ?? tareas.length;
  const totalPages = paginatedData?.totalPages ?? 0;
  const progreso = tareas.length > 0 ? Math.round((tareasCompletadas / tareas.length) * 100) : 0;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-r from-purple-400 to-indigo-500 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-5 sm:p-7">
        <AppTopBar onBack={() => router.push("/")} onLogout={handleLogout} />

        <PageHeader
          title="Gestor de Tareas"
          subtitle="Organiza y gestiona tus actividades"
          icon="📝"
          primaryAction={
            <button onClick={() => setShowTaskModal(true)} className="btn-apply" aria-label="Crear nueva tarea">
              ＋ Nueva tarea
            </button>
          }
        />

        {/* Filtros compactos */}
        <form
          className="filter-bar"
          onSubmit={e => {
            e.preventDefault();
            applyFilters();
          }}
        >
          <div className="filter-field filter-field--search">
            <label className="filter-label" htmlFor="f-titulo">
              Buscar
            </label>
            <input
              id="f-titulo"
              type="text"
              value={filters.title}
              onChange={e => setFilters({ ...filters, title: e.target.value })}
              className="filter-input"
              placeholder="Buscar por título..."
            />
          </div>

          <div className="filter-field">
            <label className="filter-label" htmlFor="f-estado">
              Estado
            </label>
            <select
              id="f-estado"
              value={filters.completed}
              onChange={e => setFilters({ ...filters, completed: e.target.value as "" | "true" | "false" })}
              className="filter-input"
            >
              <option value="">Todos</option>
              <option value="true">Completadas</option>
              <option value="false">Pendientes</option>
            </select>
          </div>

          <div className="filter-field">
            <label className="filter-label" htmlFor="f-fecha">
              Vence antes de
            </label>
            <input
              id="f-fecha"
              type="date"
              value={filters.dueBefore}
              onChange={e => setFilters({ ...filters, dueBefore: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-bar-actions">
            <button type="submit" className="btn-apply" disabled={loading}>
              {loading ? "Cargando…" : "Aplicar"}
            </button>
            <button
              type="button"
              className="btn-more-filters"
              onClick={() => setShowMoreFilters(v => !v)}
              aria-expanded={showMoreFilters}
            >
              Más filtros {showMoreFilters ? "▴" : "▾"}
            </button>
            <button type="button" className="btn-clear" onClick={clearFilters} aria-label="Limpiar filtros">
              Limpiar
            </button>
          </div>

          {showMoreFilters && userRole === "ADMIN" && (
            <div className="more-filters-panel">
              <div className="filter-field">
                <label className="filter-label" htmlFor="f-usuario">
                  ID Usuario
                </label>
                <input
                  id="f-usuario"
                  type="number"
                  value={filters.userId}
                  onChange={e => setFilters({ ...filters, userId: e.target.value })}
                  className="filter-input"
                  placeholder="Filtrar por usuario..."
                />
              </div>
            </div>
          )}
        </form>

        {/* KPIs compactos */}
        {!loading && (
          <KpiRow
            items={[
              { value: total, label: "Total tareas", hint: "en total", tone: "primary" },
              { value: tareasPendientes, label: "Pendientes", hint: "esta página", tone: "warning" },
              { value: tareasCompletadas, label: "Completadas", hint: "esta página", tone: "success" },
              { value: `${progreso}%`, label: "Progreso", hint: "de esta página" },
            ]}
          />
        )}

        {/* Lista de tareas */}
        {!loading && (
          <div className="section-heading">
            <h2 className="section-title">
              Tareas <span className="section-count">({tareas.length})</span>
            </h2>
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        {loading ? (
          <div className="page-loader">
            <div className="spinner" aria-hidden="true" />
            <p>Cargando…</p>
          </div>
        ) : tareas.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "Sin resultados" : "No hay tareas"}
            text={
              hasActiveFilters
                ? "No encontramos tareas que coincidan con los filtros actuales."
                : "Crea tu primera tarea para empezar a organizar tu trabajo."
            }
            action={
              hasActiveFilters ? (
                <button className="btn-clear" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="tasks-list animate-fade-slide-up">
            {tareas.map(t => (
              <article
                key={t.id}
                className={`task-item ${t.completed ? "task-item--completed" : "task-item--pending"}`}
              >
                <span
                  className={`task-status-dot ${t.completed ? "task-status-dot--completed" : "task-status-dot--pending"}`}
                  aria-label={t.completed ? "Tarea completada" : "Tarea pendiente"}
                >
                  {t.completed ? "✓" : ""}
                </span>

                <div className="task-item-body">
                  <p className="task-item-title">{t.title}</p>
                  {t.description && <p className="task-item-description">{t.description}</p>}
                  <div className="task-item-meta">
                    <span>📅 {new Date(t.dueDate).toLocaleDateString()}</span>
                    <span>👤 {t.user.name}</span>
                    <span className={`estado-badge ${t.completed ? "estado-completada" : "estado-pendiente"}`}>
                      {t.completed ? "Completada" : "Pendiente"}
                    </span>
                  </div>
                </div>

                <div className="task-item-actions">
                  <button
                    className="task-menu-btn"
                    onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                    aria-label="Acciones de la tarea"
                    aria-expanded={openMenuId === t.id}
                    aria-haspopup="menu"
                  >
                    ⋮
                  </button>
                  {openMenuId === t.id && (
                    <div className="task-menu" role="menu" ref={menuRef}>
                      <button
                        className="menu-item"
                        role="menuitem"
                        onClick={() => {
                          setEditingTask(t);
                          setOpenMenuId(null);
                        }}
                      >
                        ✏️ Editar
                      </button>
                      {!t.completed && (
                        <button className="menu-item" role="menuitem" onClick={() => handleMarkCompleted(t.id)}>
                          ✅ Completar
                        </button>
                      )}
                      <button
                        className="menu-item menu-item--danger"
                        role="menuitem"
                        onClick={() => setConfirmDeleteId(t.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && tareas.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSize}
            showPageSize
            pageSizeLabel="Tareas por página"
          />
        )}
      </div>

      {showTaskModal && (
        <TaskFormModal onClose={() => setShowTaskModal(false)} onSuccess={() => applyFilters(currentPage)} />
      )}
      {editingTask && (
        <TaskEditModal task={editingTask} onClose={() => setEditingTask(null)} onSuccess={handleTaskUpdated} />
      )}
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
