import React from 'react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
}

export const WeatherComponent: React.FC<{ data?: WeatherData }> = ({ data }) => {
  // Use dummy data directly in the component
  const weatherData = {
    location: data?.location || 'New York',
    temperature: 72,
    condition: 'Sunny'
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-2 text-blue-300">Weather in {weatherData.location}</h3>
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-bold text-white">{weatherData.temperature}°F</p>
        <p className="text-gray-300">{weatherData.condition}</p>
      </div>
    </div>
  );
};
