import axios from 'axios'

export const client = axios.create({
  baseURL: '/api',
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
