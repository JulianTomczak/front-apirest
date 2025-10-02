import { PaginatedTasks, TaskRequestDTO, TaskResponseDTO, TaskUpdateDTO } from "../../types/task";

const API_URL = "http://localhost:8080";

export async function getTareas(page: number = 0, size: number = 10): Promise<PaginatedTasks> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/tareas?page=${page}&size=${size}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function createTarea(task: TaskRequestDTO, userId?: number): Promise<TaskResponseDTO> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");

  // si no hay userId, enviamos "me" para que el backend use el ID del token
  const userPath = userId ? userId : "me";

  const res = await fetch(`${API_URL}/tareas/usuario/${userPath}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Error al crear tarea");
  }

  return res.json();
}

export async function deleteTarea(id: number, token?: string) {
  const t = token ?? localStorage.getItem("token");
  if (!t) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/tareas/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${t}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al eliminar tarea");
  }

  return res.text();
}

export async function filterTareas(
  filters: { title?: string; completed?: boolean; dueBefore?: string; userId?: number },
  page: number = 0,
  size: number = 10
): Promise<PaginatedTasks> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");

  const params = new URLSearchParams();
  if (filters.title) params.append("title", filters.title);
  if (filters.completed !== undefined) params.append("completed", String(filters.completed));
  if (filters.dueBefore) params.append("dueBefore", filters.dueBefore);
  if (filters.userId) params.append("userId", String(filters.userId));
  params.append("page", String(page));
  params.append("size", String(size));

  const res = await fetch(`${API_URL}/tareas/filtrar?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function updateTarea(id: number, task: TaskUpdateDTO, token?: string): Promise<TaskResponseDTO> {
  const t = token ?? localStorage.getItem("token");
  if (!t) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/tareas/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Error al actualizar tarea con id ${id}`);
  }

  return res.json();
}

export async function patchTarea(id: number, task: TaskUpdateDTO, token?: string): Promise<TaskResponseDTO> {
  const t = token ?? localStorage.getItem("token");
  if (!t) throw new Error("No autenticado");

  const res = await fetch(`${API_URL}/tareas/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Error al actualizar parcialmente tarea con id ${id}`);
  }

  return res.json();
}