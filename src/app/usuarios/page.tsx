"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsuarios, deleteUsuario } from "../lib/api/usuarios";
import { UserResponseDTO, PaginatedUsers } from "../types/user";
import UserFormModal from "../components/UserFormModal";
import UserEditModal from "../components/UserEditModal";
import ConfirmModal from "../components/ConfirmModal";
import PageHeader from "../components/PageHeader";
import AppTopBar from "../components/AppTopBar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../lib/hooks/useAuth";

export default function UsuariosPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [usuarios, setUsuarios] = useState<UserResponseDTO[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedUsers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<UserResponseDTO | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Cargar usuarios
  const fetchPage = async (page: number, size: number) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedUsers = await getUsuarios(page, size, token);
      const usuariosConRole: UserResponseDTO[] = data.content.map(u => ({
        ...u,
        role: u.role ?? "USER",
      }));
      setUsuarios(usuariosConRole);
      setPaginatedData(data);
      setCurrentPage(data.number);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPage(0, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const goToPage = (page: number) => fetchPage(page, pageSize);
  const handlePageSize = (size: number) => {
    setPageSize(size);
    fetchPage(0, size);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteUsuario(id, token);
      fetchPage(currentPage, pageSize);
    } catch {
      setError("Error al eliminar usuario");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const totalPages = paginatedData?.totalPages ?? 0;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-r from-purple-400 to-indigo-500 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-5 sm:p-7">
        <AppTopBar onBack={() => router.push("/")} onLogout={handleLogout} />

        <PageHeader
          title="Gestor de Usuarios"
          subtitle="Administra todos los usuarios registrados"
          icon="👥"
          primaryAction={
            <button onClick={() => setShowUserModal(true)} className="btn-apply" aria-label="Crear nuevo usuario">
              ＋ Nuevo usuario
            </button>
          }
        />

        {!loading && (
          <div className="section-heading">
            <h2 className="section-title">
              Usuarios <span className="section-count">({usuarios.length})</span>
            </h2>
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        {loading ? (
          <div className="page-loader">
            <div className="spinner" aria-hidden="true" />
            <p>Cargando…</p>
          </div>
        ) : usuarios.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No hay usuarios registrados"
            text="Comienza agregando el primer usuario al sistema."
            action={
              <button onClick={() => setShowUserModal(true)} className="btn-apply">
                ＋ Crear primer usuario
              </button>
            }
          />
        ) : (
          <div className="cards-grid mb-6 animate-fade-slide-up">
            {usuarios.map(u => (
              <div key={u.id} className="data-card">
                <div className="data-card-header">
                  <span className="data-id">#{u.id}</span>
                  <span className={`role-badge ${u.role === "ADMIN" ? "role-badge--admin" : "role-badge--user"}`}>
                    {u.role === "ADMIN" ? "Administrador" : "Usuario"}
                  </span>
                </div>

                <div className="data-field">
                  <span className="data-label">Nombre</span>
                  <span className="data-value data-value--title">{u.name}</span>
                </div>

                <div className="data-field">
                  <span className="data-label">Email</span>
                  <span className="data-value">📧 {u.mail}</span>
                </div>

                <div className="data-card-actions">
                  <button className="btn-action btn-editar" onClick={() => setEditUser(u)}>
                    ✏️ Editar
                  </button>
                  <button className="btn-action btn-eliminar" onClick={() => setConfirmDeleteId(u.id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && usuarios.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSize}
            showPageSize
            pageSizeLabel="Usuarios por página"
          />
        )}
      </div>

      {showUserModal && <UserFormModal onSuccess={() => fetchPage(currentPage, pageSize)} onClose={() => setShowUserModal(false)} />}
      {editUser && (
        <UserEditModal user={editUser} onSuccess={() => fetchPage(currentPage, pageSize)} onClose={() => setEditUser(null)} />
      )}
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
