import axios from 'axios'

// In production (GitHub Pages) VITE_API_BASE_URL points to the Render backend.
// In dev the Vite proxy handles /api → localhost:8000.
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 120_000,
})

// Attach JWT from localStorage on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** @deprecated use `client` */
export const apiClient = client
