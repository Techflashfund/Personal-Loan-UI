'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAuthStore from "@/store/user";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const BankAccountForm = () => {
  // Initialize router for navigation
  const router = useRouter();
  
  // Get userId from Zustand store
  const userId = useAuthStore((state) => state.userId);
  
  // Form state
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountType: "savings", // Default value
    accountNumber: "",
    ifscCode: ""
  });
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear previous messages when form changes
    setErrorMessage("");
    setSuccessMessage("");
  };
  
  // Handle radio button changes
  const handleAccountTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      accountType: value
    }));
    
    // Clear previous messages when form changes
    setErrorMessage("");
    setSuccessMessage("");
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!userId) {
      setErrorMessage("User ID not found. Please login again.");
      return;
    }
    
    // Validate form
    if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode) {
      setErrorMessage("Please fill all required fields");
      return;
    }
    
    // Prepare data for API
    const payload = {
      userId,
      ...formData
    };
    
    try {
      setIsSubmitting(true);
      
      // Call your API
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
      setSuccessMessage("Your bank account details have been saved.");
      setFormSubmitted(true);
      
      // Navigate to KYC page after showing success animation
      // We'll add a timer to allow the success animation to play
      setTimeout(() => {
        router.push('/kycform');
      }, 2000); // 2 seconds delay
      
    } catch (error) {
      console.error('Error saving bank details:', error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for staggered animation
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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={150}
            height={90}
            className="w-36"
          />
        </motion.div>
      </div>
      
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-blue-100 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold text-center">Bank Account Details</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              {/* Success animation */}
              {formSubmitted && successMessage ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center py-6"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 0, 0, 0, 0, 0, 360]
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
                  >
                    <span className="text-white text-3xl">✓</span>
                  </motion.div>
                  <motion.p 
                    className="text-green-700 text-lg font-medium text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {successMessage}
                  </motion.p>
                  <motion.p
                    className="text-blue-500 text-sm mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Redirecting to KYC page...
                  </motion.p>
                </motion.div>
              ) : (
                <>
                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring" }}
                      className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md"
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                  
                  {successMessage && !formSubmitted && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring" }}
                      className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md"
                    >
                      {successMessage}
                    </motion.div>
                  )}
                  
                  <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="accountHolderName">Account Holder Name</Label>
                      <Input
                        id="accountHolderName"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleChange}
                        placeholder="Enter account holder name"
                        className="rounded-lg border-blue-200 focus:border-blue-500"
                        required
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label>Account Type</Label>
                      <RadioGroup 
                        value={formData.accountType} 
                        onValueChange={handleAccountTypeChange}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="savings" id="savings" />
                          <Label htmlFor="savings" className="cursor-pointer">Savings</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="current" id="current" />
                          <Label htmlFor="current" className="cursor-pointer">Current</Label>
                        </div>
                      </RadioGroup>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2 relative">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="accountNumber"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleChange}
                          placeholder="Enter account number"
                          className="rounded-lg border-blue-200 focus:border-blue-500"
                          required
                        />
                      </motion.div>
                      {/* Decorative element */}
                      <motion.div
                        className="absolute right-2 top-8 text-2xl text-blue-400 opacity-70 pointer-events-none"
                        animate={{ 
                          rotate: [0, 10, 0, -10, 0],
                          opacity: [0.7, 0.9, 0.7]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          repeatType: "reverse" 
                        }}
                      >
                        ₹
                      </motion.div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Input
                          id="ifscCode"
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleChange}
                          placeholder="Enter IFSC code"
                          className="rounded-lg border-blue-200 focus:border-blue-500 uppercase"
                          required
                        />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <CardFooter className="px-0 pt-4">
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full"
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-medium rounded-xl shadow-md relative overflow-hidden"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center justify-center w-full">
                                {/* Loading dots animation */}
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
                                <span className="ml-2">Processing...</span>
                                
                                {/* Progress bar animation */}
                                <motion.div 
                                  className="absolute bottom-0 left-0 h-1 bg-blue-300"
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
                                <span>Save Bank Details</span>
                                <motion.span
                                  animate={{ 
                                    x: [0, 5, 0],
                                    opacity: [1, 0.8, 1]
                                  }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    repeatType: "reverse" 
                                  }}
                                  className="ml-2"
                                >
                                  →
                                </motion.span>
                              </motion.div>
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </motion.div>
                  </motion.form>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 right-10 text-5xl"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.7, 0.9, 0.7],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
          style={{ zIndex: -1 }}
        >
          ⚡
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-10 text-5xl"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.6, 0.8, 0.6],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5
          }}
          style={{ zIndex: -1 }}
        >
          ✨
        </motion.div>
      </div>
    </div>
  );
};

export default BankAccountForm;