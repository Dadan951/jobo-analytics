import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.getProfile()
        .then(data => {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        })
        .catch(() => {
          // getProfile() peut échouer pour deux raisons distinctes :
          // - Token invalide/expiré → api.js gère déjà le 401 avec window.location.href='/login'
          // - Erreur backend temporaire (500, réseau) → on garde le user en cache plutôt que
          //   de déconnecter l'utilisateur pour une panne passagère
          const cached = localStorage.getItem('user')
          if (cached) {
            try { setUser(JSON.parse(cached)) } catch {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          } else {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    // Le backend retourne { requiresTwoFA: true, userId } — pas encore de token
    const data = await api.login({ email, password })
    return data
  }

  const verifyTwoFA = async (userId, code) => {
    const data = await api.verifyTwoFA({ userId, code })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (email, password, orgId, firstName, lastName, organizationName) => {
    const data = await api.register({ email, password, organizationName })
    return data
  }

  const logout = async () => {
    try { await api.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const refreshUser = async () => {
    const data = await api.getProfile()
    setUser(data.user)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyTwoFA, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
