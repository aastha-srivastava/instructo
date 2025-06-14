import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { authAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Sun, Moon, Mail, Lock, Key } from 'lucide-react'

function LoginPage() {
  const [step, setStep] = useState('email') // 'email', 'auth-method', 'password', 'otp'
  const [userType, setUserType] = useState('admin') // 'admin', 'instructor'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [authMethod, setAuthMethod] = useState('') // 'password', 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email')
      return
    }
    
    setError('')
    setStep('auth-method')
  }

  const handleAuthMethodSelect = (method) => {
    setAuthMethod(method)
    if (method === 'password') {
      setStep('password')
    } else {
      handleSendOTP()
    }
  }

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      await authAPI.sendOTP(email)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(email, password)
      const { token, user } = response.data
      
      if (user.role !== userType) {
        setError(`Invalid credentials for ${userType} login`)
        return
      }

      login(token, user)
      navigate(user.role === 'admin' ? '/admin' : '/instructor')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async (e) => {
    e.preventDefault()
    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.verifyOTP(email, otp)
      const { token, user } = response.data
      
      if (user.role !== userType) {
        setError(`Invalid credentials for ${userType} login`)
        return
      }

      login(token, user)
      navigate(user.role === 'admin' ? '/admin' : '/instructor')
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep('email')
    setEmail('')
    setPassword('')
    setOtp('')
    setAuthMethod('')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-lg">I</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Instructo</CardTitle>
          <CardDescription>
            Comprehensive Trainee Management System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={userType === 'admin' ? 'default' : 'outline'}
              onClick={() => setUserType('admin')}
              className="w-full"
            >
              Admin
            </Button>
            <Button
              variant={userType === 'instructor' ? 'default' : 'outline'}
              onClick={() => setUserType('instructor')}
              className="w-full"
            >
              Instructor
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          )}

          {/* Auth Method Selection */}
          {step === 'auth-method' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Choose your authentication method for {email}
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleAuthMethodSelect('password')}
                  className="w-full justify-start"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Enter Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAuthMethodSelect('otp')}
                  className="w-full justify-start"
                  disabled={loading}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Send OTP to Email
                </Button>
              </div>
              <Button variant="ghost" onClick={resetFlow} className="w-full">
                Back
              </Button>
            </div>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button variant="ghost" onClick={() => setStep('auth-method')} className="w-full">
                Back
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleOTPLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter OTP</label>
                <div className="text-sm text-muted-foreground">
                  Check your email for the verification code
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={handleSendOTP}
                  className="flex-1"
                  disabled={loading}
                >
                  Resend OTP
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep('auth-method')}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
