'use client';
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { motion } from "framer-motion";

const LoanCard = ({ loan, index, totalLoans, handleForeclosure, handlePrepay, handleMissedEmi, handleSupportTicket, handleDownloadDocument }) => {
  const processedData = loan.processedData;
  const paymentProgress = processedData.completedPayments / processedData.totalPayments * 100;
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showPrepayInput, setShowPrepayInput] = useState(false);
  const [prepayAmount, setPrepayAmount] = useState('');
  const [showForeclosureDetails, setShowForeclosureDetails] = useState(false);
  const [foreclosureDetails, setForeclosureDetails] = useState(null);

  return (
    <motion.div
      key={loan.transactionId}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="mb-6"
    >
      <Card className="p-5 rounded-xl shadow-md border-0 bg-white/95 overflow-hidden">
        {/* Loan Card Content */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-700 text-lg">
            Loan {index + 1} of {totalLoans}
          </h3>
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
                         new Date(payment.endDate) < new Date() ? "Missed" : "Upcoming"}
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
                    handleForeclosure(loan.transactionId);
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
                onClick={() => setShowPrepayInput(!showPrepayInput)}
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
                      onClick={() => handlePrepay(loan.transactionId, prepayAmount)}
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
};

export default LoanCard;