'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import useAuthStore from '@/store/user';
import Image from "next/image";
import { motion } from "framer-motion";

export const ClosedLoans = () => {
  const userId = useAuthStore((state) => state.userId);
  const [closedLoans, setClosedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const loansPerPage = 1;

  useEffect(() => {
    if (!userId) {
      console.log("Waiting for userId to be available...");
      return;
    }

    const fetchClosedLoans = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://pl.pr.flashfund.in/check-loan-status/completed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          throw new Error(`Error fetching closed loans: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.totalLoans || data.totalLoans === 0 || !data.loans || data.loans.length === 0) {
          console.log("No closed loans found");
          setClosedLoans([]);
          setLoading(false);
          return;
        }

        // Process the loans with additional display data
        const processedLoans = data.loans.map(loan => ({
          ...loan,
          processedData: processLoanData(loan)
        }));
        
        setClosedLoans(processedLoans);
      } catch (err) {
        console.error("Failed to fetch closed loans:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedLoans();
  }, [userId]);

  const processLoanData = (loan) => {
    if (!loan) {
      return null;
    }

    // Extract customer name (placeholder)
    const customerName = loan.customer?.name || userId || "User";
    const firstName = customerName.split(' ')[0];

    // Calculate total loan amount and net disbursed amount
    const totalLoanAmount = parseFloat(loan.loanDetails?.amount) || 0;
    
    // Extract net disbursed amount from breakdown
    const netDisbursedAmount = loan.breakdown?.net_disbursed_amount?.amount 
      ? parseFloat(loan.breakdown.net_disbursed_amount.amount) 
      : 0;

    // Get payment schedule details
    const paymentSchedule = loan.paymentSchedule || [];
    const totalPayments = paymentSchedule.filter(p => p.type === "INSTALLMENT").length;

    // Check if there's a foreclosure payment
    const foreclosurePayment = paymentSchedule.find(p => p.type === "FORECLOSURE" && p.status === "PAID");
    
    // Get the completion date
    const completionDate = loan.completionDate 
      ? new Date(loan.completionDate).toLocaleDateString('en-IN', { 
          day: '2-digit', month: 'short', year: 'numeric' 
        })
      : "Unknown";

    // Format payment schedule for display
    const formattedPaymentSchedule = paymentSchedule.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      type: payment.type,
      endDate: payment.endDate,
      startDate: payment.startDate
    }));

    return {
      name: firstName,
      loanAmount: totalLoanAmount,
      netDisbursedAmount: netDisbursedAmount,
      completedPayments: totalPayments, // All payments are complete or deferred
      totalPayments: totalPayments,
      paymentSchedule: formattedPaymentSchedule,
      completionDate: completionDate,
      wasForeclosed: !!foreclosurePayment,
      foreclosureAmount: foreclosurePayment ? parseFloat(foreclosurePayment.amount) : null,
      transactionId: loan.transactionId,
      providerName: loan.provider?.name || "Lender",
      providerLogo: loan.provider?.logo || "",
      interestRate: loan.loanDetails?.interestRate || "N/A",
      term: loan.loanDetails?.term || "N/A",
      documents: loan.documents || []
    };
  };

  // Pagination logic
  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = closedLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDownloadDocument = (url) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        {/* <div className="loader">
          <div className="waves"></div>
        </div> */}
        <p className="text-slate-700 mt-4">Loading your closed loans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          <p>We encountered an error while fetching your closed loans.</p>
          <p className="text-sm mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (closedLoans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-blue-50 rounded-xl p-6 mb-6 max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Closed Loans</h3>
          <p className="text-slate-600">You don't have any closed loans yet. They will appear here once completed.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Closed Loans Content */}
      {currentLoans.map((loan, index) => {
        const processedData = loan.processedData;
        
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
                  Closed Loan {indexOfFirstLoan + index + 1} of {closedLoans.length}
                </h3>
                
                {/* Completion Date Badge */}
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  Closed on {processedData.completionDate}
                </div>
              </div>
              
              {/* Lender Details */}
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
              
              {/* Loan Details */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-500">Total Loan Amount</span>
                <span className="font-semibold text-slate-800">₹{parseInt(processedData.loanAmount).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-500">Net Disbursed Amount</span>
                <span className="font-semibold text-slate-800">₹{processedData.netDisbursedAmount.toLocaleString()}</span>
              </div>
              
              {/* Foreclosure Info - Only if applicable */}
              {processedData.wasForeclosed && (
                <div className="flex justify-between items-center mb-1 mt-2 pt-2 border-t border-slate-100">
                  <span className="text-sm text-slate-500">Foreclosed Amount</span>
                  <span className="font-semibold text-slate-800">₹{processedData.foreclosureAmount.toLocaleString()}</span>
                </div>
              )}
              
              {/* Loan Progress - Complete */}
              <div className="mb-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Loan Status</span>
                  <span className="text-xs text-green-600 font-medium">
                    Completed
                  </span>
                </div>
                <Progress value={100} className="h-2.5 bg-blue-100" />
              </div>
              
              {/* Payment Schedule Preview */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Payment History</p>
                <div className="overflow-x-auto max-h-36">
                  <table className="w-full text-xs">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="p-1.5 text-left">ID</th>
                        <th className="p-1.5 text-left">Type</th>
                        <th className="p-1.5 text-left">Amount</th>
                        <th className="p-1.5 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.paymentSchedule.map((payment, i) => {
                        let statusColor = "text-green-600";
                        if (payment.status === "DEFERRED") {
                          statusColor = "text-yellow-600";
                        }
                        
                        return (
                          <tr key={i} className="border-b border-blue-100">
                            <td className="p-1.5">{payment.id}</td>
                            <td className="p-1.5 capitalize">
                              {payment.type.toLowerCase()}
                            </td>
                            <td className="p-1.5">₹{parseFloat(payment.amount).toLocaleString()}</td>
                            <td className={`p-1.5 font-medium ${statusColor} capitalize`}>
                              {payment.status.toLowerCase()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Documents Section */}
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
              
              {/* Status Indicator */}
              <div className="w-full bg-green-100 text-green-700 font-medium rounded-xl h-12 flex items-center justify-center">
                {processedData.wasForeclosed ? "Foreclosed" : "Loan Closed"}
              </div>
            </Card>
          </motion.div>
        );
      })}

      {/* Pagination Controls - only show if more than one loan */}
      {closedLoans.length > 1 && (
        <div className="flex justify-center mt-4 mb-6">
          {Array.from({ length: Math.ceil(closedLoans.length / loansPerPage) }, (_, i) => (
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
    </div>
  );
};