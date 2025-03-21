'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import useAuthStore from '@/store/user';
import Link from 'next/link';
import Image from "next/image";
import { motion } from "framer-motion";
import { ClosedLoans } from '@/components/ClosedLoans';

const ReturningUserDashboard = () => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token);
  const setForeclosureTransactionId = useAuthStore(state => state.setForeclosureTransactionId);
  const setprepaymentTransactionId = useAuthStore(state => state.setprepaymentTransactionId);
  const setMissedemiTransactionID = useAuthStore(state => state.setMissedemiTransactionID);
  const setIgmTransactionId = useAuthStore(state => state.setIgmTransactionId);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMissedEmi, setHasMissedEmi] = useState(false);
  const [loans, setLoans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [prepayAmount, setPrepayAmount] = useState('');
  const [showPrepayInput, setShowPrepayInput] = useState(false);
  const [foreclosureDetails, setForeclosureDetails] = useState(null);
  const [showForeclosureDetails, setShowForeclosureDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // New state for active tab

  const loansPerPage = 1;

  const processLoanData = (loan) => {
    if (!loan) {
      return null;
    }

    // Extract customer name - Using placeholder since customer details might be missing in new structure
    const customerName = loan.customer?.name || userId || "User";
    const firstName = customerName.split(' ')[0];

    // Calculate total loan amount and net disbursed amount from new structure
    const totalLoanAmount = parseFloat(loan.loanDetails.amount) || 0;
    
    // Extract net disbursed amount from breakdown (which is now an object with named properties)
    const netDisbursedAmount = loan.breakdown?.net_disbursed_amount?.amount 
      ? parseFloat(loan.breakdown.net_disbursed_amount.amount) 
      : 0;

    // Get payment schedule details from the new payments array
    const paymentSchedule = loan.payments.installments || [];
    const totalPayments = paymentSchedule.length;

    // Find next payment
    const currentDate = new Date();
    const nextPayment = paymentSchedule.find(payment => {
      const dueDate = new Date(payment.dueDate);
      return dueDate >= currentDate && payment.status === "NOT-PAID";
    });

    // Check if all EMIs are paid or deferred
    const allEmisPaidOrDeferred = paymentSchedule.every(payment => 
      payment.status === "PAID" || payment.status === "DEFERRED"
    );

    // Count completed payments
    const completedPayments = paymentSchedule.filter(p => 
      p.status === "PAID" || p.status === "DEFERRED"
    ).length;

    // Check for missed EMIs
    const missedEmis = paymentSchedule.filter(payment => 
      payment.status === "DELAYED" 
    );

    // Format payment schedule for display
    const formattedPaymentSchedule = paymentSchedule.map(payment => ({
      installmentId: payment.installmentId,
      amount: payment.amount,
      status: payment.status,
      endDate: payment.dueDate,
      startDate: payment.startDate
    }));

    return {
      name: firstName,
      loanAmount: totalLoanAmount,
      netDisbursedAmount: netDisbursedAmount,
      nextPayment: nextPayment ? parseFloat(nextPayment.amount) : 0,
      nextPaymentDate: nextPayment 
        ? new Date(nextPayment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : "N/A",
      completedPayments: completedPayments,
      totalPayments: totalPayments,
      paymentSchedule: formattedPaymentSchedule,
      isLoanClosed: allEmisPaidOrDeferred,
      hasMissedEmi: missedEmis.length > 0,
      transactionId: loan.transactionId,
      providerName: loan.provider?.name || "Lender",
      providerLogo: loan.provider?.logo || "",
      interestRate: loan.loanDetails?.interestRate || "N/A",
      term: loan.loanDetails?.term || "N/A",
      documents: loan.documents || []
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

        // Process each loan and store them
        const processedLoans = data.loans.map(loan => ({
          ...loan,
          processedData: processLoanData(loan)
        }));
        
        setLoans(processedLoans);
        
        // Set first loan's processed data for backward compatibility
        setUserData(processedLoans[0].processedData);
        
        // Check for missed EMIs in the first loan
        setHasMissedEmi(processedLoans[0].processedData.hasMissedEmi);

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

  // Pagination logic
  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = loans.slice(indexOfFirstLoan, indexOfLastLoan);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleForeclosure = async (loan) => {
    try {
      // First get foreclosure details
      const detailsResponse = await fetch('https://pl.pr.flashfund.in/foreclosure/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionId: loan.transactionId })
      });
      
      if (!detailsResponse.ok) {
        throw new Error(`Foreclosure details API Error: ${detailsResponse.status}`);
      }
      
      const foreDetails = await detailsResponse.json();
      setForeclosureDetails(foreDetails);
      setShowForeclosureDetails(true);
    } catch (err) {
      console.error("Failed to get foreclosure details:", err);
      setError(err.message);
      
      // Fallback to direct foreclosure if details API fails
      proceedWithForeclosure(loan.transactionId);
    }
  };
  
  const proceedWithForeclosure = async (transactionId) => {
    try {
      const response = await fetch('https://pl.pr.flashfund.in/foreclosure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionId })
      });
      
      if (!response.ok) {
        throw new Error(`Foreclosure API Error: ${response.status}`);
      }
      
      setForeclosureTransactionId(transactionId);
      router.push('/foreclosure');
    } catch (err) {
      console.error("Failed to process foreclosure:", err);
      setError(err.message);
    }
  };

  const handlePrepayClick = () => {
    setShowPrepayInput(!showPrepayInput);
  };

  const handlePrepay = async (transactionId) => {
    if (!prepayAmount || isNaN(parseFloat(prepayAmount)) || parseFloat(prepayAmount) <= 0) {
      setError("Please enter a valid prepayment amount");
      return;
    }

    try {
      const response = await fetch('https://pl.pr.flashfund.in/prepayment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          transactionId,
          amount: parseFloat(prepayAmount)
        })
      });

      if (response.ok) {
        setprepaymentTransactionId(transactionId);
        router.push('/prepay');
      } else {
        throw new Error(`Prepayment API Error: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to process prepayment:", err);
      setError(err.message);
    }
  };

  const handleMissedEmi = async (transactionId) => {
    try {
      const response = await fetch('https://pl.pr.flashfund.in/missedemi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId,
          transactionId 
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      setMissedemiTransactionID(transactionId);
      router.push('/missed-emi');
    } catch (err) {
      console.error("Failed to process missed EMI payment:", err);
      setError(err.message);
    }
  };

  const handleSupportTicket = (transactionId) => {
    setIgmTransactionId(transactionId);
    router.push('/igm');
  };
  
  const handleDownloadDocument = (url) => {
    window.open(url, '_blank');
  };

  if (!userId || loading) {
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
                <span className="text-blue-700 font-semibold text-sm">F
                  {/* {userData.name ? userData.name.substring(0, 2).toUpperCase() : "U"} */}
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
              <h2 className="text-white font-semibold text-xl leading-tight">Welcome back !</h2>
            </div>
            <p className="text-white/90 text-sm">
              {loans.length > 1 
                ? `You have ${loans.length} active loans with us.` 
                : "Your loan is active and in good standing."}
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="flex w-full">
              <button
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('active')}
              >
                Active Loans
              </button>
              <button
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  activeTab === 'closed'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('closed')}
              >
                Closed Loans
              </button>
            </div>
          </div>

          {/* Conditional rendering based on active tab */}
          {activeTab === 'active' ? (
            <>
              {/* Active Loans Content */}
              {currentLoans.map((loan, index) => {
                const processedData = loan.processedData;
                const paymentProgress = processedData.completedPayments / processedData.totalPayments * 100;
                
                return (
                  <motion.div
                    key={loan.transactionId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="mb-6"
                  >
                    <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-700 text-lg">
                          Loan {indexOfFirstLoan + index + 1} of {loans.length}
                        </h3>
                        
                        {/* Support Icon Button */}
                        <Button
                          onClick={() => handleSupportTicket(loan.transactionId)}
                          className="p-2 h-8 w-8 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full flex items-center justify-center"
                          title="Get support for this loan"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </Button>
                      </div>
                      
                      {/* Lender Details - New Section */}
                      <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-lg">
                        {processedData.providerLogo && (
                          <Image 
                            src={processedData.providerLogo}
                            alt={`${processedData.providerName} logo`}
                            width={40}
                            height={40}
                            className="w-10 h-10 mr-3 object-contain"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-700">Lender: {processedData.providerName}</p>
                          <p className="text-xs text-slate-500">Term: {processedData.term} | Interest: {processedData.interestRate}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-500">Total Loan Amount</span>
                        <span className="font-semibold text-slate-800">₹{parseInt(processedData.loanAmount).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-500">Net Disbursed Amount</span>
                        <span className="font-semibold text-slate-800">₹{processedData.netDisbursedAmount.toLocaleString()}</span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Loan Progress</span>
                          <span className="text-xs text-blue-600 font-medium">
                            {processedData.completedPayments}/{processedData.totalPayments} EMIs
                          </span>
                        </div>
                        <Progress value={paymentProgress} className="h-2.5 bg-blue-100" />
                      </div>
                      
                      {/* Payment Schedule Preview */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Payment Schedule</p>
                        <div className="overflow-x-auto max-h-36">
                          <table className="w-full text-xs">
                            <thead className="bg-blue-100">
                              <tr>
                                <th className="p-1.5 text-left">Installment</th>
                                <th className="p-1.5 text-left">Due Date</th>
                                <th className="p-1.5 text-left">Amount</th>
                                <th className="p-1.5 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {processedData.paymentSchedule.map((payment, i) => {
                                const dueDate = new Date(payment.endDate).toLocaleDateString('en-IN', { 
                                  day: '2-digit', month: 'short'
                                });
                                
                                let statusColor = "text-yellow-600";
                                if (payment.status === "PAID") {
                                  statusColor = "text-green-600";
                                } else if (payment.status === "NOT-PAID" && new Date(payment.endDate) < new Date()) {
                                  statusColor = "text-red-600";
                                }
                                
                                return (
                                  <tr key={i} className="border-b border-blue-100">
                                    <td className="p-1.5">{payment.installmentNumber}</td>
                                    <td className="p-1.5">{dueDate}</td>
                                    <td className="p-1.5">₹{parseFloat(payment.amount).toLocaleString()}</td>
                                    <td className={`p-1.5 font-medium ${statusColor}`}>
                                      {payment.status === "PAID" ? "Paid" : 
                                       payment.status === "DEFERRED" ? "Deferred" : 
                                       payment.status === "DELAYED" ? "Missed" : 
                                       new Date(payment.endDate) < new Date() ? "NOT-PAID" : "Upcoming"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {/* Documents Section - New */}
                      {processedData.documents && processedData.documents.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <p className="text-sm font-medium text-slate-700 mb-2">Documents</p>
                          <div className="space-y-2">
                            {processedData.documents.map((doc, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <div className="text-xs text-slate-600">{doc.name}</div>
                                <Button 
                                  onClick={() => handleDownloadDocument(doc.url)}
                                  className="h-8 bg-white text-blue-600 hover:bg-blue-100 text-xs px-2"
                                >
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Next Payment Display */}
                      {!processedData.isLoanClosed && processedData.nextPayment > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-slate-700">Next Payment</p>
                              <p className="text-xs text-slate-500">Due on {processedData.nextPaymentDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-blue-700">₹{processedData.nextPayment.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!processedData.isLoanClosed ? (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl h-12"
                          onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                        >
                          Pay Now
                        </Button>
                      ) : (
                        <div className="w-full bg-green-100 text-green-700 font-medium rounded-xl h-12 flex items-center justify-center">
                          Loan Closed
                        </div>
                      )}
                      
                      {/* Foreclosure Details Modal */}
                      {showForeclosureDetails && foreclosureDetails && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        >
                          <div className="bg-white rounded-xl p-5 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Foreclosure Details</h3>
                            
                            <div className="space-y-3 mb-6">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Principal Outstanding</span>
                                <span className="font-medium">₹{(foreclosureDetails.principalOutstanding || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Interest Due</span>
                                <span className="font-medium">₹{(foreclosureDetails.interestDue || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Foreclosure Fee</span>
                                <span className="font-medium">₹{(foreclosureDetails.foreclosureFee || 0).toLocaleString()}</span>
                              </div>
                              {foreclosureDetails.penalties > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">Penalties</span>
                                  <span className="font-medium">₹{foreclosureDetails.penalties.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="pt-3 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-base font-medium text-slate-800">Total Amount</span>
                                  <span className="text-lg font-bold text-blue-700">₹{(foreclosureDetails.totalAmount || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-3">
                              <Button
                                onClick={() => setShowForeclosureDetails(false)}
                                className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowForeclosureDetails(false);
                                  proceedWithForeclosure(loan.transactionId);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Proceed
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {showPaymentOptions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-2"
                        >
                          <Button
                            onClick={() => handleForeclosure(loan)}
                            className="w-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors rounded-lg p-3 h-auto flex items-center justify-center"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-700 text-sm">🔓</span>
                            </div>
                            <span className="text-sm font-medium">Foreclosure</span>
                          </Button>
                          
                          <div>
                            <Button
                              onClick={handlePrepayClick}
                              className="w-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors rounded-lg p-3 h-auto flex items-center justify-center"
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-700 text-sm">💸</span>
                              </div>
                              <span className="text-sm font-medium">Prepay</span>
                            </Button>
                            
                            {showPrepayInput && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.3 }}
                                className="mt-2 space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={prepayAmount}
                                    onChange={(e) => setPrepayAmount(e.target.value)}
                                    className="rounded-lg"
                                  />
                                  <Button 
                                    onClick={() => handlePrepay(loan.transactionId)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                  >
                                    Pay
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                          
                          {processedData.hasMissedEmi && (
                            <Button
                              onClick={() => handleMissedEmi(loan.transactionId)}
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

                      {/* Apply Loan Button shown for all loans */}
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl h-12 mt-4"
                        onClick={() => router.push('/main')}
                      >
                        Apply for a New Loan
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Pagination Controls - only show if more than one loan */}
              {loans.length > 1 && (
                <div className="flex justify-center mt-4 mb-6">
                  {Array.from({ length: Math.ceil(loans.length / loansPerPage) }, (_, i) => (
                    <Button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-700 hover:bg-blue-50"
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <ClosedLoans />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturningUserDashboard;