import React from 'react';
import { XCircleIcon } from '@heroicons/react/solid';

export default function Failure() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
      <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Subscription Failed</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">We're sorry, but we were unable to process your subscription. Please try again.</p>
      <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">Go to Homepage</a>
    </div>
  );
}
