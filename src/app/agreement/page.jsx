"use client"

import { useState, useEffect } from 'react'
import useAuthStore from '@/store/user';
import axios from 'axios'
import { motion } from 'framer-motion';
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoanAgreementPage() {
  const transactionId = useAuthStore((state) => state.transactionId);
  const [formUrl, setFormUrl] = useState('')
  const [formId, setFormId] = useState('')
  const [documentStatus, setDocumentStatus] = useState(null)
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
      pollDocumentStatus()
    }
  }, [formId])

  const fetchFormUrl = async () => {
    if (!transactionId) {
      setError('Transaction ID not found')
      return
    }
    
    try {
      console.log('Fetching loan agreement form URL with transactionId:', transactionId);
      
      const response = await axios.post('https://pl.pr.flashfund.in/document-form', 
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
        // No need to call pollDocumentStatus here as it will be triggered by the useEffect
      } else {
        setError('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching loan agreement form URL:', error)
      setError('Failed to load loan agreement form')
    }
  }

  const checkDocumentStatus = async () => {
    console.log('Checking document status:', formId, '-----', transactionId);
    
    if (!formId || !transactionId) {
      console.log('Missing formId or transactionId, skipping status check')
      return null
    }
    
    try {
      const response = await axios.post('https://pl.pr.flashfund.in/document-status',
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
      
      console.log('Document status response:', response.data)
      setDocumentStatus(response.data)
      return response.data.documentStatus
    } catch (error) {
      console.error('Error checking document status:', error)
      return null
    }
  }

  const pollDocumentStatus = async () => {
    // Double check that we have both required values
    if (!formId || !transactionId) {
      console.log('Cannot poll: missing formId or transactionId')
      return
    }
    
    const status = await checkDocumentStatus()
    
    if (status && status !== 'PENDING') {
      console.log('Document signing process completed with status:', status)
      setLoading(false)
    } else {
      // Continue polling only if we haven't completed the process
      console.log('Document signing still pending, will check again in 5 seconds')
      setTimeout(pollDocumentStatus, 5000) // Poll every 5 seconds
    }
  }

  const handleBack = () => {
    window.history.back();
  }

  const redirectToDashboard = () => {
    window.location.href = '/dashboard';
  }

  const redirectToForm = () => {
    // Store formId and transactionId in sessionStorage before redirecting
    sessionStorage.setItem('documentFormId', formId);
    sessionStorage.setItem('documentTransactionId', transactionId);
    
    // Open in a new tab or redirect to the form URL
    window.open(formUrl, '_blank');
    // Start polling for status even though the user is on another page
    pollDocumentStatus();
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
          
          {!loading && documentStatus?.documentStatus !== 'SUCCESS' && (
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
              Please wait while we prepare your loan agreement
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
                <h2 className="text-lg font-medium text-gray-800 mb-1">Sign Loan Agreement</h2>
                <p className="text-gray-500 text-sm mb-4">Please review and sign your loan agreement document</p>
                
                <div className="flex flex-col space-y-3 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-auto rounded-lg"
                      onClick={redirectToForm}
                    >
                      Open Agreement in New Window
                    </Button>
                  </motion.div>
                </div>
                
                <p className="text-gray-500 text-xs">Note: After signing the agreement, return to this page to check your status</p>
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
                  <p className="text-sm font-medium text-gray-700">Waiting for signature...</p>
                </div>
                <p className="text-xs text-gray-500">We'll automatically update this page when your loan agreement is signed</p>
              </motion.div>
              
              {/* Alternative iframe with improved attributes */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Alternatively, sign the agreement below:</h3>
                <iframe
                  src={formUrl}
                  className="w-full h-[600px] border border-gray-200 rounded-lg"
                  title="Loan Agreement"
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
                Loading loan agreement...
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
            {documentStatus?.documentStatus === 'SUCCESS' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-xl shadow-md text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6"
                >
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold mb-4 text-gray-800"
                >
                  Loan Agreement Signed Successfully!
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 mb-8"
                >
                  Thank you for signing your loan agreement. Your application process is now complete.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                    onClick={redirectToDashboard}
                  >
                    Go to Dashboard
                  </Button>
                </motion.div>
              </motion.div>
            ) : documentStatus?.documentStatus === 'REJECTED' ? (
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
                    Loan Agreement Signing Failed
                  </motion.h2>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="text-gray-600 mb-5"
                  >
                    We couldn't complete the loan agreement signing process.
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
                  Document Status: {documentStatus?.documentStatus || 'Unknown'}
                </motion.h2>
                
                <motion.p 
                  variants={itemVariants}
                  className="text-gray-600 mb-6"
                >
                  We received an unexpected status for your loan agreement.
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
    </div>
  )
}