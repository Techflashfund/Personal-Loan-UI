"use client"

import { useState, useEffect } from 'react'
import useAuthStore from '@/store/user';
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EMandatePage() {
  const router = useRouter();
  const transactionId = useAuthStore((state) => state.transactionId);
  
  const [formUrl, setFormUrl] = useState('')
  const [formId, setFormId] = useState('')
  const [mandateStatus, setMandateStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpened, setFormOpened] = useState(false)
  const [step, setStep] = useState(1) // Track current step for better mobile UX
  const [initialLoading, setInitialLoading] = useState(true) // New state for initial loader
  const [retryCount, setRetryCount] = useState(0) // Track API retry attempts
  const [isApiPending, setIsApiPending] = useState(false) // Track if API call is in progress
  const [buttonsHidden, setButtonsHidden] = useState(false) // Track if buttons should be hidden
  const [statusMessage, setStatusMessage] = useState('') // Status message while fetching

  // Initial loader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 4000); // 4 second loader

    return () => clearTimeout(timer);
  }, []);

  // Monitor for transactionId changes - only after initial loading
  useEffect(() => {
    if (!initialLoading && transactionId) {
      fetchFormUrl()
    }
  }, [transactionId, initialLoading])

  // Start polling when formId is available
  useEffect(() => {
    if (formId) {
      pollMandateStatus()
    }
  }, [formId])

  // Set up auto-retry for 404s
  useEffect(() => {
    let retryTimer;
    
    if (isApiPending && retryCount > 0) {
      // Exponential backoff with a base of 2 seconds (2s, 4s, 8s, etc.)
      // But capped at 15 seconds maximum
      const backoffTime = Math.min(2000 * Math.pow(1.5, retryCount - 1), 15000);
      
      retryTimer = setTimeout(() => {
        fetchFormUrl();
      }, backoffTime);
    }
    
    return () => clearTimeout(retryTimer);
  }, [retryCount, isApiPending]);

  // Show status updates while fetching
  useEffect(() => {
    if (buttonsHidden) {
      const statusMessages = [
        "Processing your eMandate...",
        "Verifying bank details...",
        "Confirming bank authorization...",
        "Almost there! Finalizing setup...",
        "Please wait while we complete your setup..."
      ];
      
      let messageIndex = 0;
      setStatusMessage(statusMessages[0]);
      
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % statusMessages.length;
        setStatusMessage(statusMessages[messageIndex]);
      }, 8000);
      
      return () => clearInterval(messageInterval);
    }
  }, [buttonsHidden]);

  // Add beforeunload event listener to warn about page reload/navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (buttonsHidden && !mandateStatus?.mandateStatus) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        return ""; // This message isn't displayed in modern browsers, but is required
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [buttonsHidden, mandateStatus]);

  const fetchFormUrl = async () => {
    if (!transactionId) {
      setError('Transaction ID not found')
      return
    }
    
    setIsApiPending(true);
    
    try {      
      const response = await axios.post('https://pl.pr.flashfund.in/mandate-form', 
        { transactionId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      // Reset retry count on successful response
      setRetryCount(0);
      setIsApiPending(false);
      
      if (response.data?.formUrl && response.data?.formId) {
        setFormUrl(response.data.formUrl)
        setFormId(response.data.formId)
      } else {
        setError('Invalid response format')
      }
    } catch (error) {
      // Handle 404 errors specifically
      if (error.response && error.response.status === 404) {
        // Increment retry count and keep loading
        setRetryCount(prev => prev + 1);
        setIsApiPending(true);
        // Error will be cleared since we're waiting for the API to be ready
        setError('');
      } else {
        // For other errors, show the error message
        setError('Failed to load eMandate form');
        setIsApiPending(false);
      }
    }
  }

  const checkMandateStatus = async () => {
    if (!formId || !transactionId) {
      return null
    }
    
    try {
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
      
      setMandateStatus(response.data)
      return response.data.mandateStatus
    } catch (error) {
      return null
    }
  }

  const pollMandateStatus = async () => {
    if (!formId || !transactionId) {
      return
    }
    
    const status = await checkMandateStatus()
    
    if (status && status !== 'PENDING') {
      setLoading(false)
      setButtonsHidden(false) // Show buttons again when process is complete
    } else {
      setTimeout(pollMandateStatus, 5000) // Poll every 5 seconds
    }
  }

  const handleBack = () => {
    router.push('/main')
  }

  const redirectToNextStep = () => {
    window.location.href = '/agreement';
  }

  const redirectToForm = () => {
    // Hide buttons and show loading status
    setButtonsHidden(true);
    
    // Store formId and transactionId in sessionStorage before redirecting
    sessionStorage.setItem('emandateFormId', formId);
    sessionStorage.setItem('emandateTransactionId', transactionId);
    
    // Open in a new tab or redirect to the form URL
    window.open(formUrl, '_blank');
    setFormOpened(true);
    // Start polling for status even though the user is on another page
    pollMandateStatus();
  }

  const proceedToInlineForm = () => {
    setButtonsHidden(true);
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

  // Initial loader component
  if (initialLoading || (isApiPending && retryCount > 0)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full mb-8"
          variants={loaderVariants}
          animate="animate"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center px-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            {initialLoading 
              ? "Preparing Your eMandate" 
              : "Waiting for eMandate Service"}
          </h2>
          <p className="text-gray-500">
            {initialLoading 
              ? "Setting up your secure payment authorization..."
              : "The service is being initialized. Please wait..."}
          </p>
          {retryCount > 0 && (
            <p className="text-xs text-blue-500 mt-2">
              Attempt {retryCount}... We'll keep trying automatically
            </p>
          )}
        </motion.div>
        
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: initialLoading ? "60%" : `${Math.min(30 + (retryCount * 10), 90)}%` }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
          className="h-1 bg-blue-500 fixed bottom-16 left-0 rounded-r-full"
        />
      </div>
    )
  }

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
          <p className="text-gray-500 mb-1">Please wait while we prepare your eMandate</p>
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
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Set Up eMandate</h2>
                    <p className="text-gray-500 text-sm">Complete your payment authorization</p>
                  </div>
                </div>
                
                <div className="rounded-xl overflow-hidden bg-gray-50 p-5 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">Secure Digital Mandate</p>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">RBI Compliant Process</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">Takes Less Than 5 Minutes</p>
                  </div>
                </div>

                {!buttonsHidden ? (
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 h-auto rounded-xl flex items-center justify-center"
                        onClick={redirectToForm}
                      >
                        Open eMandate Form
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
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-center py-4">
                      <motion.div 
                        className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full mr-3"
                        variants={loaderVariants}
                        animate="animate"
                      />
                      <p className="text-blue-700 font-medium">{statusMessage}</p>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 flex items-start">
                      <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">Please don't refresh or go back</p>
                        <p className="text-xs">The process will complete automatically. Going back or refreshing may cause errors.</p>
                      </div>
                    </div>
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
                    <p className="text-sm font-medium text-blue-700">eMandate setup in progress</p>
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
              <div className="p-4 border-b border-gray-100 flex items-center">
                {!buttonsHidden && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <h2 className="text-lg font-semibold text-gray-800">Complete eMandate Setup</h2>
              </div>
              
              {buttonsHidden && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 mx-4 mt-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start"
                >
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">Please don't refresh or go back</p>
                    <p className="text-xs">The process will complete automatically. Going back or refreshing may cause errors.</p>
                  </div>
                </motion.div>
              )}
              
              <div className="relative">
                <iframe
                  src={formUrl}
                  className="w-full h-screen max-h-[80vh] border-none"
                  title="eMandate Form"
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
                  <p className="text-sm font-medium text-blue-700">{statusMessage || "eMandate setup in progress"}</p>
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
          
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Preparing Your eMandate</h2>
          <p className="text-gray-500 mb-1">We're setting everything up for you</p>
          <p className="text-sm text-gray-400">This will only take a moment</p>
        </motion.div>
      );
    }
    
    // Mandate Status display
    if (mandateStatus?.mandateStatus === 'SUCCESS') {
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
            
            <h2 className="text-2xl font-bold mb-2 text-white">eMandate Setup Complete!</h2>
            
            <p className="text-white text-opacity-90 mb-6">
              Your automatic payment authorization is now active and verified.
            </p>
            
            <div className="w-full space-y-3 mb-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-5 h-auto rounded-xl shadow-lg"
                  onClick={redirectToNextStep}
                >
                  Sign Agreement
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </div>
            
            <div className="absolute top-4 right-4 text-white text-opacity-70 text-2xl">✨</div>
            <div className="absolute bottom-6 left-6 text-white text-opacity-70 text-2xl">🎉</div>
          </motion.div>
        </motion.div>
      );
    } else if (mandateStatus?.mandateStatus === 'REJECTED') {
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
              eMandate Setup Failed
            </h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 text-left">
              <p className="text-red-800 font-medium text-sm mb-1">Reason:</p>
              <p className="text-gray-700">{mandateStatus.reason || 'eMandate authorization could not be validated'}</p>
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
                  <RefreshCw className="ml-2 w-4 h-4" />
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
            Status: {mandateStatus?.mandateStatus || 'Unknown'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            We received an unexpected status for your eMandate setup.
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
    // Container with mobile-like width restrictions even on desktop
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Max width container to simulate mobile view */}
      <div className="w-full max-w-md mx-auto flex flex-col">
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
            
            {!loading && mandateStatus?.mandateStatus !== 'SUCCESS' && !buttonsHidden && (
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
        {loading && formUrl && !mandateStatus?.mandateStatus && (
          <div className="px-4 py-2 bg-blue-50 w-full">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-1 bg-gray-200 rounded-full">
                  <motion.div 
                    className="h-1 bg-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: buttonsHidden ? (formOpened ? "75%" : "50%") : (formOpened ? "50%" : "25%") }}
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
        
        {/* Main Content - centered and mobile-width restricted */}
        <div className="px-4 py-6 flex-grow">
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
        {loading && formUrl && !formOpened && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="w-full bg-white p-4 border-t border-gray-100 text-center"
          >
            <p className="text-xs text-gray-500">
              Need help? Call our support at <span className="font-medium">1800-123-4567</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}