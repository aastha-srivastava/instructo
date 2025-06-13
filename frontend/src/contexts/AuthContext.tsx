import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../lib/api'
import { User, AuthContextType } from '../types'
import { toast } from '../hooks/use-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<'admin' | 'instructor' | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on app start
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('role')

    if (storedToken && storedUser && storedRole) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setRole(storedRole as 'admin' | 'instructor')
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'admin' | 'instructor') => {
    try {
      // Basic validation
      if (!email || !password || !role) {
        throw new Error('All fields are required')
      }
      
      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address')
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      const response = await authAPI.login({ email, password, role })
      const { token, user, role: userRole } = response.data.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', userRole)      // Update state
      setToken(token)
      setUser(user)
      setRole(userRole)

      toast({
        title: "Success",
        description: "Login successful",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }
  const sendOTP = async (email: string, role: 'admin' | 'instructor') => {
    try {
      await authAPI.sendOTP({ email, role })
      toast({
        title: "Success",
        description: "OTP sent to your email",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP'
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const loginWithOTP = async (email: string, otp: string, role: 'admin' | 'instructor') => {
    try {
      const response = await authAPI.verifyOTP({ email, otp, role })
      const { token, user, role: userRole } = response.data.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', userRole)      // Update state
      setToken(token)
      setUser(user)
      setRole(userRole)

      toast({
        title: "Success",
        description: "Login successful",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'OTP verification failed'
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async (showConfirmation = true) => {
    if (showConfirmation) {
      const confirmed = window.confirm('Are you sure you want to logout?')
      if (!confirmed) return
    }

    try {
      await authAPI.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')

      // Clear state
      setToken(null)
      setUser(null)
      setRole(null)

      toast({
        title: "Success",
        description: "Logged out successfully",
      })
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    role,
    token,
    isLoading,
    login,
    loginWithOTP,
    sendOTP,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
