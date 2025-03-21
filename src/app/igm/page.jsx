'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, HelpCircle, Upload, X, Image as ImageIcon, Check } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from '@/store/user';
import Image from "next/image";

const IGMComponent = () => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  const igmTransactionId = useAuthStore((state) => state.igmTransactionId);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    sub_category: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      category: value,
      sub_category: '' // Reset subcategory when category changes
    }));
    
    // Update available subcategories based on selected category
    const filteredSubCategories = getSubcategoriesByCategory(value);
    setAvailableSubCategories(filteredSubCategories);
  };
  
  const handleSubCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      sub_category: value
    }));
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Reset upload status when new image is selected
    setUploadedImageUrl(null);
    setUploadSuccess(false);
  };
  
  const handleImageUpload = async () => {
    if (!imageFile || !igmTransactionId) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('user_id', igmTransactionId);
      formData.append('image', imageFile);
      
      const response = await fetch('https://flashfund.kitezone.in/api/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Image upload response:", data);
      
      
      if (data.data ) {
        setUploadedImageUrl(data.data.file_path);
        setUploadSuccess(true);
      } else {
        throw new Error('Upload response did not contain file path');
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError(`Image upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.category) {
        throw new Error('Please select a category');
      }
      
      if (!formData.sub_category) {
        throw new Error('Please select a subcategory');
      }
      
      if (!formData.message) {
        throw new Error('Please enter a message');
      }
      
      // If image is selected but not uploaded yet, upload it first
      if (imageFile && !uploadedImageUrl) {
        await handleImageUpload();
      }
      
      // Prepare data for API
      const payload = {
        transactionId: igmTransactionId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        category: formData.category,
        sub_category: formData.sub_category,
        shortDesc: getSubCategoryLabel(formData.sub_category),
        longDesc: formData.message,
        imageUrl: uploadedImageUrl || null
      };
      
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
      console.log("Ticket submitted successfully", response); 
      
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
  
  // Define category options
  const categoryOptions = [
    { value: 'FULFILLMENT', label: 'Disbursement' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'ORDER', label: 'Generic' }
  ];
  
  // Function to get subcategories based on selected category
  const getSubcategoriesByCategory = (category) => {
    switch(category) {
      case 'FULFILLMENT':
        return [
          { value: 'FLM01', label: 'Delay in disbursement/not disbursed', description: 'Loan not disbursed by the lender' },
          { value: 'FLM02', label: 'Incorrect amount disbursed', description: 'Loan disbursed is incorrect amount' },
          { value: 'FLM202', label: 'Not able to complete the KYC', description: '' },
          { value: 'FLM203', label: 'Not able to set up E-mandate', description: '' },
          { value: 'FLM204', label: 'OTP not received during the e-sign of agreement', description: '' },
          { value: 'FLM205', label: 'Not able to view the agreement', description: '' },
          { value: 'FLM206', label: 'Need to update the e-mandate details', description: '' },
          { value: 'FLM207', label: 'Feedback on collection call', description: '' },
          { value: 'FLM208', label: 'Stop Marketing Communications', description: '' },
          { value: 'FLM209', label: 'Request for documents', description: '' },
          { value: 'FLM210', label: 'Need to update personal details', description: '' },
          { value: 'FLM211', label: 'Revoke consent already granted to collect personal data', description: '' },
          { value: 'FLM212', label: 'Delete/forget existing data against my profile', description: '' }
        ];
      case 'PAYMENT':
        return [
          { value: 'PMT01', label: 'EMI not executed', description: 'EMI not deducted' },
          { value: 'PMT02', label: 'EMI not executed', description: 'Incorrect amount debited against the EMI' },
          { value: 'PMT03', label: 'EMI wrongly executed', description: 'EMI deducted twice' },
          { value: 'PMT04', label: 'EMI wrongly executed', description: 'Automatic debits not canceled after loan closure' },
          { value: 'PMT05', label: 'EMI payment not getting reflected', description: 'Issues with payment receipts and acknowledgment' },
          { value: 'PMT06', label: 'Preclosure/Part payment related', description: 'Unable to prepay or make partpay' },
          { value: 'PMT07', label: 'Preclosure/Part payment related', description: 'Prepayment not reflecting in loan summary' },
          { value: 'PMT08', label: 'Preclosure/Part payment related', description: 'Incorrect fees charged even during the cool-off period' },
          { value: 'PMT09', label: 'NOC/Loan completion Related', description: 'Loan completion certificate/NOC not received after full payment' },
          { value: 'PTM09', label: 'RoI related issues', description: '' },
          { value: 'PTM10', label: 'Fees/Charges related issues', description: 'Interest to be charged as per initial loan offer was 18% however the final loan agreement has 20% mentioned' }
        ];
      case 'ORDER':
        return [
          { value: 'ORD01', label: 'Cibil Related', description: 'Incorrect info on the credit report' },
          { value: 'ORD02', label: 'Cibil Related', description: 'Delay in updating payment information' },
          { value: 'ORD03', label: 'Loan Servicing', description: 'Missing or lost loan documents' }
        ];
      default:
        return [];
    }
  };
  
  // Function to get subcategory label by code
  const getSubCategoryLabel = (code) => {
    const subCategory = availableSubCategories.find(sc => sc.value === code);
    return subCategory ? subCategory.label : '';
  };
  
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
                Issue Category
              </label>
              <Select onValueChange={handleCategoryChange} value={formData.category}>
                <SelectTrigger className="w-full h-12 border border-blue-100 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="border border-blue-100 rounded-lg shadow-md">
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-blue-50">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Issue Type
              </label>
              <Select 
                onValueChange={handleSubCategoryChange} 
                value={formData.sub_category}
                disabled={!formData.category}
              >
                <SelectTrigger className="w-full h-12 border border-blue-100 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                  <SelectValue placeholder={formData.category ? "Select issue type" : "Select category first"} />
                </SelectTrigger>
                <SelectContent className="border border-blue-100 rounded-lg shadow-md max-h-80">
                  {availableSubCategories.map(option => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-blue-50">
                      {option.label}
                      {option.description && (
                        <div className="text-xs text-slate-500 mt-1">{option.description}</div>
                      )}
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
            
            {/* Image upload section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Attach Image (optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              {!imagePreview ? (
                <div
                  onClick={handleTriggerFileInput}
                  className="w-full h-32 border border-dashed border-blue-200 rounded-xl bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <ImageIcon size={24} className="text-blue-400 mb-2" />
                  <span className="text-sm text-blue-500 font-medium">Click to upload an image</span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-blue-100">
                  <div className="aspect-video relative bg-slate-100">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-2 bg-white/90 rounded-lg shadow-sm hover:bg-white flex items-center gap-1"
                      aria-label="Remove image"
                    >
                      <X size={18} className="text-red-500" />
                      <span className="text-red-500 text-sm font-medium">Remove</span>
                    </button>
                    {!uploadSuccess && (
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={isUploading || uploadSuccess}
                        className="px-3 py-2 bg-white/90 rounded-lg shadow-sm hover:bg-white flex items-center gap-1"
                        aria-label="Upload image"
                      >
                        {isUploading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-blue-500 text-sm font-medium">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={18} className="text-blue-500" />
                            <span className="text-blue-500 text-sm font-medium">Upload</span>
                          </>
                        )}
                      </button>
                    )}
                    {uploadSuccess && (
                      <div className="px-3 py-2 bg-green-100/90 rounded-lg shadow-sm flex items-center gap-1">
                        <Check size={18} className="text-green-600" />
                        <span className="text-green-600 text-sm font-medium">Uploaded</span>
                      </div>
                    )}
                  </div>
                  {uploadSuccess && (
                    <div className="p-2 bg-green-50 text-green-600 text-xs font-medium">
                      Image uploaded successfully
                    </div>
                  )}
                </div>
              )}
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
               width={100}
               height={60}
               className="w-35"
             />
           </p>
        </div>
      </div>
    </div>
  );
};

export default IGMComponent;