"use client"

import { useState, useEffect } from 'react'
import useAuthStore from '@/store/user'
import axios from 'axios'
import { motion } from 'framer-motion'
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, Clock, RefreshCw, Home, HelpCircle, ArrowRight } from 'lucide-react'

export default function DisbursementPage() {
  const router = useRouter()
  const transactionId = useAuthStore((state) => state.transactionId)
  const [disbursementStatus, setDisbursementStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loanDetails, setLoanDetails] = useState(null)
  const [countdown, setCountdown] = useState(10)
  const [pollingActive, setPollingActive] = useState(true)

  useEffect(() => {
    console.log('Transaction ID in disbursement page:', transactionId)
    
    if (transactionId) {
      checkDisbursementStatus()
    }
  }, [transactionId])

  useEffect(() => {
    let timer
    if (loading && pollingActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0 && pollingActive) {
      setCountdown(10)
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown, loading, pollingActive])

  const handleIGMSupport = () => {
    router.push('/igmmain')
  }

  const checkDisbursementStatus = async () => {
    if (!transactionId) {
      setError('Transaction ID not found')
      setLoading(false)
      return
    }
    
    try {
      console.log('Checking disbursement status with transactionId:', transactionId)
      
      const response = await axios.post('https://pl.pr.flashfund.in/check-disbursal-status', 
        { transactionId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('Disbursement status response:', response.data)
      
      if (response.data?.message === "Done" && response.data?.loan) {
        setDisbursementStatus('COMPLETED')
        setLoanDetails(response.data.loan)
        setLoading(false)
        setPollingActive(false)
      } else if (response.data?.message === "Pending") {
        setDisbursementStatus('PENDING')
        setTimeout(checkDisbursementStatus, 5000) // Poll every 5 seconds
        setCountdown(10) // Reset countdown
      } else if (response.data?.message === "Failed") {
        setDisbursementStatus('FAILED')
        setLoading(false)
        setPollingActive(false)
      } else {
        setTimeout(checkDisbursementStatus, 5000)
      }
    } catch (error) {
      console.error('Error checking disbursement status:', error)
      
      if (pollingActive) {
        setTimeout(checkDisbursementStatus, 5000)
      }
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setPollingActive(true)
    setCountdown(10)
    checkDisbursementStatus()
  }

  const handleHome = () => {
    router.push('/')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getRepaymentDetails = (loanDetails) => {
    if (!loanDetails?.message?.order?.payments) return null

    const payments = loanDetails.message.order.payments
    const repaymentDetails = payments.filter(payment => payment.type === "POST_FULFILLMENT")

    return repaymentDetails.map(payment => ({
      amount: formatCurrency(payment.params.amount),
      dueDate: formatDate(payment.time.range.start)
    }))
  }
  
  const getTotalRepaymentAmount = (loanDetails) => {
    if (!loanDetails?.message?.order?.quote?.breakup) return null

    const principal = loanDetails.message.order.quote.breakup.find(
      (item) => item.title === "PRINCIPAL"
    )?.price?.value || 0

    const interest = loanDetails.message.order.quote.breakup.find(
      (item) => item.title === "INTEREST"
    )?.price?.value || 0

    const processingFee = loanDetails.message.order.quote.breakup.find(
      (item) => item.title === "PROCESSING_FEE"
    )?.price?.value || 0

    const insuranceCharges = loanDetails.message.order.quote.breakup.find(
      (item) => item.title === "INSURANCE_CHARGES"
    )?.price?.value || 0

    return formatCurrency(Number(principal) + Number(interest) + Number(processingFee) + Number(insuranceCharges))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="container max-w-md mx-auto px-4 py-3 flex items-center justify-between">
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
              className="w-28"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleHome}
            className="p-2 rounded-full bg-blue-50 text-blue-600"
          >
            <Home size={20} />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-md mx-auto px-4 py-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring" }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm flex items-center gap-3"
          >
            <AlertCircle size={20} className="flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
        
        {!transactionId ? (
          <MissingTransactionView handleHome={handleHome} />
        ) : loading ? (
          <LoadingView countdown={countdown} handleIGMSupport={handleIGMSupport} />
        ) : (
          <>
            {disbursementStatus === 'COMPLETED' ? (
              <SuccessView loanDetails={loanDetails} formatCurrency={formatCurrency} getRepaymentDetails={getRepaymentDetails} handleHome={handleHome} />
            ) : disbursementStatus === 'FAILED' ? (
              <FailedView handleRetry={handleRetry} handleHome={handleHome} />
            ) : (
              <UnknownStatusView disbursementStatus={disbursementStatus} handleRetry={handleRetry} handleHome={handleHome} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

// Missing Transaction View
function MissingTransactionView({ handleHome }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-lg text-center"
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
        className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <AlertCircle size={32} className="text-blue-500" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Missing Transaction Information
      </h2>
      <p className="text-gray-600 mb-8">
        We can't process your disbursement without transaction details. Please return to the homepage and try again.
      </p>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-md transition-all duration-200 inline-flex items-center gap-2"
        onClick={handleHome}
      >
        <Home size={18} />
        Return to Home
      </Button>
    </motion.div>
  )
}

// Loading View
function LoadingView({ countdown, handleIGMSupport }) {
  return (
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6"
          animate={{
            boxShadow: ['0px 0px 0px rgba(59, 130, 246, 0)', '0px 0px 30px rgba(59, 130, 246, 0.3)', '0px 0px 0px rgba(59, 130, 246, 0)']
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <RefreshCw size={36} className="text-blue-500" />
          </motion.div>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Processing Your Disbursement
        </h2>
        <p className="text-gray-600 mb-2">
          We're initiating the transfer to your account.
        </p>
        <p className="text-blue-600 font-medium">
          This typically takes just a few minutes.
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: '5%' }}
            animate={{ width: '95%' }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm font-medium text-blue-600">Processing</span>
          <span className="text-sm font-medium text-blue-600">Checking again in {countdown}s</span>
        </div>
      </div>
      
      {/* Info box */}
      <div className="bg-blue-50 p-5 rounded-xl mb-6">
        <div className="flex items-start gap-4">
          <Clock size={22} className="flex-shrink-0 text-blue-600 mt-1" />
          <div>
            <h3 className="text-md font-bold text-blue-800 mb-2">What happens next?</h3>
            <p className="text-sm text-blue-700 leading-relaxed">
              Once the disbursement is complete, you'll receive a confirmation notification. The funds typically reflect in your account within 24 hours, depending on your bank's processing time.
            </p>
          </div>
        </div>
      </div>
      
      {/* Support button */}
      <button 
        onClick={handleIGMSupport} 
        className="w-full py-3 px-4 flex items-center justify-center gap-2 text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
      >
        <HelpCircle size={18} />
        Need help? Contact support
      </button>
    </motion.div>
  )
}

// Success View
function SuccessView({ loanDetails, formatCurrency, getRepaymentDetails, handleHome }) {
  const netAmount = loanDetails?.message?.order?.quote?.breakup?.find(
    (item) => item.title === "NET_DISBURSED_AMOUNT"
  )?.price?.value || "N/A";
  
  const principalAmount = loanDetails?.message?.order?.quote?.breakup?.find(
    (item) => item.title === "PRINCIPAL"
  )?.price?.value || "N/A";
  
  const interestRate = loanDetails?.message?.order?.items?.[0]?.tags
    ?.find((tag) => tag.descriptor.code === "LOAN_INFO")
    ?.list?.find((item) => item.descriptor.code === "INTEREST_RATE")?.value || "N/A";
  
  const repaymentSchedule = getRepaymentDetails(loanDetails)?.slice(0, 1) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Success Header */}
      <div className="p-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <CheckCircle size={40} className="text-white" />
          </motion.div>
        </motion.div>
        <h2 className="text-3xl font-bold text-center mb-3">
          Success!
        </h2>
        <p className="text-center text-green-50 text-lg">
          Your loan amount has been successfully disbursed
        </p>
      </div>
      
      {/* Loan Details */}
      <div className="p-6">
        {/* Net Disbursed Amount */}
        <div className="mb-8">
          <Card className="bg-blue-50 border-none shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-blue-700 font-medium mb-1">Net Disbursed Amount</p>
                <p className="text-3xl font-bold text-blue-900">
                  {netAmount !== "N/A" ? formatCurrency(netAmount) : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Principal and Interest Rate */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-gray-50 border-none">
            <CardContent className="pt-5 pb-5">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Principal Amount</p>
                <p className="text-lg font-bold text-gray-800">
                  {principalAmount !== "N/A" ? formatCurrency(principalAmount) : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 border-none">
            <CardContent className="pt-5 pb-5">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Interest Rate</p>
                <p className="text-lg font-bold text-gray-800">
                  {interestRate}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Next EMI Schedule */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            Next EMI Schedule
          </h3>
          
          {repaymentSchedule.length > 0 ? (
            repaymentSchedule.map((repayment, index) => (
              <Card key={index} className="bg-white border border-gray-200">
                <CardContent className="pt-5 pb-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Due Date</p>
                      <p className="text-md font-bold text-gray-800">{repayment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm mb-1">Amount</p>
                      <p className="text-md font-bold text-gray-800">{repayment.amount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 italic">No EMI schedule available</p>
          )}
        </div>
        
        {/* Information Card */}
        <Card className="mb-8 bg-blue-50 border-none">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                <AlertCircle size={18} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Important Information</h4>
                <p className="text-sm text-blue-700">
                  Your loan has been successfully processed. Please check your bank account for the disbursed amount. Save this information for your records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Home Button */}
        <motion.div 
          className="text-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-10 rounded-xl shadow-md w-full flex items-center justify-center gap-2"
            onClick={handleHome}
          >
            <Home size={18} />
            Go to Home
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Failed View
function FailedView({ handleRetry, handleHome }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-lg text-center"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, -5, 0]
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-400"
      >
        <AlertCircle size={36} className="text-red-500" />
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-3 text-gray-800">
        Disbursement Failed
      </h2>
      
      <p className="text-gray-600 mb-8">
        We encountered an issue while processing your disbursement. This could be due to a technical error or an issue with your bank account details.
      </p>
      
      <div className="space-y-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 h-auto rounded-xl shadow-md flex items-center justify-center gap-2"
            onClick={handleRetry}
          >
            <RefreshCw size={18} />
            Try Again
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium py-4 h-auto rounded-xl flex items-center justify-center gap-2"
            onClick={handleHome}
          >
            <Home size={18} />
            Go to Home
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Unknown Status View
function UnknownStatusView({ disbursementStatus, handleRetry, handleHome }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-lg text-center"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <HelpCircle size={36} className="text-yellow-500" />
      </motion.div>
      
      <h2 className="text-2xl font-bold mb-3 text-gray-800">
        Unexpected Status
      </h2>
      
      <p className="text-gray-600 mb-2">
        Current status: <span className="font-medium">{disbursementStatus || 'Unknown'}</span>
      </p>
      
      <p className="text-gray-600 mb-8">
        We received an unexpected response for your disbursement request. Please try again or contact support.
      </p>
      
      <div className="space-y-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 h-auto rounded-xl shadow-md flex items-center justify-center gap-2"
            onClick={handleRetry}
          >
            <RefreshCw size={18} />
            Try Again
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium py-4 h-auto rounded-xl flex items-center justify-center gap-2"
            onClick={handleHome}
          >
            <Home size={18} />
            Go to Home
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}