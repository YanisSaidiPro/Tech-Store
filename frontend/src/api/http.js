const rawBase =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api')
export const API_BASE = rawBase.replace(/\/$/, '')

export function getStoredToken() {
  return localStorage.getItem('techstore_token')
}

export function setStoredToken(token) {
  if (token) localStorage.setItem('techstore_token', token)
  else localStorage.removeItem('techstore_token')
}

export async function request(path, init = {}) {
  const { params, ...rest } = init
  let url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  if (params) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue
      sp.set(k, String(v))
    }
    const q = sp.toString()
    if (q) url += `?${q}`
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(rest.headers || {}),
  }
  const token = getStoredToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, { ...rest, headers })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      (typeof data === 'object' && data && 'message' in data ? String(data.message) : res.statusText)
    throw new Error(msg || `Erreur ${res.status}`)
  }

  return data
}

export function get(path, params) {
  return request(path, { method: 'GET', params })
}

export function post(path, body) {
  return request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
}

export function put(path, body) {
  return request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
}

export function patch(path, body) {
  return request(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined })
}

export function del(path) {
  return request(path, { method: 'DELETE' })
}
