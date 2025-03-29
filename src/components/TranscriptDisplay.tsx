
import React, { useEffect, useState } from 'react';
import { TranscriptResult } from '@/types';
import { cn } from '@/lib/utils';

interface TranscriptDisplayProps {
  transcript: TranscriptResult | null;
  className?: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  className
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (transcript && !transcript.isFinal) {
      setVisible(true);
    } else if (transcript && transcript.isFinal) {
      // Hide after a short delay when transcript is final
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [transcript]);
  
  if (!transcript || !visible) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg bg-secondary/70 backdrop-blur-sm text-secondary-foreground animate-fade-in",
        className
      )}
    >
      <p className="text-sm">
        {transcript.isFinal ? (
          <span>{transcript.text}</span>
        ) : (
          <span className="opacity-70">{transcript.text}</span>
        )}
      </p>
    </div>
  );
};

export default TranscriptDisplay;
