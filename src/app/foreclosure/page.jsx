'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { motion } from "framer-motion";

const Foreclosure = () => {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Hardcoded foreclosure data
  const foreclosureData = {
    loanAmount: 50000,
    paidAmount: 15000,
    interestPaid: 2800,
    remainingPrincipal: 35000,
    foreclosureFee: 1750,
    totalDue: 36750,
    transactionId: "TXN123456789",
    loanStartDate: "10 Nov, 2024",
    completedEMIs: 3,
    totalEMIs: 12
  };

  const handleConfirmForeclosure = async () => {
    try {
      setProcessing(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process successful payment
      setSuccess(true);
      
      // Redirect after successful payment (with a delay to show success state)
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error("Failed to process foreclosure payment:", err);
      setProcessing(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

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

        <div className="max-w-md mx-auto px-5 pt-2">
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

          {/* Foreclosure Details Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
              <h3 className="font-semibold text-slate-700 text-lg mb-4">Foreclosure Details</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Original Loan Amount</span>
                  <span className="font-semibold text-slate-800">₹{foreclosureData.loanAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Amount Paid Till Date</span>
                  <span className="font-semibold text-slate-800">₹{foreclosureData.paidAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Interest Paid</span>
                  <span className="font-semibold text-slate-800">₹{foreclosureData.interestPaid.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">EMIs Completed</span>
                  <span className="font-semibold text-slate-800">{foreclosureData.completedEMIs} of {foreclosureData.totalEMIs}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Loan Start Date</span>
                  <span className="font-semibold text-slate-800">{foreclosureData.loanStartDate}</span>
                </div>
                
                <div className="border-t border-slate-200 my-3 pt-3"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Remaining Principal</span>
                  <span className="font-semibold text-slate-800">₹{foreclosureData.remainingPrincipal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Foreclosure Fee</span>
                  <span className="font-semibold text-slate-800">₹{foreclosureData.foreclosureFee.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Total Foreclosure Amount</p>
                    <p className="text-xs text-slate-500">Pay this amount to close your loan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-700 text-xl">₹{foreclosureData.totalDue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl h-12"
                onClick={handleConfirmForeclosure}
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center">
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
          
          {/* Benefits of Foreclosure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-5 rounded-xl shadow-md border-0 bg-gradient-to-r from-emerald-50 to-blue-50 overflow-hidden">
              <h3 className="font-semibold text-slate-700 text-lg mb-3">Benefits of Foreclosure</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Save on Interest</p>
                    <p className="text-xs text-slate-500">Pay only what you owe, save on future interest charges</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Improves Credit Score</p>
                    <p className="text-xs text-slate-500">Early loan closure can positively impact your credit history</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Reduce Financial Burden</p>
                    <p className="text-xs text-slate-500">Free yourself from monthly EMI payments</p>
                  </div>
                </li>
              </ul>
            </Card>
          </motion.div>
          
          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-xs text-slate-500 italic text-center">
              The foreclosure process is irreversible once completed. For assistance, contact customer support.
            </div>
          </motion.div>
          
          {/* ONDC Attribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center pt-4"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <p className="text-sm text-slate-600">
                Powered by <span className="font-semibold text-blue-600">ONDC</span>
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Open Network for Digital Commerce
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Foreclosure;