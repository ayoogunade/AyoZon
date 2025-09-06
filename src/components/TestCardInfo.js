import React from 'react';

const TestCardInfo = () => {
  const testCards = [
    {
      name: "Success Card",
      number: "4242 4242 4242 4242",
      description: "Payment succeeds",
      color: "bg-green-100 border-green-400 text-green-700"
    },
    {
      name: "Declined Card", 
      number: "4000 0000 0000 0002",
      description: "Payment fails",
      color: "bg-red-100 border-red-400 text-red-700"
    },
    {
      name: "Processing Card",
      number: "4000 0000 0000 9995", 
      description: "Requires authentication",
      color: "bg-yellow-100 border-yellow-400 text-yellow-700"
    }
  ];

  return (
    <div className="mb-4">
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-3">🧪 Test Cards (No Real Money)</h4>
        <div className="space-y-2">
          {testCards.map((card, index) => (
            <div key={index} className={`p-3 rounded border ${card.color}`}>
              <div className="font-mono text-sm font-bold">{card.number}</div>
              <div className="text-xs">{card.name} - {card.description}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-600">
          <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
          <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
          <p><strong>ZIP Code:</strong> Any 5 digits (e.g., 12345)</p>
        </div>
      </div>
    </div>
  );
};

export default TestCardInfo;