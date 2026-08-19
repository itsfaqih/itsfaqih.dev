export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  revenue: number;
};

export const sampleUsers: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "active",
    revenue: 12500,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Editor",
    status: "active",
    revenue: 8750,
  },
  {
    id: 3,
    name: "Carol Williams",
    email: "carol@example.com",
    role: "Viewer",
    status: "inactive",
    revenue: 340,
  },
  {
    id: 4,
    name: "David Brown",
    email: "david@example.com",
    role: "Editor",
    status: "active",
    revenue: 95200,
  },
];

export type TableState = "loading" | "empty" | "error" | "data" | "searching";
