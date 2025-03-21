// utils/loanUtils.js
import useAuthStore from '@/store/user';
import { useRouter } from 'next/navigation';

// Process loan data into a more usable format
export const processLoanData = (loan) => {
  if (!loan) {
    return null;
  }

  // Extract customer name
  const customerName = loan.customer?.name || "User";
  const firstName = customerName.split(' ')[0];

  // Calculate total loan amount and net disbursed amount
  const totalLoanAmount = parseFloat(loan.loanDetails.amount) || 0;
  const netDisbursedAmount = loan.breakdown?.net_disbursed_amount?.amount
    ? parseFloat(loan.breakdown.net_disbursed_amount.amount)
    : 0;

  // Get payment schedule details
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
    payment.status === "NOT-PAID" &&
    new Date(payment.dueDate) < new Date()
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

// Handle foreclosure process
export const handleForeclosure = async (transactionId) => {
  const router = useRouter();
  const setForeclosureTransactionId = useAuthStore(state => state.setForeclosureTransactionId);

  try {
    // First get foreclosure details
    const detailsResponse = await fetch('https://pl.pr.flashfund.in/foreclosure/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactionId })
    });

    if (!detailsResponse.ok) {
      throw new Error(`Foreclosure details API Error: ${detailsResponse.status}`);
    }

    const foreDetails = await detailsResponse.json();

    // Proceed with foreclosure
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
    throw err;
  }
};

// Handle prepayment process
export const handlePrepay = async (transactionId, amount) => {
  const router = useRouter();
  const setprepaymentTransactionId = useAuthStore(state => state.setprepaymentTransactionId);

  if (!amount || isNaN(parseFloat(amount)) ){
    throw new Error("Please enter a valid prepayment amount")
  }

  try {
    const response = await fetch('https://pl.pr.flashfund.in/prepayment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transactionId,
        amount: parseFloat(amount)
      })
    });

    if (!response.ok) {
      throw new Error(`Prepayment API Error: ${response.status}`);
    }

    setprepaymentTransactionId(transactionId);
    router.push('/prepay');
  } catch (err) {
    console.error("Failed to process prepayment:", err);
    throw err;
  }
};

// Handle missed EMI payment
export const handleMissedEmi = async (transactionId) => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);

  try {
    const response = await fetch('https://pl.pr.flashfund.in/missed-emi', {
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

    router.push('/missed-emi');
  } catch (err) {
    console.error("Failed to process missed EMI payment:", err);
    throw err;
  }
};

// Handle support ticket creation
export const handleSupportTicket = (transactionId) => {
  const router = useRouter();
  const setIgmTransactionId = useAuthStore(state => state.setIgmTransactionId);

  setIgmTransactionId(transactionId);
  router.push('/igm');
};

// Handle document download
export const handleDownloadDocument = (url) => {
  window.open(url, '_blank');
};