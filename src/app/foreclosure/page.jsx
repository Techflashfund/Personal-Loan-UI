'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { motion } from "framer-motion";
import useAuthStore from '@/store/user';

const Foreclosure = () => {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [urlLoading, setUrlLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [breakupDetails, setBreakupDetails] = useState(null);
  const [loanInfo, setLoanInfo] = useState(null);
  const [error, setError] = useState(null);

  // Get foreclosure transaction ID from the store
  const foreclosureTransactionId = useAuthStore((state) => state.foreclosureTransactionId);

  // Fetch payment URL and details from the API
  useEffect(() => {
    if (!foreclosureTransactionId) {
      setError("No foreclosure transaction ID found. Please try again.");
      setUrlLoading(false);
      return;
    }

    const fetchPaymentUrl = async () => {
      try {
        setUrlLoading(true);
        setProcessing(true);
        const response = await fetch(
          `https://pl.pr.flashfund.in/payment-url/${foreclosureTransactionId}?type=${'foreclosure'}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch payment URL: ${response.status}`);
        }

        const data = await response.json();
        console.log('data', data);
        
        setPaymentUrl(data.paymentUrl);
        setPaymentDetails(data.paymentDetails);
        
        // Extract breakup details if available
        if (data.details?.message?.order?.quote?.breakup) {
          setBreakupDetails(data.details.message.order.quote.breakup);
        }
        
        // Extract loan information if available
        if (data.details?.message?.order?.items?.[0]?.tags) {
          const loanTags = data.details.message.order.items[0].tags.find(
            tag => tag.descriptor.code === "LOAN_INFO"
          );
          if (loanTags) {
            setLoanInfo(loanTags.list);
          }
        }
      } catch (err) {
        console.error("Error fetching payment URL:", err);
        setError(err.message);
      } finally {
        setProcessing(false);
        setUrlLoading(false);
      }
    };

    fetchPaymentUrl();
  }, [foreclosureTransactionId]);

  // Find a specific breakup item by title
  const findBreakupItem = (title) => {
    if (!breakupDetails) return null;
    const item = breakupDetails.find(item => item.title === title);
    return item ? item.price.value : "0";
  };

  // Handle opening payment URL in a new tab
  const handleProceedToPayment = () => {
    if (paymentUrl) {
      setPaymentProcessing(true);
      
      // Open payment URL in new tab
      window.open(paymentUrl, '_blank');
      
      // Redirect to pending page after a short delay
      setTimeout(() => {
        router.push('/pending');
      }, 1000);
    } else {
      setError("Payment URL is not available. Please try again.");
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Format currency value
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (paymentProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full px-5"
        >
          <Card className="p-8 rounded-xl shadow-lg border-0 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Processing Payment</h2>
            <p className="text-slate-600 mb-6">Your payment is being processed. Please complete the payment in the new tab.</p>
            <p className="text-sm text-slate-500 mb-6">Redirecting to payment status page...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full px-5"
        >
          <Card className="p-8 rounded-xl shadow-lg border-0 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
            <p className="text-slate-600 mb-6">Your loan has been successfully foreclosed.</p>
            <p className="text-sm text-slate-500 mb-6">Redirecting to dashboard...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Full page loading while fetching initial data
  if (urlLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full px-5"
        >
          <Card className="p-8 rounded-xl shadow-lg border-0 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Loading Foreclosure Details</h2>
            <p className="text-slate-600 mb-6">We're preparing your loan foreclosure information.</p>
            <p className="text-sm text-slate-500">This may take a few moments. Please wait...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pb-8">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,255,0.4)_0%,rgba(0,0,255,0.1)_90%)]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.4)_0%,rgba(59,130,246,0.1)_70%)]"></div>
      </div>

      {/* Content container with z-index */}
      <div className="relative z-10">
        {/* Header with shadow and glass effect */}
        <div className="pt-6 pb-4 px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center"
          >
            <Image 
              src="/FlashfundLogo.png"
              alt="FlashFund logo"
              width={120}
              height={70}
              className="w-28"
            />
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </motion.div>
        </div>

        <div className="max-w-md mx-auto px-5 pt-2 pb-20">
          {/* Foreclosure Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-5 mb-6 shadow-lg"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">🔓</span>
              </div>
              <h2 className="text-white font-semibold text-xl leading-tight">Loan Foreclosure</h2>
            </div>
            <p className="text-white/90 text-sm">Close your loan early and save on future interest.</p>
          </motion.div>

          {/* Important Note Alert */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <AlertTitle className="ml-3 text-amber-800 font-medium text-sm">Important</AlertTitle>
              <AlertDescription className="ml-3 text-amber-700 text-xs">
                After foreclosure, your loan will be marked as "Closed" and you'll receive a digital closure certificate.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Loan Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
              <h3 className="font-semibold text-slate-700 text-lg mb-4">Loan Summary</h3>
              
              <div className="space-y-2 mb-4">
                {loanInfo && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Loan Type</span>
                      <span className="font-medium text-slate-800">Personal Loan</span>
                    </div>
                    {loanInfo.map((item, index) => {
                      // Only show relevant loan information
                      if (['INTEREST_RATE', 'TERM', 'FORECLOSURE_FEE'].includes(item.descriptor.code)) {
                        return (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{item.descriptor.name}</span>
                            <span className="font-medium text-slate-800">{item.value}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </>
                )}
                
                {breakupDetails && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Principal Amount</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(findBreakupItem('PRINCIPAL'))}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="w-full h-px bg-slate-200 my-4"></div>
            </Card>
          </motion.div>

          {/* Foreclosure Details Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
              <h3 className="font-semibold text-slate-700 text-lg mb-4">Foreclosure Details</h3>
              
              {paymentDetails && breakupDetails ? (
                <div className="space-y-3 mb-6">
                  {/* Outstanding Principal */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Outstanding Principal</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(findBreakupItem('OUTSTANDING_PRINCIPAL'))}
                    </span>
                  </div>
                  
                  {/* Outstanding Interest */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Outstanding Interest</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(findBreakupItem('OUTSTANDING_INTEREST'))}
                    </span>
                  </div>
                  
                  {/* Foreclosure Charges - Highlighted */}
                  <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50">
                    <span className="text-sm font-medium text-amber-700">Foreclosure Charges</span>
                    <span className="font-semibold text-amber-800">
                      {formatCurrency(findBreakupItem('FORECLOSURE_CHARGES'))}
                    </span>
                  </div>
                  
                  <div className="w-full h-px bg-slate-200 my-2"></div>
                  
                  {/* Total Amount Due */}
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Total Amount Due</span>
                    <span className="font-bold text-lg text-blue-800">₹{paymentDetails.amount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-slate-500">Currency</span>
                    <span className="font-semibold text-slate-800">{paymentDetails.currency}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className="font-semibold text-red-600">NOT PAID</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-20 mb-6">
                  <span className="text-slate-500">Unable to load payment details</span>
                </div>
              )}
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl h-12"
                onClick={handleProceedToPayment}
                disabled={!paymentUrl || processing}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </Card>
          </motion.div>

          {/* Breakdown of Charges Card */}
          {breakupDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-6"
            >
              <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
                <h3 className="font-semibold text-slate-700 text-lg mb-4">Breakdown of Charges</h3>
                
                <div className="space-y-2 mb-4">
                  {/* Process Fee */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Processing Fee</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(findBreakupItem('PROCESSING_FEE'))}
                    </span>
                  </div>
                  
                  {/* Insurance Charges */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Insurance Charges</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(findBreakupItem('INSURANCE_CHARGES'))}
                    </span>
                  </div>
                  
                  {/* Other Charges */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Other Charges</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(findBreakupItem('OTHER_CHARGES'))}
                    </span>
                  </div>
                  
                  {/* Other Upfront Charges */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Other Upfront Charges</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(findBreakupItem('OTHER_UPFRONT_CHARGES'))}
                    </span>
                  </div>
                  
                  {/* Net Disbursed Amount */}
                  <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2 mt-2">
                    <span className="text-slate-500">Net Disbursed Amount</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(findBreakupItem('NET_DISBURSED_AMOUNT'))}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
                <AlertTitle className="ml-3 text-red-800 font-medium text-sm">Error</AlertTitle>
                <AlertDescription className="ml-3 text-red-700 text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Foreclosure;