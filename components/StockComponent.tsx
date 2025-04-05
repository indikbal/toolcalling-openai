import React from 'react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
}

export const StockComponent: React.FC<{ data?: StockData }> = ({ data }) => {
  // Use dummy data directly in the component
  const stockData = {
    symbol: data?.symbol || 'AAPL',
    price: 165.23,
    change: 2.45
  };
  
  const isPositive = stockData.change >= 0;
  
  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-2 text-blue-300">{stockData.symbol} Stock</h3>
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-bold text-white">${stockData.price.toFixed(2)}</p>
        <p className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{stockData.change.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};
