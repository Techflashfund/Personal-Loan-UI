"use client"

import { useState, useEffect } from 'react'
import useAuthStore from '@/store/user';
import axios from 'axios'
import { motion } from 'framer-motion';
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function DisbursementPage() {
  const router = useRouter()
  const transactionId = useAuthStore((state) => state.transactionId);
  const [disbursementStatus, setDisbursementStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loanDetails, setLoanDetails] = useState(null)
  const [countdown, setCountdown] = useState(10)
  const [pollingActive, setPollingActive] = useState(true)

  // Monitor for transactionId changes
  useEffect(() => {
    console.log('Transaction ID in disbursement page:', transactionId)
    
    // Only start polling when transactionId is available
    if (transactionId) {
      checkDisbursementStatus()
    }
  }, [transactionId])

  // Countdown effect for visual feedback
  useEffect(() => {
    let timer
    if (loading && pollingActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0 && pollingActive) {
      setCountdown(10)
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown, loading, pollingActive])
 const handleIGMSupport=()=>{
  router.push('/igmmain')
 }
  const checkDisbursementStatus = async () => {
    if (!transactionId) {
      setError('Transaction ID not found')
      setLoading(false)
      return
    }
    
    try {
      console.log('Checking disbursement status with transactionId:', transactionId);
      
      const response = await axios.post('https://pl.pr.flashfund.in/check-disbursal-status', 
        { transactionId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('Disbursement status response:', response.data);
      
      if (response.data?.message === "Done" && response.data?.loan) {
        setDisbursementStatus('COMPLETED')
        setLoanDetails(response.data.loan)
        setLoading(false)
        setPollingActive(false)
      } else if (response.data?.message === "Pending") {
        setDisbursementStatus('PENDING')
        setTimeout(checkDisbursementStatus, 5000) // Poll every 5 seconds
        setCountdown(10) // Reset countdown
      } else if (response.data?.message === "Failed") {
        setDisbursementStatus('FAILED')
        setLoading(false)
        setPollingActive(false)
      } else {
        // Continue polling if status is unclear
        setTimeout(checkDisbursementStatus, 5000)
      }
    } catch (error) {
      console.error('Error checking disbursement status:', error)
      
      // If API call failed, we should still retry
      if (pollingActive) {
        setTimeout(checkDisbursementStatus, 5000)
      }
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setPollingActive(true)
    setCountdown(10)
    checkDisbursementStatus()
  }

  const handleHome = () => {
    router.push('/')
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  const progressVariants = {
    initial: { width: '0%' },
    animate: { width: '100%' }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center">
      {/* Main container with fixed mobile width */}
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-md w-full">
          <div className="px-4 py-3 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                src="/FlashfundLogo.png"
                alt="FlashFund logo"
                width={100}
                height={60}
                className="w-24"
              />
            </motion.div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="px-4 py-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm"
            >
              {error}
            </motion.div>
          )}
          
          {!transactionId ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="bg-white p-6 rounded-xl shadow-md text-center"
            >
              <motion.div
                variants={itemVariants}
                className="flex justify-center mb-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <span className="text-gray-500 text-2xl">⏳</span>
                </motion.div>
              </motion.div>
              <motion.h2 
                variants={itemVariants}
                className="text-xl font-medium text-gray-800 mb-2"
              >
                Missing Transaction Information
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-gray-500 mb-6"
              >
                We can't process your disbursement without transaction details
              </motion.p>
              
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                  onClick={handleHome}
                >
                  Return to Home
                </Button>
              </motion.div>
            </motion.div>
          ) : loading ? (
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div 
                variants={itemVariants}
                className="text-center mb-8"
              >
                <motion.div
                  className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4"
                  animate={{
                    boxShadow: ['0px 0px 0px rgba(59, 130, 246, 0)', '0px 0px 20px rgba(59, 130, 246, 0.3)', '0px 0px 0px rgba(59, 130, 246, 0)']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <motion.svg 
                    className="w-10 h-10 text-blue-500" 
                    viewBox="0 0 24 24"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" />
                  </motion.svg>
                </motion.div>
                
                <motion.h2 
                  variants={itemVariants}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  Processing Your Disbursement
                </motion.h2>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-gray-600 mb-6"
                >
                  We're initiating the transfer to your account. This process typically takes a few minutes.
                </motion.p>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="mb-8"
              >
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    variants={progressVariants}
                    initial="initial"
                    animate="animate"
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Processing</span>
                  <span className="text-sm text-gray-500">Checking again in {countdown}s</span>
                </div>
              </motion.div>
              
              <motion.div
                variants={itemVariants}
                className="bg-blue-50 p-4 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                    <p className="mt-1 text-sm text-blue-600">
                      Once the disbursement is complete, you'll receive a confirmation notification. The funds typically reflect in your account within 24 hours, depending on your bank's processing time.
                    </p>
                  </div>
                  <p className="text-s text-slate-500 mt-2 underline">
  <button onClick={handleIGMSupport} className='underline text-blue-500'>
    click here for support?
  </button>
</p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {disbursementStatus === 'COMPLETED' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-6 bg-green-500 text-white">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-4"
                    >
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="w-10 h-10 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </motion.svg>
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-center mb-2"
                    >
                      Disbursement Successful!
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center text-green-100"
                    >
                      Your loan amount has been successfully disbursed to your account
                    </motion.p>
                  </div>
                  
                  <div className="p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-6"
                    >
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Loan Details</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
                          <p className="text-xl font-bold text-gray-800">
                            {loanDetails?.loanAmount ? formatCurrency(loanDetails.loanAmount) : "₹442,500"}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                          <p className="text-md font-medium text-gray-800 break-all">
                            {transactionId || "N/A"}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Disbursement Date</p>
                          <p className="text-md font-medium text-gray-800">
                            {loanDetails?.disbursementDate ? 
                              formatDate(loanDetails.disbursementDate) : 
                              formatDate(new Date())}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Account Number</p>
                          <p className="text-md font-medium text-gray-800">
                            {loanDetails?.accountNumber ? 
                              "XXXX" + loanDetails.accountNumber.slice(-4) : 
                              "XXXX XXXX XXXX"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-blue-50 p-4 rounded-lg mb-6"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-1">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                          <p className="mt-1 text-sm text-blue-600">
                            The funds have been transferred to your bank account and should reflect within 24 hours. 
                            A confirmation email with your loan details has been sent to your registered email address.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-center"
                    >
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-10 rounded-lg shadow-md"
                        onClick={handleHome}
                      >
                        Go to Home
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : disbursementStatus === 'FAILED' ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="bg-white p-6 rounded-xl shadow-md"
                >
                  <motion.div
                    variants={itemVariants}
                    className="flex justify-center mb-5"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, -5, 0]
                      }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2 border-4 border-red-400"
                    >
                      <span className="text-red-500 text-3xl">✕</span>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div className="text-center">
                    <motion.h2 
                      variants={itemVariants}
                      className="text-xl font-bold mb-3 text-gray-800"
                    >
                      Disbursement Failed
                    </motion.h2>
                    
                    <motion.p 
                      variants={itemVariants}
                      className="text-gray-600 mb-5"
                    >
                      We encountered an issue while processing your disbursement. This could be due to a technical error or an issue with your bank account details.
                    </motion.p>
                    
                    <motion.div className="flex flex-col space-y-3">
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button 
                          className="w-full bg-gray-800 hover:bg-gray-900 text-base font-medium py-5 h-auto rounded-xl shadow-md"
                          onClick={handleRetry}
                        >
                          Try Again
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium py-4 h-auto rounded-xl"
                          onClick={handleHome}
                        >
                          Go to Home
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="bg-white p-6 rounded-xl shadow-md text-center"
                >
                  <motion.h2 
                    variants={itemVariants}
                    className="text-xl font-bold mb-3 text-gray-800"
                  >
                    Disbursement Status: {disbursementStatus || 'Unknown'}
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="text-gray-600 mb-6"
                  >
                    We received an unexpected status for your disbursement request.
                  </motion.p>
                  
                  <motion.div className="flex flex-col space-y-3">
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        className="w-full bg-gray-800 hover:bg-gray-900 text-base font-medium py-5 h-auto rounded-xl shadow-md"
                        onClick={handleRetry}
                      >
                        Try Again
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium py-4 h-auto rounded-xl"
                        onClick={handleHome}
                      >
                        Go to Home
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}