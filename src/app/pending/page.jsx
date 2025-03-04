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
  const token = useAuthStore((state) => state.token);

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMissedEmi, setHasMissedEmi] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  const processLoanData = (apiData) => {
    if (!apiData || !apiData.loans || apiData.loans.length === 0) {
      return null;
    }

    const loan = apiData.loans[0];

    // Extract customer name
    const customerName = loan.customer.name || "User";
    const firstName = customerName.split(' ')[0];

    // Calculate total loan amount from breakdown
    const totalLoanAmount = loan.breakdown.find(item => item.title === "NET_DISBURSED_AMOUNT")?.amount || 0;

    // Get payment schedule details
    const paymentSchedule = loan.paymentSchedule;
    const totalPayments = paymentSchedule.length;

    // Find next payment
    const currentDate = new Date();
    const nextPayment = paymentSchedule.find(payment => {
      const endDate = new Date(payment.endDate);
      return endDate >= currentDate && payment.status === "NOT-PAID";
    });

    return {
      name: firstName,
      loanAmount: parseFloat(totalLoanAmount),
      remainingAmount: parseFloat(totalLoanAmount), // Simplified, might need more precise calculation
      nextPayment: nextPayment ? parseFloat(nextPayment.amount) : 0,
      nextPaymentDate: nextPayment 
        ? new Date(nextPayment.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : "N/A",
      completedPayments: paymentSchedule.filter(p => p.status === "PAID").length,
      totalPayments: totalPayments,
      paymentHistory: [] // You might want to populate this from actual payment history
    };
  };

  useEffect(() => {
    if (!userId) {
      console.log("Waiting for userId to be available...");
      return;
    }

    const fetchLoanStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://pl.pr.flashfund.in/check-loan-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.log("No active loans found");
            router.push('/main');
            return;
          }
          throw new Error(`Error fetching loan status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.totalLoans || data.totalLoans === 0 || !data.loans || data.loans.length === 0) {
          console.log("No active loans found in response");
          router.push('/main');
          return;
        }

        const transactionId = data.loans[0]?.transactionId;
        if (transactionId) {
          setTransactionId(transactionId);
        }

        const loanData = processLoanData(data);
        setUserData(loanData);

        const missedEmis = data.loans[0].paymentSchedule.filter(payment => 
          payment.status === "NOT-PAID" && 
          new Date(payment.endDate) < new Date()
        );

        setHasMissedEmi(missedEmis.length > 0);

      } catch (err) {
        console.error("Failed to fetch loan status:", err);
        setError(err.message);
        router.push('/main');
      } finally {
        setLoading(false);
      }
    };

    fetchLoanStatus();
  }, [userId, router]);

  const handleForeclosure = async () => {
    try {
      if (!transactionId) {
        const loanStatusResponse = await fetch('https://pl.pr.flashfund.in/check-loan-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });

        if (!loanStatusResponse.ok) {
          throw new Error(`Error fetching loan status: ${loanStatusResponse.status}`);
        }

        const loanData = await loanStatusResponse.json();
        const txnId = loanData.loans[0]?.response?.context?.transaction_id;

        if (!txnId) {
          throw new Error("Transaction ID not found in loan data");
        }

        setTransactionId(txnId);

        const response = await fetch('https://pl.pr.flashfund.in/foreclosure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transaction_id: txnId })
        });

        if (!response.ok) {
          throw new Error(`Foreclosure API Error: ${response.status}`);
        }
      } else {
        const response = await fetch('https://pl.pr.flashfund.in/foreclosure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transactionId: transactionId })
        });

        if (!response.ok) {
          throw new Error(`Foreclosure API Error: ${response.status}`);
        }
      }

      router.push('/foreclosure');
    } catch (err) {
      console.error("Failed to process foreclosure:", err);
      setError(err.message);
    }
  };

  const handlePrepay = async () => {
    try {
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

      router.push('/prepay');
    } catch (err) {
      console.error("Failed to process prepayment:", err);
      setError(err.message);
    }
  };

  const Search = async () => {
    const searchResponse = await axios.post(
      `https://pl.pr.flashfund.in/api/search/one`,
      { userId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (searchResponse.data?.context?.transaction_id) {
      setTransactionId(searchResponse.data.context.transaction_id);
      router.push('/offer');
    }
  };

  const handleMissedEmi = async () => {
    try {
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

      router.push('/missed-emi');
    } catch (err) {
      console.error("Failed to process missed EMI payment:", err);
      setError(err.message);
    }
  };

  if (!userId) {
    return (
      <div className="loader">
        <div className="waves"></div>
        <p className="text-slate-700">Loading user data...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="waves"></div>
        <p className="text-slate-700">Loading user data...</p>
      </div>
    );
  }

  if (!userData) {
    router.push('/main');
    return null;
  }

  const paymentProgress = (userData.completedPayments / userData.totalPayments) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pb-8">
      <div className="absolute inset-0 overflow-hidden z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,255,0.4)_0%,rgba(0,0,255,0.1)_90%)]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.4)_0%,rgba(59,130,246,0.1)_70%)]"></div>
      </div>

      <div className="relative z-10">
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
                  <Button
                    onClick={handleForeclosure}
                    className="w-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors rounded-lg p-3 h-auto flex items-center justify-center"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-700 text-sm">🔓</span>
                    </div>
                    <span className="text-sm font-medium">Foreclosure</span>
                  </Button>
                  
                  <Button
                    onClick={handlePrepay}
                    className="w-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors rounded-lg p-3 h-auto flex items-center justify-center"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-700 text-sm">💸</span>
                    </div>
                    <span className="text-sm font-medium">Prepay</span>
                  </Button>
                  
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

      {/* Error Display at the Bottom */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 bg-red-100 p-4 text-center text-red-700 font-medium shadow-lg"
        >
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-700 hover:text-red-900"
          >
            &times;
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default ReturningUserDashboard;