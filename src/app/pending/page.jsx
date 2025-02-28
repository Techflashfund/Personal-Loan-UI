'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useAuthStore from '@/store/user';
import axios from 'axios';
import Link from 'next/link';
import Image from "next/image";
import { motion } from "framer-motion";

const ReturningUserDashboard = () => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token)
  const setTransactionId = useAuthStore((state) => state.setTransactionId)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMissedEmi, setHasMissedEmi] = useState(false);
  
  useEffect(() => {
    // Only proceed with API call if userId exists and is not null
    if (!userId) {
      console.log("Waiting for userId to be available...");
      return; // Exit early if userId is not available yet
    }
    
    const fetchLoanStatus = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching loan status with userId:", userId);
        
        const response = await fetch('https://pl.pr.flashfund.in/check-loan-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
        console.log(response);
        
        if (!response.ok) {
          // If 404 or no loans, redirect to main page
          if (response.status === 404) {
            router.push('/main');
            return;
          }
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if user has any loans
        if (!data.loans || data.loans.length === 0) {
          router.push('/main');
          return;
        }
        
        // Process the loan data to match our component's expectations
        const loanData = processLoanData(data);
        setUserData(loanData);
        
        // Check if there are any missed EMIs
        // This is an example - you'll need to adapt this to your actual data structure
        const missedEmis = data.loans[0].message.order.payments.filter(payment => 
          payment.type === "POST_FULFILLMENT" && 
          payment.status === "NOT-PAID" && 
          new Date(payment.time.range.end) < new Date()
        );
        
        setHasMissedEmi(missedEmis.length > 0);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch loan status:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanStatus();
  }, [userId, router]); // Add userId to dependency array to re-run when it changes
  
  // Function to process API loan data into the format our component needs
  const processLoanData = (apiData) => {
    if (!apiData || !apiData.loans || apiData.loans.length === 0) {
      return null;
    }
    
    const loan = apiData.loans[0];
    const orderData = loan.message.order;
    
    // Extract loan details from the API response
    const loanInfo = orderData.items[0].tags.find(tag => 
      tag.descriptor.code === "LOAN_INFO"
    );
    
    // Find the principal amount and total amount
    const principal = orderData.quote.breakup.find(item => item.title === "PRINCIPAL")?.price.value || "0";
    const totalAmount = orderData.quote.price.value;
    
    // Get installment information
    const installments = orderData.payments.filter(payment => 
      payment.type === "POST_FULFILLMENT" && payment.params?.amount
    );
    
    // Calculate total payments and completed payments
    const totalPayments = installments.length;
    const completedPayments = 0; // This would need to come from payment history data
    
    // Create payment history (would be replaced with actual data)
    const paymentHistory = [];
    
    // Extract user name
    const customerName = orderData.fulfillments[0]?.customer?.person?.name || "User";
    const firstName = customerName.split(' ')[0];
    
    // Get next payment date and amount
    const currentDate = new Date();
    const nextPayment = installments.find(payment => {
      const endDate = new Date(payment.time.range.end);
      return endDate >= currentDate && payment.status === "NOT-PAID";
    });
    
    const nextPaymentAmount = nextPayment?.params.amount 
      ? parseFloat(nextPayment.params.amount) 
      : 0;
    
    const nextPaymentDate = nextPayment?.time.range.end 
      ? new Date(nextPayment.time.range.end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : "N/A";
    
    // Calculate remaining amount (this is simplified, would need actual calculation)
    const remainingAmount = parseFloat(totalAmount) - (completedPayments * nextPaymentAmount);
    
    return {
      name: firstName,
      loanAmount: parseFloat(totalAmount),
      remainingAmount: remainingAmount,
      nextPayment: nextPaymentAmount,
      nextPaymentDate: nextPaymentDate,
      completedPayments: completedPayments,
      totalPayments: totalPayments,
      paymentHistory: paymentHistory
    };
  };
  
  // Handle payment option clicks
  const handleForeclosure = async () => {
    try {
      // Call foreclosure API
      const response = await fetch('https://pl.pr.flashfund.in/foreclosure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Navigate to foreclosure component
      router.push('/foreclosure');
    } catch (err) {
      console.error("Failed to process foreclosure:", err);
      setError(err.message);
    }
  };
  
  const handlePrepay = async () => {
    try {
      // Call prepay API
      const response = await fetch('https://pl.pr.flashfund.in/prepay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Navigate to prepay component
      router.push('/prepay');
    } catch (err) {
      console.error("Failed to process prepayment:", err);
      setError(err.message);
    }
  };

  const Search= async()=>{
    const searchResponse = await axios.post(
      `https://pl.pr.flashfund.in/api/search/one`,
      { userId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (searchResponse.data?.context?.transaction_id) {
      console.log('Transaction ID:', searchResponse.data.context.transaction_id);
      
      setTransactionId(searchResponse.data.context.transaction_id)
      router.push('/offer')
    }
    
  }
  
  const handleMissedEmi = async () => {
    try {
      // Call missed EMI API
      const response = await fetch('https://pl.pr.flashfund.in/missed-emi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Navigate to missed EMI component
      router.push('/missed-emi');
    } catch (err) {
      console.error("Failed to process missed EMI payment:", err);
      setError(err.message);
    }
  };
  
  // Modified loading state to indicate we're waiting for userId when that's the case
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading user data...</p>
        </div>
      </div>
    );
  }
  
  // Regular loading state (after userId is available)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading your loan details...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-slate-700 mb-4">We couldn't load your loan information. Please try again later.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }
  
  // If no userData but not loading/error, redirect to main
  if (!userData) {
    router.push('/main');
    return null;
  }
  
  const paymentProgress = (userData.completedPayments / userData.totalPayments) * 100;
  
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
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-semibold text-sm">
                  {userData.name ? userData.name.substring(0, 2).toUpperCase() : "U"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rest of your component remains unchanged */}
        {/* Welcome Back Banner */}
        <div className="max-w-md mx-auto px-5 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-5 mb-6 shadow-lg"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">👋</span>
              </div>
              <h2 className="text-white font-semibold text-xl leading-tight">Welcome back, {userData.name}!</h2>
            </div>
            <p className="text-white/90 text-sm">Your loan is active and in good standing.</p>
          </motion.div>

          {/* Current Loan Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
              <h3 className="font-semibold text-slate-700 text-lg mb-4">Current Loan Status</h3>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-500">Total Loan Amount</span>
                <span className="font-semibold text-slate-800">₹{userData.loanAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500">Remaining Amount</span>
                <span className="font-semibold text-slate-800">₹{userData.remainingAmount.toLocaleString()}</span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Loan Progress</span>
                  <span className="text-xs text-blue-600 font-medium">
                    {userData.completedPayments}/{userData.totalPayments} EMIs
                  </span>
                </div>
                <Progress value={paymentProgress} className="h-2.5 bg-blue-100" />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Next Payment</p>
                    <p className="text-xs text-slate-500">Due on {userData.nextPaymentDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-700">₹{userData.nextPayment.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl h-12"
                onClick={() => setShowPaymentOptions(!showPaymentOptions)}
              >
                Pay Now
              </Button>
              
              {showPaymentOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-2"
                >
                  {/* Foreclosure Button */}
                  <Button
                    onClick={handleForeclosure}
                    className="w-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors rounded-lg p-3 h-auto flex items-center justify-center"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-700 text-sm">🔓</span>
                    </div>
                    <span className="text-sm font-medium">Foreclosure</span>
                  </Button>
                  
                  {/* Prepay Button */}
                  <Button
                    onClick={handlePrepay}
                    className="w-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors rounded-lg p-3 h-auto flex items-center justify-center"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-700 text-sm">💸</span>
                    </div>
                    <span className="text-sm font-medium">Prepay</span>
                  </Button>
                  
                  {/* Missed EMI Button - conditionally shown */}
                  {hasMissedEmi && (
                    <Button
                      onClick={handleMissedEmi}
                      className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded-lg p-3 h-auto flex items-center justify-center"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-red-600 text-sm">⚠️</span>
                      </div>
                      <span className="text-sm font-medium">Pay Missed EMI</span>
                    </Button>
                  )}
                </motion.div>
              )}
            </Card>
          </motion.div>
          
          {/* The rest of your components remain unchanged */}
          {/* New Loan Apply Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-5 rounded-xl shadow-md border-0 bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden relative">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Need Additional Funds?</h3>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg mb-4">
                <p className="text-slate-700 text-sm italic border-l-2 border-blue-400 pl-3">
                  "Financial flexibility when you need it most. Apply for another loan to meet your growing needs."
                </p>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600">Quick Application</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600">Minimal Docs</span>
                </div>
              </div>
              
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl h-12"
              onClick={Search}>
                Apply for New Loan
              </Button>
            </Card>
          </motion.div>
          
          {/* Payment History Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <details className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden">
              <summary className="p-5 font-semibold text-slate-700 cursor-pointer flex justify-between items-center">
                Payment History
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5">
                {userData.paymentHistory && userData.paymentHistory.length > 0 ? (
                  userData.paymentHistory.map((payment, index) => (
                    <div key={index} className="py-3 border-b border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{payment.date}</p>
                        <p className="text-xs text-slate-500">EMI Payment</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-700">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-xs font-medium text-green-600">{payment.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-slate-500 text-sm">
                    No payment history available yet
                  </div>
                )}
              </div>
            </details>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <Card className="p-4 rounded-xl shadow-sm border-0 bg-white/90 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">Help</p>
            </Card>
            
            <Card className="p-4 rounded-xl shadow-sm border-0 bg-white/90 flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">Support</p>
            </Card>
          </motion.div>
          
          {/* ONDC Attribution with premium styling */}
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

export default ReturningUserDashboard;