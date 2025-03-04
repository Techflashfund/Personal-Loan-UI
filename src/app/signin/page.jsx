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
import { useRouter } from 'next/navigation'

export default function LoginPage() {
   const router = useRouter();
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
        router.push('/pending');
        
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,255,0.4)_0%,rgba(0,0,255,0.1)_90%)]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.4)_0%,rgba(59,130,246,0.1)_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4">
        {/* Header with shadow and glass effect */}
        <div className=" pt-6 pb-4 px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Image 
              src="/FlashfundLogo.png"
              alt="FlashFund logo"
              width={180}
              height={110}
              className="w-40"
            />
          </motion.div>
        </div>

        <div className="max-w-md mx-auto pt-12">
          {/* Premium Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-5 mb-8 flex items-center shadow-lg"
          >
            <div className="flex-1">
              <h2 className="text-white font-semibold text-xl leading-tight">Sign in to your premium account</h2>
              <p className="text-white/90 text-sm mt-1">Secure access • Quick login</p>
            </div>
            <div className="w-16 h-16 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <span className="text-3xl">🔐</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Login Title with decorative elements */}
          <div className="flex items-center mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200"></div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-slate-800 px-4"
            >
              Sign In
            </motion.h1>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200"></div>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden relative">
              {/* Decorative accent */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardContent className="p-8">
                {errors.server && (
                  <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
                    <AlertDescription>{errors.server}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        required
                        className={`h-12 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-400 rounded-xl px-4 ${
                          errors.email ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        required
                        className={`h-12 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-400 rounded-xl px-4 ${
                          errors.password ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Link href="/reset" className="text-sm text-blue-600 hover:text-blue-700 transition duration-200">
                      Forgot password?
                    </Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-lg font-medium rounded-xl shadow-lg relative overflow-hidden group"
                    disabled={loading}
                  >
                    <div className="absolute inset-0 w-full h-full bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Sign In
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-slate-600 text-sm">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-blue-600 font-medium hover:text-blue-700 transition duration-200">
                      Create Account
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ONDC Attribution with premium styling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center mt-10"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <p className="text-sm text-slate-600 flex items-center justify-center">
                          Powered by <Image 
                          src="/ondc-network-vertical.png"
                          alt="FlashFund logo"
                          width={100}  // Increased from 140
                          height={60} // Increased from 85
                          className="w-35"  // Increased from w-36
                        />
                        </p>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Open Network for Digital Commerce
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}