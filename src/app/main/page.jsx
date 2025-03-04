'use client'
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

const LoanProcess = () => {
  const router = useRouter();
  const form = () => {
    router.push('/form');
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 pb-8">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,255,0.4)_0%,rgba(0,0,255,0.1)_90%)]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.4)_0%,rgba(59,130,246,0.1)_70%)]"></div>
      </div>

      {/* Content container with z-index */}
      <div className="relative z-10">
        {/* Header with shadow and glass effect */}
        <div className=" pt-6 pb-4 px-6">
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

        {/* Loan Process Content */}
        <div className="max-w-md mx-auto px-5 pt-8">
          {/* Premium Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-5 mb-8 flex items-center shadow-lg"
          >
            <div className="flex-1">
              <h2 className="text-white font-semibold text-xl leading-tight">Get a loan up to ₹5 Lakhs in just 5 simple steps.</h2>
              <p className="text-white/90 text-sm mt-1">Quick approval • Minimal documentation</p>
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
                  <span className="text-3xl">💸</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Loan Process Title with decorative elements */}
          <div className="flex items-center mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200"></div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-slate-800 px-4"
            >
              Loan Process
            </motion.h1>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200"></div>
          </div>

          {/* Process Steps */}
          <div className="space-y-4 mb-10">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="transform transition duration-200"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 p-5 rounded-xl shadow-md overflow-hidden relative">
                {/* Decorative accent */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-600"></div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-start mr-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-md">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">Request a Loan</h3>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center bg-white/80 p-2 px-3 rounded-lg shadow-sm">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 shadow-sm">
                          1
                        </div>
                        <p className="text-sm text-slate-700 font-medium">Enter Basic Detail</p>
                      </div>
                      <div className="flex items-center bg-white/80 p-2 px-3 rounded-lg shadow-sm">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 shadow-sm">
                          2
                        </div>
                        <p className="text-sm text-slate-700 font-medium">Give consent for bank data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="transform transition duration-200"
            >
              <Card className="p-5 rounded-xl shadow-md border-0 bg-white/90 overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-1 bg-gray-200"></div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-start mr-4">
                    <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-md">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">Select a Loan Offer</h3>
                    <p className="text-slate-500 text-sm mt-1">Compare rates and choose the best offer</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="transform transition duration-200"
            >
              <Card className="p-5 rounded-xl shadow-md border-0 bg-white/90 overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-1 bg-gray-200"></div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-start mr-4">
                    <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-md">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">Complete KYC Verification</h3>
                    <p className="text-slate-500 text-sm mt-1">Secure and seamless verification</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="transform transition duration-200"
            >
              <Card className="p-5 rounded-xl shadow-md border-0 bg-white/90 overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-1 bg-gray-200"></div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-start mr-4">
                    <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-md">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">Setup Repayment & Loan Agreement</h3>
                    <p className="text-slate-500 text-sm mt-1">Flexible repayment options available</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 5 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="transform transition duration-200"
            >
              <Card className="p-5 rounded-xl shadow-md border-0 bg-white/90 overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-1 bg-gray-200"></div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-start mr-4">
                    <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-md">
                      5
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">Loan Disbursed</h3>
                    <p className="text-slate-500 text-sm mt-1">Funds transferred directly to your account</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Next Button with premium styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8"
          >
            <Button className="w-full h-14 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-lg font-medium rounded-xl shadow-lg relative overflow-hidden group"
            onClick={form}>
              <div className="absolute inset-0 w-full h-full bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              
            </Button>
          </motion.div>

          {/* ONDC Attribution with premium styling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center pt-10"
          >
            <div className="inline-flex items-center px-4 py-2 bg-transparent backdrop-blur-sm rounded-full shadow-sm">
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
            <p className="text-xs text-slate-500 mt-2">
              Open Network for Digital Commerce
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoanProcess;