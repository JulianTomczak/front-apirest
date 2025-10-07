export interface User {
  id: number;
  name: string;
  mail: string;
}

export interface PaginatedUsers {
  content: UserResponseDTO[];
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

export interface UserResponseDTO {
  id: number;
  name: string;
  mail: string;
  role: "USER" | "ADMIN";
}