'use client'
import React, { useEffect, useState } from 'react';
import useUserStore from '@/store/user';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BanknoteIcon, ArrowUpDown, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { motion } from "framer-motion"; // Added to match main page animations

const LoanOffers = () => {
  const router = useRouter();
  const { transactionId, userId, setProviderId, setOriginalRequest } = useUserStore();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanAmounts, setLoanAmounts] = useState({});
  const [sortType, setSortType] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

  const fetchOffers = async () => {
    try {
      const response = await fetch('https://pl.pr.flashfund.in/loan/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) throw new Error('Failed to fetch offers');
      
      const data = await response.json();
      setOffers(data);
      
      // Initialize loan amounts to principal amount
      const initialAmounts = {};
      data.forEach(offer => {
        initialAmounts[offer.lenderId] = parseInt(offer.principalAmount);
      });
      setLoanAmounts(initialAmounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set a loading timer before fetching data
    const timer = setTimeout(() => {
      fetchOffers();
    }, 10000); // Reduced from 30s to 10s for better UX
    
    return () => clearTimeout(timer);
  }, [transactionId]);

  const handleSort = (type) => {
    const sortedOffers = [...offers];
    
    if (type === 'amount') {
      sortedOffers.sort((a, b) => sortType === 'amount' ? 
        parseFloat(a.principalAmount) - parseFloat(b.principalAmount) : 
        parseFloat(b.principalAmount) - parseFloat(a.principalAmount));
      setSortType(sortType === 'amount' ? 'amount-desc' : 'amount');
    } else if (type === 'interest') {
      sortedOffers.sort((a, b) => {
        const rateA = parseFloat(a.interestRate.replace('%', ''));
        const rateB = parseFloat(b.interestRate.replace('%', ''));
        return sortType === 'interest' ? rateA - rateB : rateB - rateA;
      });
      setSortType(sortType === 'interest' ? 'interest-desc' : 'interest');
    }
    
    setOffers(sortedOffers);
  };

  const handleSliderChange = (value, lenderId) => {
    setLoanAmounts(prev => ({
      ...prev,
      [lenderId]: value[0]
    }));
  };

  const handleApply = async (lenderId) => {
    try {
      setApplyingId(lenderId);
      const selectedAmount = loanAmounts[lenderId];
      
      // Find the selected offer
      const selectedOffer = offers.find(offer => offer.lenderId === lenderId);
      
      // Save the originalRequest to the store
      if (selectedOffer && selectedOffer.originalRequest) {
        setOriginalRequest(selectedOffer.originalRequest);
      }
  
      const response = await fetch('https://pl.pr.flashfund.in/amount/submit-amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount.toString(),
          userId,
          transactionId,
          providerId: lenderId 
        }),
      });
  
      if (!response.ok) throw new Error('Failed to submit amount');
      
      setProviderId(lenderId);
      router.push('/kfs');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setApplyingId(null);
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'INR'
    }).replace(/^₹/, '₹ ');
  };

  // Format interest rate to remove trailing zeros
  const formatRate = (rate) => {
    if (!rate) return '';
    return rate.replace(/\.0+%$/, '%');
  };

  // Enhanced loading state matching main page style
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 relative w-40"
        >
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={160}
            height={80}
            className="relative z-10"
            unoptimized
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent"
        >
          Finding Your Best Loan Offers
        </motion.div>
        
        <div className="w-full max-w-xs mx-auto">
          <div className="relative h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full animate-loading-bar"></div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center space-y-4 mb-8 w-full max-w-xs"
        >
          <div className="flex items-center space-x-3 w-full bg-white rounded-lg p-3 shadow-md">
            <span className="text-gray-700 text-sm">Comparing interest rates...</span>
          </div>
          <div className="flex items-center space-x-3 w-full bg-white rounded-lg p-3 shadow-md">
            <span className="text-gray-700 text-sm">Finding the best offers for you...</span>
          </div>
        </motion.div>
        
        <style jsx>{`
          @keyframes loadingBar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          .animate-loading-bar {
            animation: loadingBar 10s linear forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Subtle background patterns to match main page */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,255,0.4)_0%,rgba(0,0,255,0.1)_90%)]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.4)_0%,rgba(59,130,246,0.1)_70%)]"></div>
      </div>
      
      {/* Content container with z-index */}
      <div className="relative z-10">
        {/* Header with logo */}
        <div className="pt-6 pb-4 px-6">
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
        </div>

        {/* Page Title with decorative elements */}
        <div className="flex items-center mb-6 px-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200"></div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-slate-800 px-4"
          >
            Loan Offers
          </motion.h1>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200"></div>
        </div>

        {/* Premium Banner */}
        <div className="max-w-md mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-5 mb-8 flex items-center shadow-lg"
          >
            <div className="flex-1">
              <h2 className="text-white font-semibold text-xl leading-tight">Your Personalized Loan Offers</h2>
              <p className="text-white/90 text-sm mt-1">Handpicked for your profile</p>
            </div>
            <div className="w-16 h-16 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <span className="text-3xl">💰</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Sort buttons */}
        <div className="max-w-md mx-auto px-5 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex gap-2 bg-white/80 p-2 rounded-lg shadow-sm">
              <Button 
                variant={sortType?.includes('amount') ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort('amount')}
                className="flex-1 flex items-center justify-center gap-1 rounded-md h-9 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0"
              >
                <span>Amount</span>
                <ArrowUpDown className="h-3 w-3" />
              </Button>
              <Button 
                variant={sortType?.includes('interest') ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort('interest')}
                className="flex-1 flex items-center justify-center gap-1 rounded-md h-9 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0"
              >
                <span>Interest</span>
                <ArrowUpDown className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Offers list */}
        <div className="max-w-md mx-auto px-5 pb-24">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center p-6 rounded-xl shadow-lg border-0">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-2xl">!</span>
                </div>
                <p className="text-red-500 font-medium mb-4">Failed to load offers. Please try again.</p>
                <Button 
                  className="px-6 py-2 rounded-full shadow-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
                  onClick={fetchOffers}
                >
                  Retry
                </Button>
              </Card>
            </motion.div>
          ) : offers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center p-6 rounded-xl shadow-lg border-0">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">?</span>
                </div>
                <p className="text-gray-500 font-medium mb-4">No offers available at the moment.</p>
                <Button 
                  className="px-6 py-2 rounded-full shadow-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
                  onClick={fetchOffers}
                >
                  Check Again
                </Button>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {offers.map((offer, index) => {
                const principalAmount = parseInt(offer.principalAmount);
                const currentAmount = loanAmounts[offer.lenderId] || principalAmount;
                
                return (
                  <motion.div
                    key={offer.lenderId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    className="transform transition duration-200"
                  >
                    <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all border-0">
                      {/* Card header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-white bg-opacity-20 p-1.5 rounded-full mr-2.5">
                              <BanknoteIcon className="h-4 w-4" />
                            </div>
                            <span className="font-bold">{offer.lenderName}</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-semibold rounded-full">
                            {formatRate(offer.interestRate)}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm opacity-90">Loan Amount</div>
                          <div className="text-lg font-bold">{formatCurrency(principalAmount)}</div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4 bg-white">
                        {/* Lender Logo */}
                        {offer.lenderImageUrl && (
                          <div className="mb-4 flex justify-center">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 h-12 w-28 flex items-center justify-center">
                              <Image 
                                src={offer.lenderImageUrl}
                                alt={`${offer.lenderName} logo`}
                                width={100}
                                height={36}
                                className="h-full w-auto object-contain"
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Key Details */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-blue-50 p-3 rounded-xl shadow-sm border border-blue-100">
                            <div className="text-xs text-gray-500 mb-1">Term</div>
                            <div className="font-bold text-gray-800">{offer.term}</div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-xl shadow-sm border border-blue-100">
                            <div className="text-xs text-gray-500 mb-1">EMI</div>
                            <div className="font-bold text-gray-800">{formatCurrency(offer.installmentAmount)}</div>
                          </div>
                        </div>
                        
                        {/* Processing Fee */}
                        <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Processing Fee</span>
                            <span className="font-bold text-blue-700">
                              {formatCurrency(offer.processingFee)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Loan Amount Slider */}
                        <div className="mb-5">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Loan Amount</span>
                            <span className="font-bold text-blue-700">
                              {formatCurrency(currentAmount)}
                            </span>
                          </div>
                          
                          <Slider
                            min={Math.floor(principalAmount * 0.8)}
                            max={principalAmount}
                            step={1000}
                            value={[currentAmount]}
                            onValueChange={(value) => handleSliderChange(value, offer.lenderId)}
                            className="mb-2"
                          />
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatCurrency(Math.floor(principalAmount * 0.8))}</span>
                            <span>{formatCurrency(principalAmount)}</span>
                          </div>
                        </div>
                        
                        {/* Features list - Simplified */}
                        <div className="mb-5 grid grid-cols-2 gap-2">
                          <div className="flex items-center text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
                            <span className="text-gray-700">Quick approval</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
                            <span className="text-gray-700">Minimal documents</span>
                          </div>
                        </div>
                        
                        {/* Apply Button - Matching main page style */}
                        <Button 
                          onClick={() => handleApply(offer.lenderId)}
                          className="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
                          disabled={applyingId === offer.lenderId}
                        >
                          {applyingId === offer.lenderId ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <div className="flex items-center justify-center">
                              <span className="font-bold">Apply Now</span>
                              <ChevronRight className="h-5 w-5 ml-1" />
                            </div>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ONDC Attribution - Matching main page */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center pb-10"
        >
          <div className="inline-flex items-center px-4 py-2 bg-transparent backdrop-blur-sm rounded-full shadow-sm">
            <p className="text-sm text-slate-600 flex items-center justify-center">
              Powered by <Image 
                src="/ondc-network-vertical.png"
                alt="ONDC logo"
                width={100}
                height={60}
                className="w-35"
              />
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Open Network for Digital Commerce
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoanOffers;