import { useState, useCallback, useRef } from 'react';
import { VoiceSettings } from '@/types';

// TTS API endpoints
const DEEPGRAM_URL = 'https://api.deepgram.com/v1/speak?model=aura-asteria-en';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/audio/speech';

// Default Deepgram API key
const DEFAULT_DEEPGRAM_API_KEY = '6915c6d15184afacb050f65c9fa22bf35b193160';

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
  ttsProvider?: 'deepgram' | 'deepseek';
}

const useTTS = ({ apiKey, voiceSettings = {}, ttsProvider = 'deepgram' }: UseTTSProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref for the audio element to persist between renders
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element on first use
  if (!audioElementRef.current && typeof window !== 'undefined') {
    audioElementRef.current = new Audio();
    
    // Add event listeners
    audioElementRef.current.addEventListener('ended', () => {
      console.log('Audio playback ended');
      setIsLoading(false);
    });
    
    audioElementRef.current.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      setError('Failed to play audio');
      setIsLoading(false);
    });
    
    // Set audio properties to help with autoplay
    audioElementRef.current.autoplay = true;
    audioElementRef.current.muted = false;
    audioElementRef.current.crossOrigin = 'anonymous';
    audioElementRef.current.preload = 'auto';
  }
  
  const settings: VoiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    ...voiceSettings,
  };
  
  // Improved speech synthesis with better audio playback
  const generateSpeech = useCallback(async (text: string): Promise<string | null> => {
    if (!text || text.trim() === '') {
      return null;
    }
    
    // First, stop any ongoing speech
    stopSpeech();
    
    setIsLoading(true);
    setError(null);
    
    console.log('Generating speech for:', text);
    
    try {
      let response;
      // Use the provided API key or fall back to the default for Deepgram
      const effectiveApiKey = ttsProvider === 'deepgram' 
        ? (apiKey || DEFAULT_DEEPGRAM_API_KEY)
        : apiKey;
      
      if (!effectiveApiKey) {
        throw new Error('API key is required');
      }
      
      if (ttsProvider === 'deepseek') {
        // Call Deepseek TTS API
        response = await fetch(DEEPSEEK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveApiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-speech',
            input: naturalizeSpeech(text),
            voice: 'alloy',
            response_format: 'mp3'
          })
        });
      } else {
        // Call Deepgram Aura API (default)
        console.log('Using Deepgram API with key:', effectiveApiKey.substring(0, 5) + '...');
        response = await fetch(DEEPGRAM_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${effectiveApiKey}`
          },
          body: JSON.stringify({
            text: naturalizeSpeech(text)
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('TTS API error:', errorData);
        throw new Error(`Failed to generate speech: ${response.status}`);
      }

      console.log('Speech generated successfully, creating audio');
      const blob = await response.blob();
      
      // Revoke previous URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const newAudioUrl = URL.createObjectURL(blob);
      setAudioUrl(newAudioUrl);
      
      // Play the audio directly
      if (audioElementRef.current) {
        audioElementRef.current.src = newAudioUrl;
        
        console.log('Playing audio...');
        // Unmute the audio before playing (helps with autoplay policies)
        audioElementRef.current.muted = false;
        audioElementRef.current.volume = 1.0;
        
        const playPromise = audioElementRef.current.play();
        
        // Handle play promise rejection (often happens due to user interaction requirements)
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Audio play error:', err);
            // If autoplay was prevented, try with muted audio first (browsers allow muted autoplay)
            if (err.name === 'NotAllowedError') {
              console.log('Autoplay prevented, trying with muted audio first...');
              if (audioElementRef.current) {
                audioElementRef.current.muted = true;
                audioElementRef.current.play()
                  .then(() => {
                    // Unmute after successful play start
                    setTimeout(() => {
                      if (audioElementRef.current) audioElementRef.current.muted = false;
                    }, 100);
                  })
                  .catch(e => {
                    console.error('Even muted autoplay failed:', e);
                    setError('Browser prevented audio playback. Please interact with the page first.');
                    setIsLoading(false);
                  });
              }
            } else {
              // For other errors, try again after a short delay
              setTimeout(() => {
                if (audioElementRef.current) {
                  audioElementRef.current.play().catch(e => {
                    console.error('Second attempt to play audio failed:', e);
                    setError('Failed to play audio: ' + e.message);
                    setIsLoading(false);
                  });
                }
              }, 100);
            }
          });
        }
      } else {
        console.error('Audio element not available');
        setError('Audio element not available');
        setIsLoading(false);
      }
      
      return newAudioUrl;
    } catch (err) {
      console.error('Error generating speech:', err);
      setError('Failed to generate speech: ' + (err instanceof Error ? err.message : String(err)));
      setIsLoading(false);
      return null;
    }
  }, [apiKey, ttsProvider, audioUrl]);
  
  // Improved stopSpeech function with immediate effect
  const stopSpeech = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      console.log("Audio playback stopped");
    }
    
    // Revoke the object URL to free up memory
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioUrl(null);
    setIsLoading(false);
  }, [audioUrl]);
  
  return {
    generateSpeech,
    stopSpeech,
    isLoading,
    audioUrl,
    error
  };
};

export default useTTS;
