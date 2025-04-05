'use client';

import { useState } from 'react';
import { WeatherComponent } from '../components/WeatherComponent';
import { StockComponent } from '../components/StockComponent';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      
      // Add assistant message
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        function_call: data.function_call,
      }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-white">AI Assistant with Tools</h1>
        
        <div className="space-y-4 mb-4">
          {messages.map((m) => {
            const isAssistant = m.role === 'assistant';
            
            return (
              <div
                key={m.id}
                className={`p-4 rounded-lg ${
                  isAssistant ? 'bg-gray-800' : 'bg-blue-900'
                }`}
              >
                {m.function_call?.name === 'get_weather' && (
                  <WeatherComponent />
                )}
                {m.function_call?.name === 'get_stock' && (
                  <StockComponent />
                )}
                <div className="prose prose-invert">
                  {m.content}
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="p-4 rounded-lg bg-gray-800">
              <div className="flex space-x-2 justify-center items-center h-8">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about weather or stocks..."
            className="flex-1 p-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-300"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
