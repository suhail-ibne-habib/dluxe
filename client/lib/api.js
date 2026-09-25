import axios from "axios";

const origin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

export const API_BASE_URL = `${origin}/api`;
const SESSION_KEY = "dluxe_session";

export const api = axios.create({
  baseURL: origin,
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(SESSION_KEY) || "";
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function fetchWithTimeout(input, init = {}, ms = 8000) {
  const timeout = AbortSignal.timeout(ms);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
}

export function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${path.startsWith("/") ? path : `/${path}`}`;
  let data = options.data;
  if (options.body != null && data == null) {
    data = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
  }
  return api.request({
    url,
    method: options.method || "GET",
    data,
    headers: options.headers,
    timeout: 8000,
  }).then((response) => ({
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: async () => response.data,
  })).catch((error) => {
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        json: async () => error.response.data,
      };
    }
    throw error;
  });
}

export async function fetchAPI(endpoint, options = {}) {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await apiFetch(`/api${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `HTTP error! status: ${response.status}`);
  }
  return data;
}
