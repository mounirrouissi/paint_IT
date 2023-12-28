import { CheckCircleIcon } from '@heroicons/react/outline';
import React from 'react';

const Success = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-0">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Subscription Successful!</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">Thank you for your subscription. We're excited to have you on board.</p>
        <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">Go to Homepage</a>
      </div>
      );
};

export default Success;

