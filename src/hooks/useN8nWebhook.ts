
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Message } from '@/types';

interface UseN8nWebhookProps {
  webhookUrl: string;
  apiKey?: string;
  mode?: 'standard' | 'popup';
}

const useN8nWebhook = ({ webhookUrl, apiKey, mode = 'standard' }: UseN8nWebhookProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const sendToN8n = useCallback(async (
    transcript: string, 
    conversationHistory: Message[]
  ) => {
    if (!webhookUrl) {
      toast.error('No n8n webhook URL configured');
      return null;
    }
    
    setIsProcessing(true);
    
    try {
      // Create a session ID if it doesn't exist in localStorage
      let sessionId = localStorage.getItem('n8n_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('n8n_session_id', sessionId);
      }
      
      // Format the payload to match the expected format
      const payload = {
        action: 'sendMessage',
        sessionId: sessionId,
        chatInput: transcript,
        message: transcript,
        type: 'text',
        timestamp: new Date().toISOString(),
        conversationHistory: conversationHistory.map(msg => ({
          content: msg.text,
          isUser: msg.sender === 'user',
          timestamp: new Date(msg.timestamp).toISOString()
        }))
      };
      
      // Add API key to headers if provided
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      console.log('Sending to n8n webhook:', webhookUrl);
      console.log('Payload:', JSON.stringify(payload));
      
      // Send to n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.error('Error response from n8n:', response.status, response.statusText);
        throw new Error(`Error from n8n: ${response.status}`);
      }
      
      // Try to parse the response as JSON, but fall back to text if it's not valid JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }
      }
      
      console.log('Response from n8n:', data);
      
      // Extract the response text based on the data format
      let botResponseText = '';
      
      if (typeof data === 'string') {
        botResponseText = data;
      } else if (data.output) { // n8n AI format
        botResponseText = data.output;
      } else if (data.message) {
        botResponseText = data.message;
      } else if (data.response) {
        botResponseText = data.response;
      } else if (data.content) {
        botResponseText = data.content;
      } else if (data.text) {
        botResponseText = data.text;
      }
      
      return botResponseText || 'I received your message but I\'m not sure how to respond.';
    } catch (error) {
      console.error('Error sending to n8n:', error);
      toast.error('Failed to process with n8n. Check console for details.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [webhookUrl, apiKey, mode]);
  
  return {
    sendToN8n,
    isProcessing
  };
};

export default useN8nWebhook;
