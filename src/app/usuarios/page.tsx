"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsuarios, deleteUsuario } from "../lib/api/usuarios";
import { UserResponseDTO, PaginatedUsers } from "../types/user";
import UserFormModal from "../components/UserFormModal";
import UserEditModal from "../components/UserEditModal";
import ConfirmModal from "../components/ConfirmModal";

export default function UsuariosPage() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<UserResponseDTO[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedUsers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<UserResponseDTO | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  //  Cargar token solo en cliente
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);
  }, [router]);

  // Cargar usuarios
  const loadUsuarios = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data: PaginatedUsers = await getUsuarios(currentPage, 10, token);
      const usuariosConRole: UserResponseDTO[] = data.content.map(u => ({
        ...u,
        role: u.role ?? "USER",
      }));
      setUsuarios(usuariosConRole);
      setPaginatedData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUsuarios();
  }, [currentPage, token]);

  const handlePreviousPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    paginatedData && !paginatedData.last && setCurrentPage(currentPage + 1);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteUsuario(id, token);
      loadUsuarios();
    } catch {
      alert("Error al eliminar usuario");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-indigo-500 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-8">
        {/* Botones superior */}
        <div className="flex justify-between mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
          <div className="flex gap-2 justify-center sm:justify-start">
            <button onClick={() => router.push("/")} className="btn-secondary">
              ← Volver
            </button>
            <button onClick={() => setShowUserModal(true)} className="btn-modern">
              ➕ Nuevo Usuario
            </button>
          </div>
          <button onClick={handleLogout} className="btn-important">
            Desconectarse
          </button>
        </div>

        {/* Header */}
        <div className="tareas-header mb-6 text-center">
          <div className="icono-decorativo icono-tarea mx-auto">👥</div>
          <h1 className="tareas-title">Gestor de Usuarios</h1>
          <p className="text-foreground">Administra todos los usuarios registrados</p>
        </div>

        {/* Usuarios */}
        <div className="tareas-grid mb-6">
          {usuarios.length > 0 ? (
            usuarios.map((u, i) => (
              <div
                key={u.id}
                className="tarea-card pendiente fade-slide-up"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="tarea-card-header">
                  <div className="tarea-field">
                    <span className="tarea-label">Usuario ID</span>
                    <span className="tarea-value title">#{u.id}</span>
                  </div>
                </div>

                <div className="tarea-card-content">
                  <div className="tarea-field">
                    <span className="tarea-label">Nombre</span>
                    <span className="tarea-value description">{u.name}</span>
                  </div>
                  <div className="tarea-field">
                    <span className="tarea-label">Email</span>
                    <span className="tarea-value">📧 {u.mail}</span>
                  </div>
                  <div className="tarea-field">
                    <span className="tarea-label">Rol</span>
                    <span className="tarea-value">{u.role === "ADMIN" ? "Administrador" : "Usuario"}</span>
                  </div>
                </div>

                <div className="tarea-actions flex gap-2">
                  <button
                    className="btn-action btn-editar"
                    onClick={() => setEditUser(u)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-action btn-eliminar"
                    onClick={() => setConfirmDeleteId(u.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No hay usuarios registrados
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza agregando el primer usuario al sistema
                </p>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="btn-modern"
                >
                  ➕ Crear Primer Usuario
                </button>
              </div>
            )
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="loading-pulse mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        )}

        {/* Paginación */}
        {paginatedData && paginatedData.totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="btn-modern"
            >
              ← Anterior
            </button>
            <span className="pagination-text">
              Página {currentPage + 1} de {paginatedData.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={paginatedData.last}
              className="btn-modern"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal para crear usuario */}
      {showUserModal && (
        <UserFormModal
          onSuccess={loadUsuarios}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {/* Modal para editar usuario */}
      {editUser && (
        <UserEditModal
          user={editUser}
          onSuccess={loadUsuarios}
          onClose={() => setEditUser(null)}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {confirmDeleteId !== null && (
        <ConfirmModal
          message="¿Deseas eliminar este usuario?"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
