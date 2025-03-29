
import React, { useEffect, useRef } from 'react';
import { AudioVisualizerProps } from '@/types';

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isRecording, 
  audioLevel = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const numBars = 18;
  
  useEffect(() => {
    if (!containerRef.current || !isRecording) return;
    
    const bars = containerRef.current.querySelectorAll('.waveform-bar');
    
    const animateBars = () => {
      if (!isRecording) return;
      
      bars.forEach((bar, i) => {
        const htmlBar = bar as HTMLElement;
        
        // Generate a random height between 3px and 36px
        const baseHeight = isRecording ? 3 + Math.random() * 33 : 3;
        
        // Apply the audio level as a multiplier for more reactive animation
        const amplifiedHeight = baseHeight * (0.2 + audioLevel * 0.8);
        
        // Set the height of the bar
        htmlBar.style.height = `${amplifiedHeight}px`;
        
        // Add slightly different animation delays for a wave effect
        htmlBar.style.transition = `height ${100 + i * 5}ms ease`;
      });
      
      // Schedule the next animation frame
      if (isRecording) {
        requestAnimationFrame(animateBars);
      }
    };
    
    const animationFrame = requestAnimationFrame(animateBars);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isRecording, audioLevel]);
  
  return (
    <div 
      ref={containerRef} 
      className="waveform-container"
      aria-hidden="true"
    >
      {Array.from({ length: numBars }).map((_, i) => (
        <div 
          key={i} 
          className={`waveform-bar transition-all duration-200 ${
            isRecording ? 'bg-primary' : 'bg-muted'
          }`}
          style={{ 
            height: isRecording ? '12px' : '3px',
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
