// components/Pagination.jsx
import React from 'react';
import { Button } from "@/components/ui/button";

const Pagination = ({ loansPerPage, totalLoans, currentPage, paginate }) => {
  const pageNumbers = Math.ceil(totalLoans / loansPerPage);

  return (
    <div className="flex justify-center mt-4 mb-6">
      {Array.from({ length: pageNumbers }, (_, i) => (
        <Button
          key={i + 1}
          onClick={() => paginate(i + 1)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 hover:bg-blue-50"
          }`}
        >
          {i + 1}
        </Button>
      ))}
    </div>
  );
};

export default Pagination;