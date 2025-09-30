"use client";

import { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../lib/api/usuarios";
import { User, PaginatedUsers } from "../types/user";
import { useRouter } from "next/navigation";
import UserFormModal from "../components/UserFormModal";
import ConfirmModal from "../components/ConfirmModal";

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedUsers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data: PaginatedUsers = await getUsuarios(currentPage);
      setUsuarios(data.content);
      setPaginatedData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    loadUsuarios();
  }, [currentPage, router]);

  const handlePreviousPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => paginatedData && !paginatedData.last && setCurrentPage(currentPage + 1);
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
        <div className="flex justify-between mb-6">
          <div className="flex gap-2">
            <button onClick={() => router.push("/")} className="btn-secondary">← Volver</button>
            <button onClick={() => setShowUserModal(true)} className="btn-modern">➕ Nuevo Usuario</button>
          </div>
          <button onClick={handleLogout} className="btn-important">Desconectarse</button>
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
              <div key={u.id} className="tarea-card pendiente fade-slide-up relative" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <p><strong>ID:</strong> {u.id}</p>
                <p><strong>Nombre:</strong> {u.name}</p>
                <p><strong>Email:</strong> {u.mail}</p>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setConfirmDeleteId(u.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-md shadow-sm text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="estadistica-card text-center fade-slide-up">
              <span className="estadistica-label">No hay usuarios</span>
            </div>
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

      {/* Modal para crear usuario */}
      {showUserModal && <UserFormModal onSuccess={loadUsuarios} onClose={() => setShowUserModal(false)} />}

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
