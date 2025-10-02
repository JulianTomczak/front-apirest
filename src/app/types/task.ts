import { User } from "./user";

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    mail: string;
  };
}

export interface PaginatedTasks {
  content: Task[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface TaskRequestDTO {
  title: string;
  description: string;
  dueDate: string; // ISO date string
}

export interface TaskResponseDTO {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    createdAt: string;
    user: User;
}

export interface TaskUpdateDTO {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string; // ISO date string
}