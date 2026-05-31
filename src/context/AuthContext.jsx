import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [modoMensal, setModoMensal] = useState(
    localStorage.getItem('modoMensal') === 'true'
  )

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('modoMensal', data.modoMensal)
    setToken(data.token)
    setModoMensal(data.modoMensal)
  }

  const register = async (name, email, password) => {
    await api.post('/api/auth/register', { name, email, password })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('modoMensal')
    setToken(null)
    setModoMensal(false)
  }

  const toggleModoMensal = async () => {
    const novo = !modoMensal
    await api.put('/api/auth/modoMensal', { modoMensal: novo })
    localStorage.setItem('modoMensal', novo)
    setModoMensal(novo)
  }

  return (
    <AuthContext.Provider value={{ token, login, register, logout, modoMensal, toggleModoMensal }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
