
import React from 'react';

export const ClinicHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-blue-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🏥</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VetCare Clinic</h1>
            <p className="text-sm text-gray-600">Inventory Management System</p>
          </div>
        </div>
      </div>
    </header>
  );
};
