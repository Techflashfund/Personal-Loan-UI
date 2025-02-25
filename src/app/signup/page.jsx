'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
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
        toast.success('Success', {
          description: data.message,
        })
      } else {
        throw new Error(data.message || 'Signup failed')
      }
    } catch (error) {
      toast.error('Error', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
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
          description: data.message,
        })
        window.location.href = '/signin'
      } else {
        throw new Error(data.message || 'Verification failed')
      }
    } catch (error) {
      toast.error('Error', {
        description: error.message,
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

              {!verifying ? (
                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4"
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Create Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium rounded-lg shadow-lg transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              ) : (
                <motion.form 
                  onSubmit={handleVerify} 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4 text-center text-lg tracking-wider"
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium rounded-lg shadow-lg transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </Button>
                </motion.form>
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