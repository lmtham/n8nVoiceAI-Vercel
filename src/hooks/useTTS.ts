
import { useState, useCallback, useRef } from 'react';
import { VoiceSettings } from '@/types';

// This is a placeholder for actual TTS integration (ElevenLabs, PlayHT, etc.)
// In a production app, you would implement the actual API connection

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Example ElevenLabs voice ID
  modelId: 'eleven_monolingual_v1',
  stability: 0.5,
  clarity: 0.75,
  speechRate: 1.0,
};

interface UseTTSProps {
  apiKey?: string;
  voiceSettings?: Partial<VoiceSettings>;
}

const useTTS = ({ apiKey, voiceSettings = {} }: UseTTSProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const settings: VoiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    ...voiceSettings,
  };
  
  // Improved speech synthesis with better stop handling
  const generateSpeech = useCallback(async (text: string): Promise<string | null> => {
    if (!text || text.trim() === '') {
      return null;
    }
    
    // First, stop any ongoing speech
    stopSpeech();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the TTS API
      // For this example, we'll use the browser's built-in speech synthesis
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      utteranceRef.current.rate = settings.speechRate;
      
      // Create a promise that resolves when the utterance finishes
      const speechPromise = new Promise<void>((resolve) => {
        if (utteranceRef.current) {
          utteranceRef.current.onend = () => resolve();
          utteranceRef.current.onerror = () => resolve();
        }
      });
      
      window.speechSynthesis.speak(utteranceRef.current);
      await speechPromise;
      
      return "speech-synthesis-url";
    } catch (err) {
      console.error('Error generating speech:', err);
      setError('Failed to generate speech');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [settings]);
  
  // Improved stopSpeech function with immediate effect
  const stopSpeech = useCallback(() => {
    // Immediately cancel any existing speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log("Speech synthesis stopped");
    }
    
    // Clear current utterance
    utteranceRef.current = null;
    setAudioUrl(null);
    setIsLoading(false);
  }, []);
  
  return {
    generateSpeech,
    stopSpeech,
    isLoading,
    audioUrl,
    error
  };
};

export default useTTS;
