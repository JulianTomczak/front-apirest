export interface User {
  id: number;
  name: string;
  mail: string;
}

export interface PaginatedUsers {
  content: User[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UserRequestDTO {
  name: string;
  password: string;
  mail: string;
  role: "USER" | "ADMIN";
}
