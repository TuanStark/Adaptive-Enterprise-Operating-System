"use client";

import React from 'react';
import { useScrollDepth } from '../hooks/useScrollDepth';

export const ScrollDownIndicator = () => {
  const show = useScrollDepth(300); // xuất hiện khi cuộn quá 300px

  if (!show) return null;

  return (
    <div className="flex justify-center my-6 transition-all animate-in fade-in duration-300">
      <div className="w-6 h-6 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 shadow-sm">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
