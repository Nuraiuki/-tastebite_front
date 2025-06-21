import React from 'react';

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
} 