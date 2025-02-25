"use client"

import { useState, useEffect } from 'react'
import useAuthStore from '@/store/user';
import axios from 'axios'
import { motion } from 'framer-motion';
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EMandatePage() {
  const transactionId = useAuthStore((state) => state.transactionId);
  const [formUrl, setFormUrl] = useState('')
  const [formId, setFormId] = useState('')
  const [mandateStatus, setMandateStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [useRedirect, setUseRedirect] = useState(false)

  // Monitor for transactionId changes
  useEffect(() => {
    console.log('Transaction ID changed:', transactionId)
    
    // Only fetch form URL when transactionId is available
    if (transactionId) {
      fetchFormUrl()
    }
  }, [transactionId])

  // This effect will run only when formId changes to a valid value
  useEffect(() => {
    // Only start polling if formId is not empty
    if (formId) {
      console.log('Form ID set, starting status polling:', formId)
      pollMandateStatus()
    }
  }, [formId])

  const fetchFormUrl = async () => {
    if (!transactionId) {
      setError('Transaction ID not found')
      return
    }
    
    try {
      console.log('Fetching eMandate form URL with transactionId:', transactionId);
      
      const response = await axios.post('https://pl.pr.flashfund.in/mandate-form', 
        { transactionId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      console.log('Response:', response.data);
      
      if (response.data?.formUrl && response.data?.formId) {
        setFormUrl(response.data.formUrl)
        setFormId(response.data.formId)
        // No need to call pollMandateStatus here as it will be triggered by the useEffect
      } else {
        setError('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching eMandate form URL:', error)
      setError('Failed to load eMandate form')
    }
  }

  const checkMandateStatus = async () => {
    console.log('Checking eMandate status:', formId,'-----', transactionId);
    
    if (!formId || !transactionId) {
      console.log('Missing formId or transactionId, skipping status check')
      return null
    }
    
    try {
        console.log();
        
      const response = await axios.post('https://pl.pr.flashfund.in/mandate-status',
        {
          formId,
          transactionId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('eMandate status response:', response.data)
      setMandateStatus(response.data)
      return response.data.mandateStatus
    } catch (error) {
      console.error('Error checking eMandate status:', error)
      return null
    }
  }

  const pollMandateStatus = async () => {
    // Double check that we have both required values
    if (!formId || !transactionId) {
      console.log('Cannot poll: missing formId or transactionId')
      return
    }
    
    const status = await checkMandateStatus()
    
    if (status && status !== 'PENDING') {
      console.log('eMandate process completed with status:', status)
      setLoading(false)
    } else {
      // Continue polling only if we haven't completed the process
      console.log('eMandate still pending, will check again in 5 seconds')
      setTimeout(pollMandateStatus, 5000) // Poll every 5 seconds
    }
  }

  const handleBack = () => {
    window.history.back();
  }

  const redirectToDashboard = () => {
    window.location.href = '/loanagreement';
  }

  const redirectToForm = () => {
    // Store formId and transactionId in sessionStorage before redirecting
    sessionStorage.setItem('emandateFormId', formId);
    sessionStorage.setItem('emandateTransactionId', transactionId);
    
    // Open in a new tab or redirect to the form URL
    window.open(formUrl, '_blank');
    // Start polling for status even though the user is on another page
    pollMandateStatus();
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

  const loaderVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  // Success animation variants
  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1,
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: "easeInOut",
        delay: 0.2
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
          
          {!loading && mandateStatus?.mandateStatus !== 'SUCCESS' && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={handleBack}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
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
              Waiting for transaction ID...
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-gray-500"
            >
              Please wait while we prepare your eMandate setup
            </motion.p>
          </motion.div>
        ) : loading ? (
          formUrl ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-800 mb-1">Set Up eMandate</h2>
                <p className="text-gray-500 text-sm mb-4">Please complete the eMandate setup form to authorize automatic payments</p>
                
                <div className="flex flex-col space-y-3 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-auto rounded-lg"
                      onClick={redirectToForm}
                    >
                      Open eMandate Form in New Window
                    </Button>
                  </motion.div>
                </div>
                
                <p className="text-gray-500 text-xs">Note: After completing the form, return to this page to check your setup status</p>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="p-4 bg-gray-50"
              >
                <div className="flex items-center mb-2">
                  <motion.div 
                    className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full mr-3"
                    variants={loaderVariants}
                    animate="animate"
                  />
                  <p className="text-sm font-medium text-gray-700">Waiting for setup completion...</p>
                </div>
                <p className="text-xs text-gray-500">We'll automatically update this page when your eMandate setup is complete</p>
              </motion.div>
              
              {/* Alternative iframe with improved attributes */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Alternatively, complete the form below:</h3>
                <iframe
                  src={formUrl}
                  className="w-full h-[600px] border border-gray-200 rounded-lg"
                  title="eMandate Form"
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation"
                  referrerPolicy="origin"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md text-center"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div className="flex justify-center mb-6">
                <motion.div 
                  className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full"
                  variants={loaderVariants}
                  animate="animate"
                />
              </motion.div>
              <motion.p 
                variants={itemVariants}
                className="text-gray-800 text-lg font-medium mb-2"
              >
                Loading eMandate form...
              </motion.p>
              <motion.p 
                variants={itemVariants}
                className="text-gray-500 text-sm"
              >
                This may take a few moments
              </motion.p>
            </motion.div>
          )
        ) : (
          <>
            {mandateStatus?.mandateStatus === 'SUCCESS' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative overflow-hidden"
              >
                {/* Success background with animation */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-b from-green-500 to-green-600 rounded-xl"
                />
                
                <motion.div 
                  className="relative p-8 flex flex-col items-center text-center"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {/* Success check animation */}
                  <motion.div
                    variants={itemVariants}
                    className="mb-6"
                  >
                    <motion.div className="relative w-28 h-28">
                      {/* Pulse effect */}
                      <motion.div 
                        className="absolute inset-0 bg-white rounded-full" 
                        variants={pulseVariants}
                        initial={{ opacity: 0.7, scale: 1 }}
                        animate="pulse"
                      />
                      
                      {/* Check circle */}
                      <motion.div 
                        className="absolute inset-0 w-full h-full bg-white rounded-full flex items-center justify-center"
                        variants={circleVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.svg
                          viewBox="0 0 50 50"
                          className="w-3/5 h-3/5 stroke-green-500 fill-none"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            d="M 10,25 L 22,37 L 40,13"
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                          />
                        </motion.svg>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.h2 
                    variants={itemVariants}
                    className="text-2xl font-bold mb-3 text-white"
                  >
                    eMandate Set Up Successfully!
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="text-white text-opacity-90 mb-8"
                  >
                    Your automatic payment authorization is complete. Your account is now fully set up and ready to use.
                  </motion.p>
                  
                  <motion.div
                    variants={itemVariants}
                    className="w-full max-w-xs"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mb-3"
                    >
                      <Button 
                        className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold text-lg py-6 h-auto rounded-xl shadow-lg"
                        onClick={redirectToDashboard}
                      >
                        Sign Agreement
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : mandateStatus?.mandateStatus === 'REJECTED' ? (
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
                    eMandate Setup Failed
                  </motion.h2>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-left"
                  >
                    <p className="text-red-800 font-medium text-sm mb-1">Reason for rejection:</p>
                    <p className="text-gray-700">{mandateStatus.reason || 'Not specified'}</p>
                  </motion.div>
                  
                  <motion.div className="flex flex-col space-y-3">
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        className="w-full bg-gray-800 hover:bg-gray-900 text-base font-medium py-5 h-auto rounded-xl shadow-md"
                        onClick={() => {
                          setLoading(true);
                          fetchFormUrl();
                        }}
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
                        onClick={handleBack}
                      >
                        Go Back
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
                  eMandate Status: {mandateStatus?.mandateStatus || 'Unknown'}
                </motion.h2>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-gray-600 mb-6"
                >
                  We received an unexpected status for your eMandate setup.
                </motion.p>
                
                <motion.div className="flex flex-col space-y-3">
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      className="w-full bg-gray-800 hover:bg-gray-900 text-base font-medium py-5 h-auto rounded-xl shadow-md"
                      onClick={() => {
                        setLoading(true);
                        fetchFormUrl();
                      }}
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
                      onClick={handleBack}
                    >
                      Go Back
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </div>
      
      {/* Decorative elements */}
      {mandateStatus?.mandateStatus === 'SUCCESS' && (
        <>
          <motion.div
            className="fixed bottom-10 right-5 text-3xl"
            animate={{ 
              y: [0, -15, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            style={{ zIndex: 1 }}
          >
            ✨
          </motion.div>
          
          <motion.div
            className="fixed top-20 left-6 text-3xl"
            animate={{ 
              y: [0, 10, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
            style={{ zIndex: 1 }}
          >
            🎉
          </motion.div>
        </>
      )}
    </div>
  )
}