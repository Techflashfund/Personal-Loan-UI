'use client'
import React, { useEffect, useState, useCallback } from 'react';
import useUserStore from '@/store/user';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgeIndian, Wallet, GraduationCap, BanknoteIcon, ArrowUpDown, Loader2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useRouter } from 'next/navigation';
const {motion} = require('framer-motion');

const LoanOffers = () => {
  const router = useRouter();
  const transactionId = useUserStore((state) => state.transactionId);
  const setProviderId = useUserStore((state) => state.setProviderId)
  const userId = useUserStore((state) => state.userId);
  const token = useAuthStore((state) => state.token)
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanAmounts, setLoanAmounts] = useState({});
  const [emiAmounts, setEmiAmounts] = useState({}); // New state for EMI calculations
  const [sortType, setSortType] = useState(null);
  const [initialLoadingComplete, setInitialLoadingComplete] = useState(false);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [applyingId, setApplyingId] = useState(null); // Track which offer is being submitted
  const [fetchAttempts, setFetchAttempts] = useState(0); // Track fetch attempts
  if (!userId || !token) {
    router.push('/signin')
    return
  }
  // Define fetchOffers as a useCallback to properly include it in dependency arrays
  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching offers for transaction:', transactionId);

      const response = await fetch('https://pl.pr.flashfund.in/loan/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }

      const data = await response.json();
      setOffers(data);
      
      // Initialize loan and EMI amounts
      const initialAmounts = {};
      const initialEmiAmounts = {};
      
      data.forEach(offer => {
        const initialLoanAmount = offer.loanAmount / 2;
        initialAmounts[offer.lenderId] = initialLoanAmount;
        
        // Calculate initial EMI based on the initial loan amount
        const calculatedEmi = calculateEMI(initialLoanAmount, offer.interestRate, offer.term);
        initialEmiAmounts[offer.lenderId] = calculatedEmi;
      });
      
      setLoanAmounts(initialAmounts);
      setEmiAmounts(initialEmiAmounts);
      setOffersLoaded(true);
    } catch (err) {
      setError(err.message);
      // Increment fetch attempts on failure
      setFetchAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  // Function to calculate EMI
  const calculateEMI = (principal, interestRate, termInMonths) => {
    // Convert annual interest rate to monthly and decimal form
    const monthlyInterestRate = (parseFloat(interestRate) / 100) / 12;
    const termInMonthsNum = parseInt(termInMonths);
    
    // Calculate EMI using the formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = 
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termInMonthsNum)) / 
      (Math.pow(1 + monthlyInterestRate, termInMonthsNum) - 1);
    
    return Math.round(emi);
  };

  // Initial loading effect
  useEffect(() => {
    // Initial loading animation for 7 seconds on first render only
    const loadingTimer = setTimeout(() => {
      setInitialLoadingComplete(true);
      fetchOffers();
    }, 7000);

    return () => clearTimeout(loadingTimer);
  }, [fetchOffers]);

  // Effect to handle retry on error
  useEffect(() => {
    // If there was an error and we've tried less than 3 times, retry after 2 seconds
    if (error && fetchAttempts < 3 && initialLoadingComplete) {
      const retryTimer = setTimeout(() => {
        console.log(`Retry attempt ${fetchAttempts + 1}...`);
        fetchOffers();
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [error, fetchAttempts, fetchOffers, initialLoadingComplete]);

  const handleSliderChange = (value, lenderId) => {
    const selectedOffer = offers.find(offer => offer.lenderId === lenderId);
    const newLoanAmount = value[0];
    
    // Update loan amount
    setLoanAmounts(prev => ({
      ...prev,
      [lenderId]: newLoanAmount
    }));
    
    // Calculate and update EMI based on the new loan amount
    if (selectedOffer) {
      const newEmi = calculateEMI(newLoanAmount, selectedOffer.interestRate, selectedOffer.term);
      setEmiAmounts(prev => ({
        ...prev,
        [lenderId]: newEmi
      }));
    }
  };

  const handleSort = (type) => {
    const sortedOffers = [...offers];
    if (type === 'amount') {
      sortedOffers.sort((a, b) => sortType === 'amount' ? a.loanAmount - b.loanAmount : b.loanAmount - a.loanAmount);
      setSortType(sortType === 'amount' ? 'amount-desc' : 'amount');
    } else if (type === 'interest') {
      sortedOffers.sort((a, b) => sortType === 'interest' ? a.interestRate - b.interestRate : b.interestRate - a.interestRate);
      setSortType(sortType === 'interest' ? 'interest-desc' : 'interest');
    }
    setOffers(sortedOffers);
  };

  const handleApply = async (lenderId) => {
    try {
      setApplyingId(lenderId); // Set loading state for this specific button
      const selectedAmount = loanAmounts[lenderId];
      const response = await fetch('https://pl.pr.flashfund.in/amount/submit-amount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount.toString(),
          userId: userId,
          transactionId: transactionId,
          providerId: lenderId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit amount');
      }

      // Handle successful submission
      const data = await response.json();
      setProviderId(lenderId)
      console.log('Amount submitted:', data);
      router.push('/bankdetails');
      
    } catch (error) {
      console.error('Error submitting amount:', error);
      setApplyingId(null); // Reset loading state if there's an error
    }
  };

  // Show loading animation if either initial loading or offers are still loading
  const showLoading = !initialLoadingComplete || (initialLoadingComplete && isLoading);

  // Render loading animation
  if (showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Image 
              src="/FlashfundLogo.png"
              alt="FlashFund logo"
              width={180}
              height={110}
              className="w-36"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="text-2xl font-bold mb-2 text-center text-slate-800">
              Finding the best offers for you
            </div>
            <div className="flex space-x-2 mt-4">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-md text-center text-slate-600 text-sm px-4"
          >
            We're comparing loan options from multiple lenders to find the best rates and terms for your needs.
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Premium Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto p-6 flex flex-col items-center">
          <div className="mb-4">
            <Image 
              src="/FlashfundLogo.png"
              alt="FlashFund logo"
              width={180}
              height={110}
              className="w-44"
            />
          </div>
          <div className="text-lg font-semibold text-gray-600">
            <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">PREMIUM</span>
            <span className="ml-2">Loan Offers for You</span>
          </div>
        </div>
      </div>

      {/* Sort Buttons - Centered */}
      <div className="max-w-lg mx-auto w-full px-4 py-3 flex justify-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSort('amount')}
          className="flex items-center gap-1"
        >
          Amount
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSort('interest')}
          className="flex items-center gap-1"
        >
          Interest
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content Area with Scroll */}
      <div className="flex-grow overflow-hidden">
        {/* Offers Container */}
        <div className="max-w-lg mx-auto p-4 space-y-4 overflow-y-auto h-[calc(100vh-280px)]">
          {error && fetchAttempts >= 3 ? (
            <div className="text-center py-8 text-red-500">
              <p>Failed to load offers. Please try again later.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setFetchAttempts(0);
                  fetchOffers();
                }}
              >
                Retry
              </Button>
            </div>
          ) : offers.length === 0 && !isLoading && !error ? (
            <div className="text-center py-8 text-gray-500">
              <p>No offers available at the moment.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setFetchAttempts(0);
                  fetchOffers();
                }}
              >
                Check Again
              </Button>
            </div>
          ) : (
            offers.map((offer, index) => (
              <div key={index} className="card mx-auto">
                <div className="card-inner">
                  {/* Front Side */}
                  <div className="card-front bg-gradient-to-r from-[#6A2C70] via-purple-500 to-purple-700">
                    <div className="space-y-3 w-full p-4">
                      <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-2">
                          <BanknoteIcon className="w-6 h-6" />
                          <h3 className="font-semibold">{offer.lenderName}</h3>
                        </div>
                        <span className="text-sm bg-white/20 px-2 py-1 rounded">
                          {offer.interestRate}interest
                        </span>
                      </div>
                      
                      <div className="text-center mt-2">
                        <p className="text-2xl font-bold">₹{offer.loanAmount.toLocaleString()}</p>
                        <p className="text-sm opacity-80">Maximum Amount</p>
                      </div>
                      
                      <div className="text-sm text-center">
                        <p className="opacity-80"><span className='text-xl underline'>Tap</span> to see more details</p>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="card-back">
                    <div className="w-full p-4 space-y-3">
                      <div className="space-y-2">
                        <Slider
                          defaultValue={[loanAmounts[offer.lenderId] || offer.loanAmount / 2]}
                          max={offer.loanAmount}
                          min={offer.loanAmount * 0.2}
                          step={1000}
                          className="my-2"
                          onValueChange={(value) => handleSliderChange(value, offer.lenderId)}
                        />
                        <p className="text-center font-bold">
                          ₹{loanAmounts[offer.lenderId]?.toLocaleString() || (offer.loanAmount / 2).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Term:</span>
                          <span>{offer.term} </span>
                        </div>
                        <div className="flex justify-between">
                          <span>EMI:</span>
                          <span>₹{emiAmounts[offer.lenderId]?.toLocaleString() || offer.installmentAmount.toLocaleString()}/mo</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-white text-[#F08A5D] hover:bg-white/90 font-semibold"
                        onClick={() => handleApply(offer.lenderId)}
                        disabled={applyingId === offer.lenderId}
                      >
                        {applyingId === offer.lenderId ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ONDC Footer */}
      <div className="w-full bg-white py-4 mt-auto border-t">
        <p className="text-sm text-slate-600 flex items-center justify-center">
                    Powered by <Image 
                    src="/ondc-network-vertical.png"
                    alt="FlashFund logo"
                    width={100}
                    height={60}
                    className="w-35"
                  />
                  </p>
      </div>

      <style jsx>{`
        .card {
          width: 100%;
          max-width: 340px;
          height: 200px;
          perspective: 1000px;
          margin: 0 auto;
          touch-action: manipulation;
        }

        @media (max-width: 640px) {
          .card {
            height: 180px;
          }
        }

        .card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.999s;
        }

        .card:hover .card-inner,
        .card:active .card-inner {
          transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .card-front {
          background-color: ;
          color: #fff;
          display: flex;
          align-items: center;
          
          transform: rotateY(0deg);
        }

        .card-back {
          background-color: #F08A5D;
          color: #fff;
          display: flex;
          align-items: center;
          border: 10px solid #F08A5D;
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default LoanOffers;