
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Mic, Settings, Info } from 'lucide-react';

import { Message, TranscriptResult, N8nWebhookConfig } from '@/types';
import VoiceRecorder from '@/components/VoiceRecorder';
import ChatBox from '@/components/ChatBox';
import TranscriptDisplay from '@/components/TranscriptDisplay';
import AudioVisualizer from '@/components/AudioVisualizer';
import useN8nWebhook from '@/hooks/useN8nWebhook';
import useTTS from '@/hooks/useTTS';
import { toast } from 'sonner';

const Index = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookMode, setWebhookMode] = useState<'standard' | 'popup'>('standard');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const { sendToN8n, isProcessing } = useN8nWebhook({ 
    webhookUrl, 
    apiKey,
    mode: webhookMode
  });
  const { generateSpeech, isLoading: isSpeaking } = useTTS();
  
  useEffect(() => {
    // Check if webhook config is already saved in localStorage
    const savedWebhookConfig = localStorage.getItem('n8nWebhookConfig');
    if (savedWebhookConfig) {
      try {
        const config: N8nWebhookConfig = JSON.parse(savedWebhookConfig);
        setWebhookUrl(config.webhookUrl || '');
        setApiKey(config.apiKey || '');
        setWebhookMode(config.mode || 'standard');
      } catch (error) {
        console.error('Error parsing saved webhook config:', error);
        setIsConfiguring(true);
      }
    } else {
      // If no webhook URL is saved, show the configuration
      setIsConfiguring(true);
    }
  }, []);
  
  const handleConfigureSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl.trim()) {
      toast.error('Please enter a valid webhook URL');
      return;
    }
    
    // Save to localStorage
    const webhookConfig: N8nWebhookConfig = {
      webhookUrl,
      apiKey,
      mode: webhookMode
    };
    
    localStorage.setItem('n8nWebhookConfig', JSON.stringify(webhookConfig));
    setIsConfiguring(false);
    toast.success('Webhook configuration saved successfully');
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: 'Hello! I am your voice assistant. How may I help you today?',
      sender: 'ai',
      timestamp: Date.now()
    };
    
    setMessages([welcomeMessage]);
    generateSpeech(welcomeMessage.text);
  };
  
  const handleTranscriptReceived = async (result: TranscriptResult) => {
    setTranscript(result);
    
    if (result.isFinal && result.text) {
      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        text: result.text,
        sender: 'user',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Add pending AI message
      const pendingAiMessage: Message = {
        id: uuidv4(),
        text: 'Thinking...',
        sender: 'ai',
        timestamp: Date.now(),
        pending: true
      };
      
      setMessages(prev => [...prev, pendingAiMessage]);
      
      try {
        // Process with n8n webhook
        const response = await sendToN8n(result.text, messages);
        
        if (response) {
          // Update with actual AI response
          setMessages(prev => prev.map(msg => 
            msg.id === pendingAiMessage.id
              ? { ...msg, text: response, pending: false }
              : msg
          ));
          
          // Generate speech for AI response
          generateSpeech(response);
        } else {
          throw new Error('No response from n8n');
        }
      } catch (error) {
        console.error('Error processing with n8n:', error);
        
        // Update with error message
        setMessages(prev => prev.map(msg => 
          msg.id === pendingAiMessage.id
            ? { ...msg, text: "I'm sorry, I couldn't process that request. Please try again.", pending: false }
            : msg
        ));
      }
    }
  };
  
  if (isConfiguring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="glass-panel w-full max-w-md p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Voice AI Setup</h1>
            <p className="text-muted-foreground">Configure your n8n webhook to get started</p>
          </div>
          
          <form onSubmit={handleConfigureSave}>
            <div className="mb-4">
              <label htmlFor="webhookUrl" className="block text-sm font-medium mb-1">
                n8n Webhook URL
              </label>
              <input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background"
                placeholder="https://your-n8n-instance.com/webhook/..."
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the webhook URL from your n8n workflow
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                API Key (Optional)
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 rounded-md border border-input bg-background"
                placeholder="Your API key for authentication"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                If your n8n webhook requires authentication
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="webhookMode" className="block text-sm font-medium mb-1">
                Webhook Mode
              </label>
              <select
                id="webhookMode"
                value={webhookMode}
                onChange={(e) => setWebhookMode(e.target.value as 'standard' | 'popup')}
                className="w-full p-2 rounded-md border border-input bg-background"
              >
                <option value="standard">Standard</option>
                <option value="popup">Popup</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose how the webhook should be displayed
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Save and Continue
              </button>
            </div>
          </form>
          
          <div className="mt-8 p-4 bg-secondary rounded-md">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-primary mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">How to set up n8n</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  1. Create a new workflow in n8n<br />
                  2. Add a Webhook node as a trigger<br />
                  3. Configure the node to accept POST requests<br />
                  4. Copy the webhook URL and paste it here<br />
                  5. Set up your workflow to process voice inputs and return responses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <header className="p-4 border-b border-border backdrop-blur-sm bg-background/50 sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">Voice AI Assistant</h1>
          <button
            onClick={() => setIsConfiguring(true)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 container py-8 px-4">
        <div className="grid md:grid-cols-12 gap-8 max-w-6xl mx-auto">
          <div className="md:col-span-7">
            <div className="glass-panel h-full overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-semibold">Conversation</h2>
              </div>
              
              <ChatBox 
                messages={messages} 
                className="flex-1"
              />
              
              <div className="p-4 relative border-t border-border">
                <TranscriptDisplay 
                  transcript={transcript} 
                  className="mb-4"
                />
                
                <div className="flex items-center justify-center">
                  <AudioVisualizer isRecording={isListening} />
                </div>
                
                <div className="flex justify-center mt-4">
                  <VoiceRecorder
                    onTranscriptReceived={handleTranscriptReceived}
                    isListening={isListening}
                    setIsListening={setIsListening}
                  />
                </div>
                
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {isListening ? (
                    <p>Listening... Click again to stop</p>
                  ) : (
                    <p>Click the microphone to start speaking</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-5">
            <div className="glass-panel h-full">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-semibold">How to Use</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic size={16} className="text-primary" />
                    </div>
                    <h3 className="font-medium">Start a Conversation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Click the microphone button and speak clearly to interact with the voice assistant.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings size={16} className="text-primary" />
                    </div>
                    <h3 className="font-medium">Configure n8n</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    Use your own n8n workflow to customize how the assistant processes your voice commands.
                  </p>
                </div>
                
                <div className="p-4 bg-secondary rounded-md mt-8">
                  <h3 className="font-medium mb-2">Embeddable Widget</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add this voice assistant to any website by including the following code:
                  </p>
                  
                  <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                    {`<script src="https://your-domain.com/voicewidget.js"></script>
<script>
  new VoiceWidget({
    webhookUrl: "${webhookUrl}",
    position: "bottom-right"
  });
</script>`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
