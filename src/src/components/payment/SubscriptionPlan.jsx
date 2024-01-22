import React from 'react';

export default function SubscriptionPlan() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-10">Pricing</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {['UI Design', 'UX Design', 'Print Design'].map((title, index) => (
          <div key={index} className={`bg-white rounded-lg shadow-md p-6 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-80 ${index === 0 ? 'border-4 border-green-500' : ''}`}>
            <div className="flex justify-center items-center mb-4">
              <span className="material-icons text-4xl text-indigo-500">
                {index === 0 ? 'important_devices' : index === 1 ? 'perm_identity' : 'art_track'}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-center">{title}</h1>
            <hr className="mb-4"/>
            <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente harum voluptatum, sit cum voluptatibus inventore quae qui provident eveniet dicta at, quibusdam ipsam iusto reprehenderit hic saepe nesciunt sed illo.</p>
            <hr className="mb-4"/>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                <span className="underline">{index === 0 ? 'Monthly - FREE FOREVER' : index === 1 ? 'Yearly - 399' : '999'}</span>
                {index !== 0 && <b className="text-sm">$</b>}
              </div>
              <a href="#" className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110">Purchase now</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
