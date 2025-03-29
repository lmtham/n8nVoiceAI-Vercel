
import React from 'react';
import { createRoot } from 'react-dom/client';
import VoiceWidget from './VoiceWidget';
import { WidgetProps } from '@/types';

// This file is for demonstrating how the widget would be embedded in other websites
// In a real implementation, this would be bundled as a separate JS file

class EmbeddableVoiceWidget {
  private container: HTMLDivElement;
  
  constructor(config: WidgetProps) {
    // Create container for the widget
    this.container = document.createElement('div');
    this.container.id = 'voice-ai-widget-container';
    document.body.appendChild(this.container);
    
    // Render the widget in the container
    const root = createRoot(this.container);
    root.render(<VoiceWidget {...config} />);
  }
  
  // Method to remove the widget
  destroy() {
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container);
    }
  }
}

// Export to window for usage in script tags
if (typeof window !== 'undefined') {
  (window as any).VoiceWidget = EmbeddableVoiceWidget;
}

export default EmbeddableVoiceWidget;
