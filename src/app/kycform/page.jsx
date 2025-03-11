"use client"

import { useState, useEffect } from 'react'
import useAuthStore from '@/store/user';
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KYCPage() {
  const router = useRouter();
  const transactionId = useAuthStore((state) => state.transactionId);
  const userId = useAuthStore((state) => state.userId)
  const token = useAuthStore((state) => state.token)
  const [formUrl, setFormUrl] = useState('')
  const [formId, setFormId] = useState('')
  const [kycStatus, setKycStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpened, setFormOpened] = useState(false)
  const [processingKyc, setProcessingKyc] = useState(false) // New state to track KYC processing
  const [step, setStep] = useState(1) // Track current step for better mobile UX
  if (!userId || !token) {
    router.push('/signin')
    return
  }
  // Monitor for transactionId changes
  useEffect(() => {
    if (transactionId) {
      fetchFormUrl()
    }
  }, [transactionId])

  // Start polling when formId is available
  useEffect(() => {
    if (formId) {
      pollKycStatus()
    }
  }, [formId])

  // Add beforeunload event listener to warn users about leaving the page
  useEffect(() => {
    if (processingKyc) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [processingKyc]);

  const fetchFormUrl = async () => {
    if (!transactionId) {
      setError('Transaction ID not found')
      return
    }
    
    try {      
      const response = await axios.post('https://pl.pr.flashfund.in/kyc-form', 
        { transactionId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data?.formUrl && response.data?.formId) {
        setFormUrl(response.data.formUrl)
        setFormId(response.data.formId)
      } else {
        setError('Invalid response format')
      }
    } catch (error) {
      setError('Failed to load KYC form')
    }
  }

  const checkKycStatus = async () => {
    if (!formId || !transactionId) {
      return null
    }
    
    try {
      const response = await axios.post('https://pl.pr.flashfund.in/kyc/kyc-status',
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
      
      setKycStatus(response.data)
      return response.data.kycStatus
    } catch (error) {
      return null
    }
  }

  const pollKycStatus = async () => {
    if (!formId || !transactionId) {
      return
    }
    
    const status = await checkKycStatus()
    
    if (status && status !== 'PENDING') {
      setLoading(false)
      setProcessingKyc(false) // KYC processing complete
    } else {
      setTimeout(pollKycStatus, 5000) // Poll every 5 seconds
    }
  }

  const handleBack = () => {
    if (processingKyc) {
      // Show confirmation dialog if KYC is in process
      if (window.confirm("Your KYC verification is in progress. Going back may disrupt this process. Are you sure you want to leave?")) {
        router.push('/main')
      }
    } else {
      router.push('/main')
    }
  }

  const redirectToEMandate = () => {
    window.location.href = '/emandate';
  }

  const redirectToForm = () => {
    // Store formId and transactionId in sessionStorage before redirecting
    sessionStorage.setItem('kycFormId', formId);
    sessionStorage.setItem('kycTransactionId', transactionId);
    
    // Set processing state to true
    setProcessingKyc(true);
    setFormOpened(true);
    
    // Open in a new tab or redirect to the form URL
    window.open(formUrl, '_blank');
    
    // Start polling for status even though the user is on another page
    pollKycStatus();
  }

  const proceedToInlineForm = () => {
    setProcessingKyc(true);
    setStep(2);
  }

  // Framer Motion variants for animations
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const slideIn = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", damping: 25 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 2, repeat: Infinity }
  };

  const loaderVariants = {
    animate: {
      rotate: 360,
      transition: { repeat: Infinity, duration: 1.5, ease: "linear" }
    }
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 }
    }
  };

  // Warning banner for KYC in progress
  const ProcessingWarningBanner = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="w-full bg-amber-50 border-l-4 border-amber-500 p-4 mb-4"
    >
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 text-sm">Important</p>
          <p className="text-xs text-amber-700 mt-1">
            Please do not press back or reload this page. Your KYC verification is in progress and will be completed automatically.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Render the appropriate step
  const renderContent = () => {
    if (!transactionId) {
      return (
        <motion.div 
          {...fadeIn}
          className="flex flex-col items-center justify-center text-center px-6 py-10 bg-white rounded-xl shadow-sm"
        >
          <motion.div
            animate={pulseAnimation}
            className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6"
          >
            <Clock className="w-8 h-8 text-blue-500" />
          </motion.div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Waiting for Transaction</h2>
          <p className="text-gray-500 mb-1">Please wait while we prepare your verification</p>
          <p className="text-sm text-gray-400">This won't take long</p>
        </motion.div>
      );
    }

    if (loading) {
      if (formUrl) {
        if (step === 1) {
          return (
            <motion.div 
              {...fadeIn}
              className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {processingKyc && <ProcessingWarningBanner />}
              
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">KYC Verification</h2>
                    <p className="text-gray-500 text-sm">Complete your identity verification</p>
                  </div>
                </div>
                
                <div className="rounded-xl overflow-hidden bg-gray-50 p-5 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">Secure & Fast Verification</p>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">Government Approved Process</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">Takes Less Than 5 Minutes</p>
                  </div>
                </div>

                {!processingKyc ? (
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 h-auto rounded-xl flex items-center justify-center"
                        onClick={redirectToForm}
                      >
                        Open KYC Form
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline"
                        className="w-full border-gray-200 text-gray-700 font-medium py-4 h-auto rounded-xl"
                        onClick={proceedToInlineForm}
                      >
                        Complete on This Page
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-blue-50 p-6 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <motion.div 
                        className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full"
                        variants={loaderVariants}
                        animate="animate"
                      />
                    </div>
                    <h3 className="text-center font-medium text-blue-700 mb-2">
                      Fetching KYC Status
                    </h3>
                    <p className="text-center text-sm text-blue-600">
                      Please wait while we confirm your verification status
                    </p>
                  </motion.div>
                )}
              </div>
              
              {formOpened && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-blue-50"
                >
                  <div className="flex items-center mb-2">
                    <motion.div 
                      className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full mr-3"
                      variants={loaderVariants}
                      animate="animate"
                    />
                    <p className="text-sm font-medium text-blue-700">Verification in progress</p>
                  </div>
                  <p className="text-xs text-blue-600">We'll update this page when complete</p>
                </motion.div>
              )}
            </motion.div>
          );
        } else if (step === 2) {
          return (
            <motion.div 
              {...slideIn}
              className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {processingKyc && <ProcessingWarningBanner />}
              
              <div className="p-4 border-b border-gray-100 flex items-center">
                {!processingKyc && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <h2 className="text-lg font-semibold text-gray-800">Complete Verification</h2>
              </div>
              
              <div className="relative">
                <iframe
                  src={formUrl}
                  className="w-full h-screen max-h-[80vh] border-none"
                  title="KYC Form"
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation"
                  referrerPolicy="origin"
                  loading="lazy"
                />
                
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent h-16 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-xs text-gray-500">Scroll to continue completing the form</p>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-blue-50"
              >
                <div className="flex items-center mb-2">
                  <motion.div 
                    className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full mr-3"
                    variants={loaderVariants}
                    animate="animate"
                  />
                  <p className="text-sm font-medium text-blue-700">Verification in progress</p>
                </div>
                <p className="text-xs text-blue-600">We'll automatically update when complete</p>
              </motion.div>
            </motion.div>
          );
        }
      }
      
      return (
        <motion.div 
          {...fadeIn}
          className="flex flex-col items-center justify-center text-center px-6 py-10 bg-white rounded-xl shadow-sm"
        >
          <motion.div 
            className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full mb-6"
            variants={loaderVariants}
            animate="animate"
          />
          
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Preparing Your Verification</h2>
          <p className="text-gray-500 mb-1">We're setting everything up for you</p>
          <p className="text-sm text-gray-400">This will only take a moment</p>
        </motion.div>
      );
    }
    
    // KYC Status display
    if (kycStatus?.kycStatus === 'SUCCESS') {
      return (
        <motion.div
          {...fadeIn}
          className="relative overflow-hidden rounded-xl"
        >
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-b from-green-500 to-green-600"
          />
          
          <motion.div 
            className="relative p-8 flex flex-col items-center text-center"
          >
            <motion.div className="relative w-24 h-24 mb-6">
              <motion.div 
                className="absolute inset-0 bg-white rounded-full" 
                animate={pulseAnimation}
              />
              
              <motion.div 
                className="absolute inset-0 w-full h-full bg-white rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
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
            
            <h2 className="text-2xl font-bold mb-2 text-white">Verification Complete!</h2>
            
            <p className="text-white text-opacity-90 mb-6">
              Your identity has been successfully verified. You're ready for the next step.
            </p>
            
            <div className="w-full space-y-3 mb-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-5 h-auto rounded-xl shadow-lg"
                  onClick={redirectToEMandate}
                >
                  Set Up eMandate
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  className="w-full bg-transparent border border-white text-white hover:bg-white hover:bg-opacity-10 font-medium py-4 h-auto rounded-xl"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            </div>
            
            <div className="absolute top-4 right-4 text-white text-opacity-70 text-2xl">✨</div>
            <div className="absolute bottom-6 left-6 text-white text-opacity-70 text-2xl">🎉</div>
          </motion.div>
        </motion.div>
      );
    } else if (kycStatus?.kycStatus === 'REJECTED') {
      return (
        <motion.div
          {...fadeIn}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <div className="flex justify-center mb-5">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 0]
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-4 border-red-400"
            >
              <XCircle className="w-10 h-10 text-red-500" />
            </motion.div>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Verification Failed
            </h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 text-left">
              <p className="text-red-800 font-medium text-sm mb-1">Reason:</p>
              <p className="text-gray-700">{kycStatus.reason || 'Verification information could not be validated'}</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-4 h-auto rounded-xl shadow-md flex items-center justify-center"
                  onClick={handleBack}
                >
                  
                  Try Again
                </Button>
              </motion.div>
              
              <motion.div
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
            </div>
          </div>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          {...fadeIn}
          className="bg-white p-6 rounded-xl shadow-md text-center"
        >
          <motion.div
            className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4"
          >
            <Clock className="w-8 h-8 text-yellow-600" />
          </motion.div>
          
          <h2 className="text-xl font-bold mb-3 text-gray-800">
            Status: {kycStatus?.kycStatus || 'Unknown'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            We received an unexpected status for your verification.
          </p>
          
          <div className="flex flex-col space-y-3">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-4 h-auto rounded-xl shadow-md flex items-center justify-center"
                onClick={() => {
                  setLoading(true);
                  fetchFormUrl();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
            
            <motion.div
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
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Mobile container that will be centered on desktop */}
      <div className="w-full max-w-md flex flex-col">
        {/* Fixed Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm w-full">
          <div className="px-4 py-3 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                src="/FlashfundLogo.png"
                alt="FlashFund logo"
                width={80}
                height={48}
                className="w-20"
              />
            </motion.div>
            
            {!loading && kycStatus?.kycStatus !== 'SUCCESS' && !processingKyc && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBack}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </header>
        
        {/* Progress indicator */}
        {loading && formUrl && !kycStatus?.kycStatus && (
          <div className="px-4 py-2 bg-blue-50 w-full">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-1 bg-gray-200 rounded-full">
                  <motion.div 
                    className="h-1 bg-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: formOpened ? "50%" : "25%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <span className="ml-2 text-xs font-medium text-blue-700">
                {formOpened ? "50%" : "25%"}
              </span>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="px-4 py-6 flex-1">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
        
        {/* Bottom assistance note */}
        {(loading && formUrl && !formOpened && !processingKyc) || (processingKyc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="sticky bottom-0 w-full bg-white p-4 border-t border-gray-100 text-center"
          >
            {processingKyc ? (
              <p className="text-xs text-amber-600 font-medium">
                Please remain on this page while we process your verification
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Need help? Call our support at <span className="font-medium">1800-123-4567</span>
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}