'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signup, verifyEmail, resendOtp } from '@/services/authservices'
import { validateEmail, validatePhone, validatePassword, validateOtp } from '@/utils/validation'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [referrer, setReferrer] = useState('')
  const [formTouched, setFormTouched] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
    server: ''
  })
  const [resendCooldown, setResendCooldown] = useState(0)

  // Extract referral code from URL params
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferrer(ref)
    }
  }, [searchParams])

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
      const digitsOnly = value.replace(/\D/g, '')
      setPhone(digitsOnly)
      setErrors(prev => ({ ...prev, phone: '' }))
    } else if (field === 'password') {
      setPassword(value)
      setErrors(prev => ({ ...prev, password: '' }))
    } else if (field === 'otp') {
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
    
    if (!validateSignupForm()) return
    
    setLoading(true)

    try {
      // Include referrer in signup request if available
      const data = await signup(email, phone, password, referrer)
      setVerifying(true)
      setResendCooldown(60)
      toast.success('Success', {
        description: data.message || 'OTP sent to your email. Please verify.',
      })
    } catch (error) {
      setErrors(prev => ({ ...prev, server: error.message }))
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!validateVerifyForm()) return
    
    setLoading(true)

    try {
      const data = await verifyEmail(email, otp)
      toast.success('Success', {
        description: data.message || 'Email verified successfully!',
      })
      setTimeout(() => {
       router.push('/signin')
      }, 1500)
    } catch (error) {
      setErrors(prev => ({ ...prev, server: error.message }))
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    
    setLoading(true)
    
    try {
      const data = await resendOtp(email)
      setResendCooldown(60)
      toast.success('Success', {
        description: data.message || 'OTP resent to your email',
      })
    } catch (error) {
      setErrors(prev => ({ ...prev, server: error.message }))
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setLoading(false)
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
      <div className="  pt-6 pb-2 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={230}
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
            <h2 className="text-white font-semibold text-xl leading-tight">
              {verifying ? 'Verify your account' : 'Create your premium account'}
            </h2>
            <p className="text-white/90 text-sm mt-1">
              {verifying ? 'Almost there • One-time verification' : 'Secure access • Premium features'}
            </p>
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
                <span className="text-3xl">{verifying ? '✉️' : '🔐'}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Signup/Verify Title with decorative elements */}
        <div className="flex items-center mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200"></div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-slate-800 px-4"
          >
            {verifying ? 'Verify Email' : 'Sign Up'}
          </motion.h1>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200"></div>
        </div>

        {/* Show referrer info if exists */}
        {referrer && !verifying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-4"
          >
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                You were referred by: <span className="font-medium">{referrer}</span>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Signup/Verification Card */}
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
                      className={`h-12 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-400 rounded-xl px-4 ${
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
                      className={`h-12 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-400 rounded-xl px-4 ${
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
                      className={`h-12 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-400 rounded-xl px-4 ${
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
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Create Account
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    )}
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
                        className={`h-12 bg-white/80 border-slate-200 focus:border-blue-500 focus:ring-blue-400 rounded-xl px-4 text-center text-lg tracking-wider ${
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
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Verify Email
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className="text-sm text-blue-600 hover:text-blue-700 transition duration-200 disabled:text-gray-400 disabled:hover:text-gray-400"
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
                  <Link href="/signin" className="text-blue-600 font-medium hover:text-blue-700 transition duration-200">
                    Sign In
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
          <div className="inline-flex items-center px-4 py-2 bg-transparent backdrop-blur-sm rounded-full shadow-sm">
            <p className="text-sm text-slate-600 flex items-center justify-center">
              Powered by <Image 
                src="/ondc-network-vertical.png"
                alt="FlashFund logo"
                width={100}
                height={60}
                className="w-35"
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