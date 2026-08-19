const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface RegisterData {
  fullName: string;
  username: string;
  mobile: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}
export async function checkFieldExists(field: "username" | "email", value: string): Promise<{ exists: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/validate-exists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, value }),
  });
  if (!res.ok) return { exists: false, message: "" };
  return res.json();
}
