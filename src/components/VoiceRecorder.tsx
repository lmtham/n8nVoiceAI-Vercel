
import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';
import AudioVisualizer from './AudioVisualizer';
import { VoiceRecorderProps } from '@/types';
import { cn } from '@/lib/utils';

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptReceived,
  isListening,
  setIsListening
}) => {
  const {
    isRecording,
    audioLevel,
    error,
    startRecording,
    stopRecording
  } = useVoiceRecorder({
    onTranscriptReceived
  });
  
  useEffect(() => {
    if (isListening && !isRecording) {
      startRecording();
    } else if (!isListening && isRecording) {
      stopRecording();
    }
  }, [isListening, isRecording, startRecording, stopRecording]);
  
  useEffect(() => {
    if (error) {
      console.error('Voice recorder error:', error);
      setIsListening(false);
    }
  }, [error, setIsListening]);
  
  const toggleRecording = () => {
    setIsListening(!isListening);
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <AudioVisualizer 
        isRecording={isRecording}
        audioLevel={audioLevel}
      />
      
      <button
        onClick={toggleRecording}
        className={cn(
          "voice-button",
          isRecording && "voice-button-pulse"
        )}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </button>
      
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
};

export default VoiceRecorder;
