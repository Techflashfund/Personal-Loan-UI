'use client'
import React, { useEffect, useState } from 'react';
import useUserStore from '@/store/user';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BanknoteIcon, ArrowUpDown, Loader2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const LoanOffers = () => {
  const router = useRouter();
  const { transactionId, userId, setProviderId,setOriginalRequest } = useUserStore();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanAmounts, setLoanAmounts] = useState({});
  const [sortType, setSortType] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

  // Premium color schemes for cards
  const cardStyles = [
    { gradient: 'from-blue-600 to-indigo-700', badge: 'bg-blue-100 text-blue-800' },
    { gradient: 'from-emerald-600 to-green-700', badge: 'bg-emerald-100 text-emerald-800' },
    { gradient: 'from-amber-600 to-orange-700', badge: 'bg-amber-100 text-amber-800' },
    { gradient: 'from-rose-600 to-pink-700', badge: 'bg-rose-100 text-rose-800' },
    { gradient: 'from-purple-600 to-violet-700', badge: 'bg-purple-100 text-purple-800' }
  ];

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
    // Set a 30-second loading timer before fetching data
    const timer = setTimeout(() => {
      fetchOffers();
    }, 30000); // 30 seconds
    
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

        console.log('saved');
        
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

  // Helper functions
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      style: 'currency',
      currency: 'INR'
    }).replace(/^₹/, '₹ ');
  };

  const formatRate = (rate) => {
    if (!rate) return '';
    return rate.replace(/\.0+%$/, '%');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <Image 
          src="/FlashfundLogo.png"
          alt="FlashFund logo"
          width={150}
          height={80}
          className="mb-8"
          unoptimized
        />
        <div className="text-xl font-bold mb-4 text-center">Finding the best loan offers for you</div>
        <div className="flex space-x-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-center text-gray-500 max-w-sm">Please wait as we compare loan options from multiple lenders. This might take up to 30 seconds.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-lg mx-auto p-4 flex flex-col items-center">
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={150}
            height={80}
            className="mb-2"
            unoptimized
          />
          <h1 className="text-xl font-semibold flex items-center mb-2">
            <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">PREMIUM</span>
            <span className="ml-2">Loan Offers</span>
          </h1>
          
          {/* Sort Buttons */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSort('amount')}
              className="flex items-center gap-1 shadow-sm"
            >
              <span>Amount</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSort('interest')}
              className="flex items-center gap-1 shadow-sm"
            >
              <span>Interest</span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="max-w-lg mx-auto p-4 pb-24">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p>Failed to load offers. Please try again.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchOffers}
            >
              Retry
            </Button>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No offers available at the moment.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchOffers}
            >
              Check Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {offers.map((offer, index) => {
              const colorStyle = cardStyles[index % cardStyles.length];
              const principalAmount = parseInt(offer.principalAmount);
              const currentAmount = loanAmounts[offer.lenderId] || principalAmount;
              
              return (
                <Card 
                  key={offer.lenderId} 
                  className="overflow-hidden shadow-lg rounded-xl"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${colorStyle.gradient} text-white p-4 flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      <BanknoteIcon className="h-5 w-5" />
                      <span className="font-medium">{offer.lenderName}</span>
                    </div>
                    <Badge className={`${colorStyle.badge} px-3 py-1 font-medium`}>
                      {formatRate(offer.interestRate)}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-5">
                    {/* Lender Logo */}
                    {offer.lenderImageUrl && (
                      <div className="flex justify-center h-14 mb-5">
                        <Image 
                          src={offer.lenderImageUrl}
                          alt={`${offer.lenderName} logo`}
                          width={120}
                          height={40}
                          className="h-full w-auto object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    
                    {/* Key Details */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                        <div className="text-xs text-gray-500">Loan Amount</div>
                        <div className="font-semibold">{formatCurrency(principalAmount)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                        <div className="text-xs text-gray-500">Term</div>
                        <div className="font-semibold">{offer.term}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                        <div className="text-xs text-gray-500">EMI</div>
                        <div className="font-semibold">{formatCurrency(offer.installmentAmount)}</div>
                      </div>
                    </div>
                    
                    {/* Processing Fee */}
                    <div className="mb-5">
                      <div className="text-sm font-medium mb-2 flex items-center">
                        <span>Processing Fee:</span>
                        <span className="ml-2 font-semibold">{formatCurrency(offer.processingFee)}</span>
                      </div>
                    </div>
                    
                    {/* Loan Amount */}
                    <div className="mb-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Loan Amount</span>
                        <span className="font-bold">{formatCurrency(currentAmount)}</span>
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
                    
                    {/* Apply Button */}
                    <Button 
                      onClick={() => handleApply(offer.lenderId)}
                      className={`w-full py-6 bg-gradient-to-r ${colorStyle.gradient} text-white hover:opacity-90 rounded-lg shadow-md transition-all hover:shadow-lg`}
                      disabled={applyingId === offer.lenderId}
                    >
                      {applyingId === offer.lenderId ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanOffers;