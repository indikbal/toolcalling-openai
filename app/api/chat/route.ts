import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai-edge';
import { z } from 'zod';

// Create an OpenAI API client
const config = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(config);

// Weather tool schema and mock data
const weatherTool = {
  name: 'get_weather',
  description: 'Get the current weather for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'The city or location to get weather for',
      },
    },
    required: ['location'],
  },
  execute: async (location: string) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
    condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
  }),
};

// Stock tool schema and mock data
const stockTool = {
  name: 'get_stock',
  description: 'Get the current stock price and change for a symbol',
  parameters: {
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: 'The stock symbol to look up',
      },
    },
    required: ['symbol'],
  },
  execute: async (symbol: string) => ({
    symbol,
    price: 100 + Math.random() * 150,
    change: (Math.random() * 10) - 5,
  }),
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  // First, get the completion from OpenAI
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    functions: [
      {
        name: weatherTool.name,
        description: weatherTool.description,
        parameters: weatherTool.parameters,
      },
      {
        name: stockTool.name,
        description: stockTool.description,
        parameters: stockTool.parameters,
      },
    ],
    function_call: 'auto',
  });

  const responseData = await response.json();
  const message = responseData.choices[0].message;

  // Check if there's a function call
  if (message.function_call) {
    const functionName = message.function_call.name;
    const functionArgs = JSON.parse(message.function_call.arguments);

    let functionResponse;
    if (functionName === 'get_weather') {
      functionResponse = await weatherTool.execute(functionArgs.location);
    } else if (functionName === 'get_stock') {
      functionResponse = await stockTool.execute(functionArgs.symbol);
    }

    // Get a new response from OpenAI with the function result
    const secondResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        ...messages,
        message,
        {
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResponse),
        },
      ],
      temperature: 0.7,
    });

    const secondResponseData = await secondResponse.json();
    
    // Return both the function call and the final response
    return NextResponse.json({
      role: 'assistant',
      content: secondResponseData.choices[0].message.content,
      function_call: {
        name: functionName,
        arguments: message.function_call.arguments,
      },
    });
  }

  // If there's no function call, just return the message
  return NextResponse.json({
    role: 'assistant',
    content: message.content,
  });
}
