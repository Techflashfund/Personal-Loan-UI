'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from '@/store/user';
import Image from "next/image";

const IGMComponent = () => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  
  const transactionId = useAuthStore((state) => state.transactionId);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    issue: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      issue: value
    }));
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.issue) {
        throw new Error('Please select an issue type');
      }
      
      if (!formData.message) {
        throw new Error('Please enter a message');
      }
      
      // Prepare data for API
      const payload = {
        transactionId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        shortDesc: formData.issue,
        longDesc: formData.message
      };
      console.log(payload);
      
      // Send data to backend
      const response = await fetch('https://pl.pr.flashfund.in/issues/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Error submitting ticket: ${response.status}`);
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/tickets');
      }, 2000);
      
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewTickets = () => {
    router.push('/tickets');
  };
  
  const issueOptions = [
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'loan_details', label: 'Loan Details' },
    { value: 'technical_problem', label: 'Technical Problem' },
    { value: 'foreclosure', label: 'Foreclosure Query' },
    { value: 'repayment', label: 'Repayment Schedule' },
    { value: 'other', label: 'Other' }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pb-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,255,0.4)_0%,rgba(0,0,255,0.1)_90%)]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.4)_0%,rgba(59,130,246,0.1)_70%)]"></div>
      </div>
      
      {/* Header with logo */}
      <div className="relative z-10 pt-6 pb-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center"
        >
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={120}
            height={70}
            className="w-28"
          />
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">
                {formData.name ? formData.name.substring(0, 2).toUpperCase() : "U"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="relative z-10 max-w-md mx-auto px-5 pt-2">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center mb-6"
        >
          <button 
            onClick={handleBack} 
            className="p-2 rounded-full hover:bg-white/50 backdrop-blur-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-blue-700" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 ml-2">Raise a Ticket</h1>
          <div className="ml-auto">
            <HelpCircle size={20} className="text-blue-400" />
          </div>
        </motion.div>
        
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border-0 p-5 mb-6"
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select your issue
              </label>
              <Select onValueChange={handleSelectChange} value={formData.issue}>
                <SelectTrigger className="w-full h-12 border border-blue-100 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                  <SelectValue placeholder="Select issue" />
                </SelectTrigger>
                <SelectContent className="border border-blue-100 rounded-lg shadow-md">
                  {issueOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-blue-50">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type Message..."
                className="w-full min-h-32 rounded-xl border border-blue-100 resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full h-12 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                className="w-full h-12 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full h-12 rounded-xl border border-blue-100 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            
            {/* Primary Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 rounded-xl h-auto shadow-md transition-all duration-200"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </motion.div>
          </form>
          
          {/* Secondary Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleViewTickets}
              className="w-full border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-xl h-auto shadow-sm transition-all duration-200"
            >
              See tickets
            </Button>
          </motion.div>
          
          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 p-5 bg-blue-50/70 backdrop-blur-sm border border-blue-100 rounded-xl shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-semibold text-slate-700">Grievance Redressal Officer</div>
              <div className="text-xs text-blue-700 font-medium">Sijo Paul</div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-medium text-slate-700">Contact</div>
              <div className="text-xs text-blue-600">9895311030</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium text-slate-700">Email</div>
              <div className="text-xs text-blue-600">care@flashfund.in</div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center shadow-sm"
          >
            {error}
          </motion.div>
        )}
        
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-center shadow-sm"
          >
            Ticket submitted successfully!
          </motion.div>
        )}
        
        {/* ONDC Attribution */}
        <div className="mt-8 mb-20 flex flex-col items-center">
           <p className="text-sm text-slate-600 flex items-center justify-center">
                                    Powered by <Image 
                                    src="/ondc-network-vertical.png"
                                    alt="FlashFund logo"
                                    width={100}  // Increased from 140
                                    height={60} // Increased from 85
                                    className="w-35"  // Increased from w-36
                                  />
                                  </p>
        </div>
      </div>
    </div>
  );
};

export default IGMComponent;