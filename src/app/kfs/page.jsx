'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/user';

const KeyFactsStatement = () => {
  const router = useRouter();
  const [hasConsent, setHasConsent] = useState(false);
  const { originalRequest } = useAuthStore();
  const [loanData, setLoanData] = useState(null);

  useEffect(() => {
    if (originalRequest) {
      // Extract relevant data from the original request
      const message = originalRequest?.message;
      const order = message?.order;
      const provider = order?.provider;
      const items = order?.items;
      const quote = order?.quote;
      
      if (order && provider && items && quote) {
        const loanItem = items.find(item => item.descriptor.code === "PERSONAL_LOAN");
        const loanInfo = loanItem?.tags?.find(tag => tag.descriptor.code === "LOAN_INFO");
        
        // Prepare the data structure for the KFS
        setLoanData({
          provider: provider.descriptor.name,
          productType: loanItem?.descriptor.name || "Personal Loan",
          principal: quote.breakup.find(item => item.title === "PRINCIPAL")?.price.value || "0",
          interest: quote.breakup.find(item => item.title === "INTEREST")?.price.value || "0",
          processingFee: quote.breakup.find(item => item.title === "PROCESSING_FEE")?.price.value || "0",
          insuranceCharges: quote.breakup.find(item => item.title === "INSURANCE_CHARGES")?.price.value || "0",
          otherCharges: quote.breakup.find(item => item.title === "OTHER_CHARGES")?.price.value || "0",
          netDisbursedAmount: quote.breakup.find(item => item.title === "NET_DISBURSED_AMOUNT")?.price.value || "0",
          totalRepayment: quote.price.value || "0",
          interestRate: loanInfo?.list.find(item => item.descriptor.code === "INTEREST_RATE")?.value || "N/A",
          loanTerm: loanInfo?.list.find(item => item.descriptor.code === "TERM")?.value || "N/A",
          interestType: loanInfo?.list.find(item => item.descriptor.code === "INTEREST_RATE_TYPE")?.value || "N/A",
          apr: loanInfo?.list.find(item => item.descriptor.code === "ANNUAL_PERCENTAGE_RATE")?.value || "N/A",
          installmentAmount: loanInfo?.list.find(item => item.descriptor.code === "INSTALLMENT_AMOUNT")?.value || "N/A",
          installments: loanInfo?.list.find(item => item.descriptor.code === "NUMBER_OF_INSTALLMENTS_OF_REPAYMENT")?.value || "N/A",
          repaymentFrequency: loanInfo?.list.find(item => item.descriptor.code === "REPAYMENT_FREQUENCY")?.value || "N/A",
          foreclosureFee: loanInfo?.list.find(item => item.descriptor.code === "FORECLOSURE_FEE")?.value || "N/A",
          delayPenalty: loanInfo?.list.find(item => item.descriptor.code === "DELAY_PENALTY_FEE")?.value || "N/A",
          coolOffPeriod: loanInfo?.list.find(item => item.descriptor.code === "COOL_OFF_PERIOD")?.value || "N/A",
          applicationFee: loanInfo?.list.find(item => item.descriptor.code === "APPLICATION_FEE")?.value || "N/A",
          tncLink: loanInfo?.list.find(item => item.descriptor.code === "TNC_LINK")?.value || "#",
          kfsLink: loanInfo?.list.find(item => item.descriptor.code === "KFS_LINK")?.value || "#"
        });
      }
    }
  }, [originalRequest]);

  const handleContinue = () => {
    if (hasConsent) {
      router.push('/bankdetails');
    }
  };

  if (!loanData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">Key Facts Statement</h1>
      <p className="mb-4 text-sm text-gray-600">As per RBI guidelines, this Key Facts Statement provides the important information about your loan in a simple and easy-to-understand format.</p>
      
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <div className="bg-blue-50 p-3 rounded mb-4">
          <h2 className="text-lg font-semibold text-blue-800">{loanData.provider} - {loanData.productType}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Loan Details</h3>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Principal Amount</span>
              <span className="font-medium">{formatCurrency(loanData.principal)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Interest Rate</span>
              <span className="font-medium">{loanData.interestRate}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Loan Term</span>
              <span className="font-medium">{loanData.loanTerm}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Interest Type</span>
              <span className="font-medium">{loanData.interestType}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Annual Percentage Rate (APR)</span>
              <span className="font-medium">{loanData.apr}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Repayment Structure</h3>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Total Repayment Amount</span>
              <span className="font-medium">{formatCurrency(loanData.totalRepayment)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Installment Amount</span>
              <span className="font-medium">{formatCurrency(loanData.installmentAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Number of Installments</span>
              <span className="font-medium">{loanData.installments}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Repayment Frequency</span>
              <span className="font-medium">{loanData.repaymentFrequency}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold text-gray-700">Fees and Charges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Processing Fee</span>
              <span className="font-medium">{formatCurrency(loanData.processingFee)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Application Fee</span>
              <span className="font-medium">{loanData.applicationFee}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Insurance Charges</span>
              <span className="font-medium">{formatCurrency(loanData.insuranceCharges)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Other Charges</span>
              <span className="font-medium">{formatCurrency(loanData.otherCharges)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Net Disbursed Amount</span>
              <span className="font-medium">{formatCurrency(loanData.netDisbursedAmount)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold text-gray-700">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Foreclosure Penalty</span>
              <span className="font-medium">{loanData.foreclosureFee}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Delay Penalty</span>
              <span className="font-medium">{loanData.delayPenalty}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-2">
              <span className="text-gray-600">Cool-off Period</span>
              <span className="font-medium">{loanData.coolOffPeriod}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Important Links</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Terms & Conditions</span>
            <a href={loanData.tncLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Detailed Key Facts Statement</span>
            <a href={loanData.kfsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Please read all terms and conditions carefully before proceeding. The information provided in this Key Facts Statement is a summary and does not replace the detailed loan agreement.
        </p>
      </div>

      <div className="mb-6">
        <label className="flex items-start space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="mt-1 h-4 w-4 text-blue-600 rounded"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            I have read and understood the Key Facts Statement. I acknowledge that the information provided is accurate and I consent to proceed with the loan application process.
          </span>
        </label>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleContinue} 
          disabled={!hasConsent}
          className={`px-6 py-2 rounded-lg font-medium ${hasConsent ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Continue to Bank Details
        </button>
      </div>
    </div>
  );
};

export default KeyFactsStatement;