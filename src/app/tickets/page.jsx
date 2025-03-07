'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Clock, CheckCircle, AlertCircle, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from '@/store/user';
import Image from "next/image";

const TicketsPage = () => {
  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/issue_status/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching tickets: ${response.status}`);
        }
        
        const data = await response.json();
        // Assuming response structure matches the example
        if (data && data.response) {
          setTickets(data.response);
        } else {
          setTickets([]);
        }
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchTickets();
    }
  }, [userId]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleCreateTicket = () => {
    router.push('/igm'); // Assuming this is the route for creating tickets
  };
  
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedTicket(null), 300); // Clear after animation completes
  };
  
  const handleRemoveTicket = async (ticketId) => {
    try {
      // Implement ticket removal API call here
      // For demonstration, we'll just remove it from the local state
      setTickets(tickets.filter(ticket => ticket._id !== ticketId));
      closeModal();
      
      // In a real implementation, you would call your API:
      /*
      await fetch(`http://localhost:3001/issue_status/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId, 
          ticketId 
        })
      });
      */
      
    } catch (err) {
      console.error("Failed to remove ticket:", err);
      // Optionally show an error message to the user
    }
  };
  
  const getStatusIcon = (ticket) => {
    // Check if we have issue_actions and respondent_actions
    const hasDetails = ticket.responseDetails?.payload?.message?.issue?.issue_actions?.respondent_actions;
    
    if (!hasDetails) {
      // Only has issue ID, consider it processing
      return <Clock size={16} className="text-amber-500" />;
    }
    
    // Get the latest action
    const actions = ticket.responseDetails.payload.message.issue.issue_actions.respondent_actions;
    const latestAction = actions[actions.length - 1];
    
    switch (latestAction?.respondent_action) {
      case 'RESOLVED':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'PROCESSING':
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <AlertCircle size={16} className="text-blue-500" />;
    }
  };
  
  const getStatusText = (ticket) => {
    const hasDetails = ticket.responseDetails?.payload?.message?.issue?.issue_actions?.respondent_actions;
    
    if (!hasDetails) {
      return 'In Progress';
    }
    
    const actions = ticket.responseDetails.payload.message.issue.issue_actions.respondent_actions;
    const latestAction = actions[actions.length - 1];
    
    switch (latestAction?.respondent_action) {
      case 'RESOLVED':
        return 'Resolved';
      case 'PROCESSING':
        return 'Processing';
      default:
        return latestAction?.respondent_action || 'In Progress';
    }
  };
  
  const getShortDescription = (ticket) => {
    const hasDetails = ticket.responseDetails?.payload?.message?.issue?.issue_actions?.respondent_actions;
    
    if (!hasDetails) {
      return 'Ticket is being processed';
    }
    
    const actions = ticket.responseDetails.payload.message.issue.issue_actions.respondent_actions;
    const latestAction = actions[actions.length - 1];
    
    return latestAction?.short_desc || 'No description available';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
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
                {userId ? userId.substring(0, 2).toUpperCase() : "U"}
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
          <h1 className="text-xl font-semibold text-slate-800 ml-2">Ticket History</h1>
          <div className="ml-auto">
            <HelpCircle size={20} className="text-blue-400" />
          </div>
        </motion.div>
        
        {/* Tickets List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {loading ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border-0 p-5 mb-4 text-center">
              <p className="text-slate-600">Loading tickets...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50/95 backdrop-blur-sm rounded-xl shadow-md border border-red-100 p-5 mb-4 text-center">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-100 text-red-700 hover:bg-red-200"
              >
                Retry
              </Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border-0 p-5 mb-4 text-center">
              <p className="text-slate-600 mb-4">No tickets found</p>
              <Button
                onClick={handleCreateTicket}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2 rounded-xl shadow-md transition-all duration-200"
              >
                Create Ticket
              </Button>
            </div>
          ) : (
            <>
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border-0 p-4 mb-4 cursor-pointer"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {getStatusIcon(ticket)}
                      </div>
                      <h3 className="font-medium text-slate-800 truncate max-w-48">
                        {ticket.requestDetails?.payload?.message?.short_desc || "Loan not Disbursed"}
                      </h3>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getStatusText(ticket) === 'Resolved' 
                          ? 'bg-green-100 text-green-700' 
                          : getStatusText(ticket) === 'Processing' 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getStatusText(ticket)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-2">
                    {getShortDescription(ticket)}
                  </p>
                  
                  <div className="text-xs text-slate-400 mt-2">
                    {formatDate(ticket.createdAt)}
                  </div>
                </motion.div>
              ))}
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button
                  onClick={handleCreateTicket}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 rounded-xl h-auto shadow-md transition-all duration-200"
                >
                  Create New Ticket
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
        
        {/* Ticket Detail Modal */}
        <AnimatePresence>
          {showModal && selectedTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl shadow-lg max-w-md w-full mx-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {getStatusIcon(selectedTicket)}
                    </div>
                    <h3 className="font-semibold text-slate-800">
                      Ticket Details
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1 rounded-full hover:bg-white/50"
                  >
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500">Status</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getStatusText(selectedTicket) === 'Resolved' 
                          ? 'bg-green-100 text-green-700' 
                          : getStatusText(selectedTicket) === 'Processing' 
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getStatusText(selectedTicket)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500">Description</p>
                    <p className="text-sm text-slate-800 mt-1">
                      {getShortDescription(selectedTicket)}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500">Transaction ID</p>
                    <p className="text-xs text-slate-800 mt-1 break-all">
                      {selectedTicket.transactionId}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500">Issue ID</p>
                    <p className="text-xs text-slate-800 mt-1 break-all">
                      {selectedTicket.issueId}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500">Created At</p>
                    <p className="text-sm text-slate-800 mt-1">
                      {formatDate(selectedTicket.createdAt)}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500">Last Updated</p>
                    <p className="text-sm text-slate-800 mt-1">
                      {formatDate(selectedTicket.updatedAt)}
                    </p>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-end">
                  <Button
                    onClick={() => handleRemoveTicket(selectedTicket._id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove Ticket
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* ONDC Attribution */}
        <div className="mt-8 mb-20 flex flex-col items-center">
          <p className="text-sm text-slate-600 flex items-center justify-center">
            Powered by <Image 
              src="/ondc-network-vertical.png"
              alt="ONDC Network"
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

export default TicketsPage;