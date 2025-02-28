'use client'
import React from 'react';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Link from 'next/link'

const Home = () => {
  const router=useRouter()
  const signin=()=>{
    router.push('/signin')
  }
  const signup=()=>{
    router.push('/signup')
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header Logo */}
      <div className="flex justify-center pt-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image 
            src="/FlashfundLogo.png"
            alt="FlashFund logo"
            width={180}  // Increased from 140
            height={110} // Increased from 85
            className="w-44"  // Increased from w-36
          />
        </motion.div>
      </div>

      {/* Hero Section */}
      <div className="max-w-md mx-auto px-6 pt-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            bounce: 0.4
          }}
          className="relative"
        >
          {/* Animated Loan Icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] flex items-center justify-center shadow-xl"
            >
              <span className="text-6xl text-white">₹</span>
            </motion.div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ 
              rotate: 360,
              y: [0, -5, 0]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-0 right-0 w-12 h-12 text-4xl"
          >
            ⚡
          </motion.div>
          <motion.div
            animate={{ 
              rotate: -360,
              y: [0, 5, 0]
            }}
            transition={{ 
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-0 left-0 w-12 h-12 text-4xl"
          >
            ✨
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-4 mb-12"
        >
          <h1 className="text-3xl font-bold text-slate-800">
            Quick Personal Loans
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Get instant funds when you need them most. No lengthy processes, quick approval.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-12"
        >
          {[
           
            { icon: "🔒", title: "Secure", desc: "Safe process" },
            { icon: "📱", title: "Digital", desc: "Easy application" }
            
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 p-4 rounded-xl shadow-sm"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-slate-800">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-4"
        >
          <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-medium rounded-xl shadow-lg"
          onClick={signup}>
          
          Get Started
                  
           
          </Button>
          <Button variant="outline" className="w-full h-14 text-lg font-medium border-2 border-blue-100 text-blue-700 hover:bg-blue-50 rounded-xl"
          onClick={signin}>
         
          Login
                
          </Button>
        </motion.div>

        {/* ONDC Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center pt-12 pb-8"
        >
          <p className="text-sm text-slate-600">
            Powered by <span className="font-semibold text-blue-600">ONDC</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Open Network for Digital Commerce
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;