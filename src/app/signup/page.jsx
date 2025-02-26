'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [formTouched, setFormTouched] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
    server: ''
  })
  const [resendCooldown, setResendCooldown] = useState(0)

  // Handle resend OTP cooldown timer
  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Reset server error when form inputs change
  useEffect(() => {
    if (formTouched) {
      setErrors(prev => ({ ...prev, server: '' }))
    }
  }, [email, phone, password, otp, formTouched])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/
    if (!phone) return 'Phone number is required'
    if (!phoneRegex.test(phone)) return 'Please enter a valid 10-digit phone number'
    return ''
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return 'Password must include uppercase, lowercase, and number'
    }
    return ''
  }

  const validateOtp = (otp) => {
    const otpRegex = /^\d{6}$/
    if (!otp) return 'OTP is required'
    if (!otpRegex.test(otp)) return 'OTP must be 6 digits'
    return ''
  }

  const validateSignupForm = () => {
    const emailError = validateEmail(email)
    const phoneError = validatePhone(phone)
    const passwordError = validatePassword(password)
    
    setErrors({
      ...errors,
      email: emailError,
      phone: phoneError,
      password: passwordError,
      server: ''
    })

    return !emailError && !phoneError && !passwordError
  }

  const validateVerifyForm = () => {
    const otpError = validateOtp(otp)
    
    setErrors({
      ...errors,
      otp: otpError,
      server: ''
    })

    return !otpError
  }

  const handleInputChange = (field, value) => {
    if (!formTouched) setFormTouched(true)
    
    if (field === 'email') {
      setEmail(value)
      setErrors(prev => ({ ...prev, email: '' }))
    } else if (field === 'phone') {
      // Allow only digits in phone field
      const digitsOnly = value.replace(/\D/g, '')
      setPhone(digitsOnly)
      setErrors(prev => ({ ...prev, phone: '' }))
    } else if (field === 'password') {
      setPassword(value)
      setErrors(prev => ({ ...prev, password: '' }))
    } else if (field === 'otp') {
      // Allow only digits in OTP field
      const digitsOnly = value.replace(/\D/g, '')
      setOtp(digitsOnly)
      setErrors(prev => ({ ...prev, otp: '' }))
    }
  }

  const handleBlur = (field) => {
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }))
    } else if (field === 'phone') {
      setErrors(prev => ({ ...prev, phone: validatePhone(phone) }))
    } else if (field === 'password') {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }))
    } else if (field === 'otp') {
      setErrors(prev => ({ ...prev, otp: validateOtp(otp) }))
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateSignupForm()) return
    
    setLoading(true)

    try {
      const res = await fetch('https://pl.pr.flashfund.in/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone, password }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setVerifying(true)
        setResendCooldown(60) // Set 60 seconds cooldown for resend
        toast.success('Success', {
          description: data.message || 'OTP sent to your email. Please verify.',
        })
      } else {
        // Handle different error types
        if (res.status === 409) {
          setErrors(prev => ({ ...prev, server: 'Email or phone already registered' }))
        } else {
          setErrors(prev => ({ ...prev, server: data.message || 'Signup failed. Please try again' }))
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

  const handleVerify = async (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateVerifyForm()) return
    
    setLoading(true)

    try {
      const res = await fetch('https://pl.pr.flashfund.in/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success('Success', {
          description: data.message || 'Email verified successfully!',
        })
        // Use setTimeout to let user see the success message before redirect
        setTimeout(() => {
          window.location.href = '/signin'
        }, 1500)
      } else {
        if (res.status === 400) {
          setErrors(prev => ({ ...prev, otp: 'Invalid OTP. Please try again' }))
        } else if (res.status === 404) {
          setErrors(prev => ({ ...prev, server: 'Email not found or OTP expired' }))
        } else {
          setErrors(prev => ({ ...prev, server: data.message || 'Verification failed' }))
        }
      }
    } catch (error) {
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

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    
    setLoading(true)
    
    try {
      const res = await fetch('https://pl.pr.flashfund.in/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setResendCooldown(60) // Reset cooldown
        toast.success('Success', {
          description: data.message || 'OTP resent to your email',
        })
      } else {
        setErrors(prev => ({ ...prev, server: data.message || 'Failed to resend OTP' }))
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        server: 'Network error. Please check your connection'
      }))
      
      toast.error('Connection Error', {
        description: 'Unable to connect to the server'
      })
    } finally {
      setLoading(false)
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
          {/* Signup/Verification Card */}
          <Card className="backdrop-blur-sm bg-white/90 border shadow-2xl border-3">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <motion.h1 
                  className="text-2xl font-bold text-slate-800 mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {verifying ? 'Verify Email' : 'Create Account'}
                </motion.h1>
                <motion.p 
                  className="text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  {verifying 
                    ? 'Enter the OTP sent to your email' 
                    : 'Join FlashFund for premium financial services'}
                </motion.p>
              </div>

              {errors.server && (
                <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
                  <AlertDescription>{errors.server}</AlertDescription>
                </Alert>
              )}

              {!verifying ? (
                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
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
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      required
                      className={`h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4 ${
                        errors.phone ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Create Password"
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
                    {password && !errors.password && (
                      <div className="mt-2 flex gap-1">
                        <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`h-1 flex-1 rounded ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`h-1 flex-1 rounded ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                    )}
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
                        Creating Account...
                      </span>
                    ) : 'Create Account'}
                  </Button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => handleInputChange('otp', e.target.value)}
                        onBlur={() => handleBlur('otp')}
                        required
                        className={`h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4 text-center text-lg tracking-wider ${
                          errors.otp ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        maxLength={6}
                      />
                      {errors.otp && (
                        <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                      )}
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
                          Verifying...
                        </span>
                      ) : 'Verify Email'}
                    </Button>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:hover:text-gray-400"
                    >
                      {resendCooldown > 0 
                        ? `Resend OTP in ${resendCooldown}s` 
                        : 'Resend OTP'}
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="mt-8 text-center">
                <p className="text-slate-600 text-sm">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-blue-600 font-medium hover:text-blue-700">
                    Sign In
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