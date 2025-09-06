import React from 'react';

const DemoBanner = () => {
  return (
    <div className="bg-blue-600 text-white py-3 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-1">
          🎓 CS Project Demo - Digital Photo Marketplace
        </h2>
        <p className="text-sm text-blue-100">
          Full-stack payment integration using React, Flask, MongoDB & Stripe • 
          <span className="font-medium"> Test Mode - No Real Payments</span>
        </p>
      </div>
    </div>
  );
};

export default DemoBanner;