
import { useState, useCallback, useRef } from 'react';
import { VoiceSettings } from '@/types';

// Deepgram Aura TTS integration with natural pauses and filler words
const DEEPGRAM_URL = 'https://api.deepgram.com/v1/speak?model=aura-asteria-en';

// Helper function to add natural pauses and filler words
const naturalizeSpeech = (text: string): string => {
  // Add pauses at sentence ends
  text = text.replace(/([.!?])\s/g, '$1 ... ');
  
  // Add short pauses for commas
  text = text.replace(/,/g, ', ');
  
  // Add filler words randomly
  const fillerWords = ['um', 'uh', 'well', 'like'];
  const addFiller = () => fillerWords[Math.floor(Math.random() * fillerWords.length)];
  
  // Add filler words after every 3-4 sentences
  const sentences = text.split(/([.!?]\s)/);
  return sentences.map((sentence, i) => 
    i > 0 && i % 3 === 0 ? ` ${addFiller()} ${sentence}` : sentence
  ).join('');
};

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
      // Call Deepgram Aura API
      const response = await fetch(DEEPGRAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKey}`
        },
        body: JSON.stringify({
          text: naturalizeSpeech(text)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);
      return audioUrl;
      
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
