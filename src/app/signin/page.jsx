'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useAuthStore from '@/store/user'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    server: ''
  })
  const [formTouched, setFormTouched] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)

  // Reset server error when form inputs change
  useEffect(() => {
    if (formTouched) {
      setErrors(prev => ({ ...prev, server: '' }))
    }
  }, [email, password, formTouched])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const validateForm = () => {
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    setErrors({
      email: emailError,
      password: passwordError,
      server: ''
    })

    return !emailError && !passwordError
  }

  const handleInputChange = (field, value) => {
    if (!formTouched) setFormTouched(true)
    
    if (field === 'email') {
      setEmail(value)
      setErrors(prev => ({ ...prev, email: '' }))
    } else if (field === 'password') {
      setPassword(value)
      setErrors(prev => ({ ...prev, password: '' }))
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) return
    
    setLoading(true)

    try {
      const res = await fetch('https://pl.pr.flashfund.in/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setAuth(data.token, data.userId)
        toast.success('Success', {
          description: 'Logged in successfully'
        })
        window.location.href = '/form'
      } else {
        // Handle different error types based on status code or response
        if (res.status === 401) {
          setErrors(prev => ({ ...prev, server: 'Invalid email or password' }))
        } else if (res.status === 429) {
          setErrors(prev => ({ ...prev, server: 'Too many attempts. Please try again later' }))
        } else {
          setErrors(prev => ({ ...prev, server: data.message || 'Login failed. Please try again' }))
        }
      }
    } catch (error) {
      // Handle network errors
      setErrors(prev => ({ 
        ...prev, 
        server: 'Network error. Please check your connection and try again'
      }))
      
      toast.error('Connection Error', {
        description: 'Unable to connect to the server'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBlur = (field) => {
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }))
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [45, 0, 45]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4">
        {/* Header Logo */}
        <div className="flex justify-center pt-8">
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={180}
            height={110}
            className="w-44"
          />
        </div>

        <div className="max-w-md mx-auto pt-16">
          {/* Login Card */}
          <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-2xl font-bold text-slate-800 mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Welcome Back
                </motion.h1>
                <motion.p 
                  className="text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Access your premium financial services
                </motion.p>
              </div>

              {errors.server && (
                <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
                  <AlertDescription>{errors.server}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    required
                    className={`h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4 ${
                      errors.email ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    required
                    className={`h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4 ${
                      errors.password ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium rounded-lg shadow-lg transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-600 text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-blue-600 font-medium hover:text-blue-700">
                    Create Account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ONDC Attribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-8"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <p className="text-sm text-slate-600">
                Powered by <span className="font-semibold text-blue-600">ONDC</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}