'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useAuthStore from '@/store/user'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async (e) => {
    e.preventDefault()
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
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      toast.error('Error', {
        description: error.message
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

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/50 border-slate-200 focus:border-blue-400 rounded-lg px-4"
                  />
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
                  {loading ? 'Signing in...' : 'Sign In'}
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