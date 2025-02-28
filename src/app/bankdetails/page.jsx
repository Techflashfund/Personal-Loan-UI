'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAuthStore from "@/store/user";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle, AlertCircle, Lock, User, CreditCard, BanknoteIcon } from "lucide-react";

const BankAccountForm = () => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountType: "savings",
    accountNumber: "",
    ifscCode: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(3);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setErrorMessage("");
    setSuccessMessage("");
  };
  
  const handleAccountTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      accountType: value
    }));
    
    setErrorMessage("");
    setSuccessMessage("");
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!userId) {
      setErrorMessage("User ID not found. Please login again.");
      return;
    }
    
    if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode) {
      setErrorMessage("Please fill all required fields");
      return;
    }
    
    const payload = {
      userId,
      ...formData
    };
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('https://pl.pr.flashfund.in/submit-bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save bank account details');
      }
      
      const data = await response.json();
      setSuccessMessage("Your bank account details have been saved successfully!");
      setFormSubmitted(true);
      
      setTimeout(() => {
        router.push('/kycform');
      }, 2500);
      
    } catch (error) {
      console.error('Error saving bank details:', error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress tracker
  const calculateProgress = () => {
    const fieldsFilled = Object.values(formData).filter(Boolean).length;
    const totalFields = Object.keys(formData).length;
    return Math.min(100, Math.round((fieldsFilled / totalFields) * 100));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-6">
      {/* Header with progress */}
      <div className="w-full max-w-md mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={120}
            height={70}
            className="mb-4"
          />
          
          <div className="w-full px-2">
            <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
              <span>Complete Your Profile</span>
              <span>{calculateProgress()}% Complete</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 rounded-xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-5">
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Bank Account Details</h2>
                  <p className="text-xs opacity-90 mt-1">Step 2 of 3: Bank Verification</p>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                  <BanknoteIcon className="w-5 h-5" />
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                {formSubmitted && successMessage ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center py-8 px-4"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        y: [0, -10, 0]
                      }}
                      transition={{ duration: 1.5, ease: "easeInOut", repeat: 1 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
                    >
                      <CheckCircle className="text-white w-12 h-12" />
                    </motion.div>
                    <motion.p 
                      className="text-green-700 text-xl font-semibold text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {successMessage}
                    </motion.p>
                    <motion.div
                      className="text-blue-500 text-sm mt-4 bg-blue-50 rounded-full px-4 py-2 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ChevronRight className="w-4 h-4 mr-1" />
                      </motion.div>
                      Redirecting to KYC verification...
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <AnimatePresence>
                      {errorMessage && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ type: "spring" }}
                          className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start"
                        >
                          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">{errorMessage}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <motion.form 
                      onSubmit={handleSubmit} 
                      className="space-y-5"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="accountHolderName" className="text-sm font-medium flex items-center">
                          <User className="w-4 h-4 mr-1.5 text-blue-500" />
                          Account Holder Name
                        </Label>
                        <Input
                          id="accountHolderName"
                          name="accountHolderName"
                          value={formData.accountHolderName}
                          onChange={handleChange}
                          placeholder="Enter full name as per bank records"
                          className="h-12 rounded-lg border-blue-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 ring-offset-2"
                          required
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label className="text-sm font-medium flex items-center">
                          <BanknoteIcon className="w-4 h-4 mr-1.5 text-blue-500" />
                          Account Type
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div 
                              className={`h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                                formData.accountType === 'savings' 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                  : 'border-gray-200 bg-white text-gray-700'
                              }`}
                              onClick={() => handleAccountTypeChange('savings')}
                            >
                              <input 
                                type="radio" 
                                id="savings" 
                                value="savings" 
                                checked={formData.accountType === 'savings'} 
                                onChange={() => handleAccountTypeChange('savings')} 
                                className="sr-only"
                              />
                              <Label htmlFor="savings" className="cursor-pointer font-medium">
                                Savings
                              </Label>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div 
                              className={`h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                                formData.accountType === 'current' 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                  : 'border-gray-200 bg-white text-gray-700'
                              }`}
                              onClick={() => handleAccountTypeChange('current')}
                            >
                              <input 
                                type="radio" 
                                id="current" 
                                value="current" 
                                checked={formData.accountType === 'current'} 
                                onChange={() => handleAccountTypeChange('current')} 
                                className="sr-only"
                              />
                              <Label htmlFor="current" className="cursor-pointer font-medium">
                                Current
                              </Label>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="accountNumber" className="text-sm font-medium flex items-center">
                          <CreditCard className="w-4 h-4 mr-1.5 text-blue-500" />
                          Account Number
                        </Label>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="relative"
                        >
                          <Input
                            id="accountNumber"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            placeholder="Enter your bank account number"
                            className="h-12 rounded-lg border-blue-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 ring-offset-2 pl-4 pr-10"
                            required
                          />
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                        </motion.div>
                        <p className="text-xs text-gray-500 mt-1">Your data is secured with bank-level encryption</p>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-2">
                        <Label htmlFor="ifscCode" className="text-sm font-medium flex items-center">
                          <BanknoteIcon className="w-4 h-4 mr-1.5 text-blue-500" />
                          IFSC Code
                        </Label>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Input
                            id="ifscCode"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleChange}
                            placeholder="11-character IFSC code"
                            className="h-12 rounded-lg border-blue-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 ring-offset-2 uppercase"
                            required
                          />
                        </motion.div>
                        <p className="text-xs text-gray-500 mt-1">Find your IFSC code on your cheque or bank passbook</p>
                      </motion.div>
                      
                      <motion.div 
                        variants={itemVariants}
                        className="pt-4"
                      >
                        <Button 
                          type="submit" 
                          className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg overflow-hidden relative"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center w-full">
                              <div className="flex space-x-2">
                                <motion.span
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0
                                  }}
                                  className="h-2 w-2 bg-white rounded-full"
                                />
                                <motion.span
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.2
                                  }}
                                  className="h-2 w-2 bg-white rounded-full"
                                />
                                <motion.span
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: 0.4
                                  }}
                                  className="h-2 w-2 bg-white rounded-full"
                                />
                              </div>
                              <span className="ml-2 font-medium">Verifying Details...</span>
                              
                              <motion.div 
                                className="absolute bottom-0 left-0 h-1 bg-white/30"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ 
                                  duration: 2.5,
                                  ease: "easeInOut"
                                }}
                              />
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center justify-center"
                            >
                              <span className="mr-2">Continue to KYC</span>
                              <motion.div
                                animate={{ 
                                  x: [0, 5, 0]
                                }}
                                transition={{ 
                                  duration: 1.5, 
                                  repeat: Infinity
                                }}
                              >
                                <ChevronRight className="w-5 h-5" />
                              </motion.div>
                            </motion.div>
                          )}
                        </Button>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="flex items-center justify-center pt-2">
                        <Lock className="w-3 h-3 mr-1 text-gray-400" />
                        <p className="text-xs text-gray-500">Your information is protected with 256-bit encryption</p>
                      </motion.div>
                    </motion.form>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Enhanced floating decorative elements */}
        <div className="relative z-0">
          <motion.div
            className="absolute top-10 right-0 text-4xl opacity-30"
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            ⚡
          </motion.div>
          
          <motion.div
            className="absolute -bottom-16 -left-8 text-4xl opacity-30"
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            ✨
          </motion.div>
          
          <motion.div
            className="absolute -bottom-10 right-10 text-4xl opacity-30"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          >
            💸
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountForm;