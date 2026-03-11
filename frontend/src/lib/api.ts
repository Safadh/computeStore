import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  withCredentials: false,
});

const TOKEN_KEY = "cs_token";
const AUTH_EVENT = "cs_auth_changed";

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function onAuthChanged(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
}

export type VMOffer = {
  id: number;
  name: string;
  description?: string;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  base_price_per_hour: number;
  os_options: Record<string, unknown>;
};

export type CartItem = {
  id: number;
  offer_id?: number | null;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  os: string;
  quantity: number;
  hourly_price: number;
};

export type VMInstance = {
  id: number;
  name: string;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  os: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("email", email);
  body.append("password", password);
  const { data } = await api.post<{ access_token: string }>("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  setToken(data.access_token);
}

export async function register(payload: {
  email: string;
  full_name: string;
  password: string;
}) {
  await api.post("/auth/register", payload);
}

export async function fetchOffers() {
  const { data } = await api.get<VMOffer[]>("/offers");
  return data;
}

export async function fetchCart() {
  const { data } = await api.get<{ items: CartItem[]; total_hourly_price: number }>(
    "/cart",
  );
  return data;
}

export async function addCartItem(payload: {
  offer_id?: number;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  os: string;
  quantity?: number;
}) {
  const { data } = await api.post("/cart/items", payload);
  return data as CartItem;
}

export async function removeCartItem(id: number) {
  await api.delete(`/cart/items/${id}`);
}

export async function checkout(payload: {
  card_number: string;
  card_exp_month: number;
  card_exp_year: number;
  card_cvc: string;
}) {
  const { data } = await api.post<{
    order_id: number;
    total_hourly_price: number;
    status: string;
  }>("/checkout", payload);
  return data;
}

export async function fetchVMs() {
  const { data } = await api.get<VMInstance[]>("/vms");
  return data;
}

export async function fetchVMConsole(id: number) {
  const { data } = await api.get<{ content: string; timestamp: string }[]>(
    `/vms/${id}/console`,
  );
  return data;
}

export async function fetchVMetrics(id: number) {
  const { data } = await api.get<
    { timestamp: string; cpu_usage: number; memory_usage: number }[]
  >(`/vms/${id}/metrics`);
  return data;
}

