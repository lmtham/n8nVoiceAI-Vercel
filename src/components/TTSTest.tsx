import React, { useState } from 'react';
import useTTS from '@/hooks/useTTS';

const TTSTest: React.FC = () => {
  const [text, setText] = useState('Hello, this is a test of the text to speech functionality.');
  const [apiKey, setApiKey] = useState('6915c6d15184afacb050f65c9fa22bf35b193160'); // Default Deepgram API key
  const [provider, setProvider] = useState<'deepgram' | 'deepseek'>('deepgram');
  const [status, setStatus] = useState('');
  
  const { generateSpeech, stopSpeech, isLoading, error } = useTTS({
    apiKey,
    ttsProvider: provider
  });
  
  const handlePlay = async () => {
    setStatus('Generating speech...');
    try {
      const result = await generateSpeech(text);
      if (result) {
        setStatus('Speech playing...');
      } else {
        setStatus('Failed to generate speech');
      }
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const handleStop = () => {
    stopSpeech();
    setStatus('Speech stopped');
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">TTS Test Component</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          API Key
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter API key"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          TTS Provider
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as 'deepgram' | 'deepseek')}
          className="w-full p-2 border rounded"
        >
          <option value="deepgram">Deepgram</option>
          <option value="deepseek">Deepseek</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Text to Speak
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Enter text to speak"
        />
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Playing...' : 'Play'}
        </button>
        
        <button
          onClick={handleStop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      </div>
      
      {status && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p><strong>Status:</strong> {status}</p>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-2 p-2 bg-yellow-100 rounded">
          <p>Audio is currently playing...</p>
        </div>
      )}
    </div>
  );
};

export default TTSTest;
