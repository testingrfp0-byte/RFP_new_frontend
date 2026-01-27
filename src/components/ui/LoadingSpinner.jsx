import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', isDarkMode = false }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      <span className={`ml-3 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {message}
      </span>
    </div>
  );
};

export default LoadingSpinner;