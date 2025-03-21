'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { motion } from "framer-motion";
import useAuthStore from '@/store/user';

const MissedEMI = () => {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [urlLoading, setUrlLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loanDetails, setLoanDetails] = useState(null);
  const [error, setError] = useState(null);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Get missed EMI transaction ID from the store
  const missedEmiTransactionId = useAuthStore((state) => state.MissedemiTransactionID);

  // Fetch payment URL and details from the API
  useEffect(() => {
    if (!missedEmiTransactionId) {
      setError("No missed EMI transaction ID found. Please try again.");
      setUrlLoading(false);
      return;
    }

    const fetchPaymentUrl = async () => {
      try {
        setUrlLoading(true);
        setProcessing(true);
        
        const response = await fetch(
          `https://pl.pr.flashfund.in/payment-url/${missedEmiTransactionId}?type=${'missed'}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch payment URL: ${response.status}`);
        }

        const data = await response.json();
        console.log('data', data);
        
        setPaymentUrl(data.paymentUrl);
        setPaymentDetails(data.paymentDetails);
        
        // Extract loan details from the response if it exists
        if (data.details && data.details.message && data.details.message.order) {
          setLoanDetails(data.details.message.order);
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
  }, [missedEmiTransactionId]);

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

  // Toggle full details
  const toggleFullDetails = () => {
    setShowFullDetails(!showFullDetails);
  };

  // Extract charges from loan details
  const extractCharges = () => {
    if (!loanDetails || !loanDetails.quote || !loanDetails.quote.breakup) return [];
    
    return loanDetails.quote.breakup.map(item => ({
      title: item.title,
      value: item.price.value,
      currency: item.price.currency
    }));
  };

  // Function to format currency
  const formatCurrency = (value, currency = "INR") => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Function to extract EMI details
  const extractEmiDetails = () => {
    if (!loanDetails || !loanDetails.payments) return null;
    
    // Find the delayed payment
    const delayedPayment = loanDetails.payments.find(payment => 
      payment.status === "DELAYED" || 
      (payment.status === "NOT-PAID" && payment.time?.label === "MISSED_EMI_PAYMENT")
    );
    
    if (!delayedPayment) return null;
    
    return {
      amount: delayedPayment.params?.amount || '',
      currency: delayedPayment.params?.currency || 'INR',
      period: delayedPayment.time?.range ? {
        start: new Date(delayedPayment.time.range.start).toLocaleDateString('en-IN'),
        end: new Date(delayedPayment.time.range.end).toLocaleDateString('en-IN')
      } : null
    };
  };

  // Extract late fee if available
  const extractLateFee = () => {
    if (!loanDetails || !loanDetails.quote || !loanDetails.quote.breakup) return null;
    
    const lateFee = loanDetails.quote.breakup.find(item => item.title === "LATE_FEE_AMOUNT");
    return lateFee ? lateFee.price.value : null;
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
            <p className="text-slate-600 mb-6">Your missed EMI payment has been successfully processed.</p>
            <p className="text-sm text-slate-500 mb-6">Redirecting to dashboard...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Calculate charges from the loan details
  const charges = extractCharges();
  const emiDetails = extractEmiDetails();
  const lateFee = extractLateFee();
  const outstandingPrincipal = charges.filter(charge => charge.title === "OUTSTANDING_PRINCIPAL");
  const outstandingInterest = charges.filter(charge => charge.title === "OUTSTANDING_INTEREST");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pb-8">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,255,0.4)_0%,rgba(0,0,255,0.1)_90%)]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.4)_0%,rgba(59,130,246,0.1)_70%)]"></div>
      </div>

      {/* Full Page Loading */}
      {urlLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-xl">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <Image 
              src="/FlashfundLogo.png"
              alt="FlashFund logo"
              width={150}
              height={70}
              className="mb-6"
            />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading Payment Details</h2>
            <p className="text-slate-600 text-center max-w-xs">
              We're preparing your missed EMI payment information. This will just take a moment.
            </p>
          </div>
        </div>
      )}

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

        <div className="max-w-md mx-auto px-5 pt-2">
          {/* Missed EMI Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-red-600 to-red-400 rounded-2xl p-5 mb-6 shadow-lg"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">⚠️</span>
              </div>
              <h2 className="text-white font-semibold text-xl leading-tight">Missed EMI Payment</h2>
            </div>
            <p className="text-white/90 text-sm">Pay your missed EMI to avoid additional late fees and penalties.</p>
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
                Late payment of EMIs can affect your credit score. Paying missed EMIs promptly helps maintain a good credit history.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Payment Details Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
              <h3 className="font-semibold text-slate-700 text-lg mb-4">Payment Details</h3>
              
              {!urlLoading && (paymentDetails || emiDetails) ? (
                <div className="space-y-4 mb-6">
                  {/* Highlight Section */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-red-700">Missed EMI Amount</span>
                      <span className="font-bold text-red-800 text-lg">
                        {paymentDetails?.amount ? 
                          `₹${paymentDetails.amount}` : 
                          emiDetails?.amount ? 
                            `₹${emiDetails.amount}` : 
                            'N/A'}
                      </span>
                    </div>
                    <div className="h-px bg-red-200 my-2"></div>
                    {lateFee && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-medium text-red-700">Late Fee</span>
                        <span className="font-semibold text-red-800">{formatCurrency(lateFee)}</span>
                      </div>
                    )}
                    {emiDetails?.period && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-red-700">EMI Period</span>
                          <span className="text-sm text-red-800">{emiDetails.period.start} - {emiDetails.period.end}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Basic Payment Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Currency</span>
                      <span className="font-semibold text-slate-800">
                        {paymentDetails?.currency || emiDetails?.currency || 'INR'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Status</span>
                      <span className="font-semibold text-red-600">Overdue</span>
                    </div>
                  </div>
                  
                  {/* Outstanding Details */}
                  {(outstandingPrincipal.length > 0 || outstandingInterest.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-700 mb-3">Outstanding Details</h4>
                      <div className="space-y-2">
                        {outstandingPrincipal.length > 0 && outstandingPrincipal.map((item, index) => (
                          <div key={`principal-${index}`} className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Outstanding Principal</span>
                            <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                        
                        {outstandingInterest.length > 0 && outstandingInterest.map((item, index) => (
                          <div key={`interest-${index}`} className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Outstanding Interest</span>
                            <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* View All Details Button */}
                  {charges.length > 0 && (
                    <div className="mt-2 pt-2">
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={toggleFullDetails}
                      >
                        {showFullDetails ? "Hide" : "View"} All Charges
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ml-2 transition-transform ${showFullDetails ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </div>
                  )}
                  
                  {/* All Charges Section */}
                  {showFullDetails && charges.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <h4 className="font-medium text-slate-700 mb-3">All Charges & Details</h4>
                      {charges.map((charge, index) => (
                        <div key={`charge-${index}`} className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">
                            {charge.title.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="font-semibold text-slate-800">{formatCurrency(charge.value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Loan Term Information */}
                  {loanDetails && loanDetails.items && loanDetails.items[0] && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-700 mb-3">Loan Information</h4>
                      <div className="space-y-2 text-sm">
                        {loanDetails.items[0].tags && 
                         loanDetails.items[0].tags[0] && 
                         loanDetails.items[0].tags[0].list && 
                         loanDetails.items[0].tags[0].list.map((item, index) => {
                          // Only display relevant loan info
                          if (['INTEREST_RATE', 'TERM', 'DELAY_PENALTY_FEE'].includes(item.descriptor.code)) {
                            return (
                              <div key={`loan-info-${index}`} className="flex justify-between items-center">
                                <span className="text-slate-500">{item.descriptor.name}</span>
                                <span className="font-medium text-slate-800">{item.value}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : !urlLoading ? (
                <div className="flex justify-center items-center h-20 mb-6">
                  <span className="text-slate-500">Unable to load payment details</span>
                </div>
              ) : null}
              
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl h-12"
                onClick={handleProceedToPayment}
                disabled={!paymentUrl || processing || urlLoading}
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
                  "Pay Now"
                )}
              </Button>
            </Card>
          </motion.div>

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

export default MissedEMI;