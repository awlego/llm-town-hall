import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAnthropicAPI() {
  console.log('Testing Anthropic API connection...');
  console.log('API Key (first 10 chars):', process.env.ANTHROPIC_API_KEY?.substring(0, 10) + '...');
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Hello! Just testing the API connection. Please respond with "API connection successful!"'
        }
      ]
    });

    console.log('✅ API Test Successful!');
    console.log('Response:', response.content[0].type === 'text' ? response.content[0].text : 'Non-text response');
    return true;
  } catch (error: any) {
    console.error('❌ API Test Failed:');
    console.error('Error type:', error.constructor?.name || 'Unknown');
    console.error('Error message:', error.message || 'Unknown error');
    if (error.status) {
      console.error('HTTP Status:', error.status);
    }
    return false;
  }
}

// Run the test
testAnthropicAPI().then(success => {
  process.exit(success ? 0 : 1);
});