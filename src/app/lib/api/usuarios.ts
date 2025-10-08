const API_URL = "http://localhost:8080";

export async function getUsuarios(page = 0, size = 10, token?: string) {
  const res = await fetch(`${API_URL}/usuarios?page=${page}&size=${size}`, {
    headers: {
      "Authorization": `Bearer ${token ?? localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    throw new Error("Error al obtener usuarios");
  }
  return res.json();
}

export async function deleteUsuario(id: number, token: string) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Error al eliminar usuario");
  }
  return res.text();
}

export async function createUsuario(user: { name: string; password: string; mail: string }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Error al crear usuario`);
  }

  return res.json();
}

export async function updateUsuario(
  id: number,
  user: { name: string; password: string; mail: string; role: string },
  token?: string
) {
  const t = token ?? localStorage.getItem("token");
  if (!t) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Error al actualizar usuario con id ${id}`);
  }

  return res.json();
}