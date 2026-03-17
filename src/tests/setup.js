import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock import.meta.env for supabase.js
Object.defineProperty(global, 'import', {
  value: { meta: { env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' } } },
  writable: true,
})
