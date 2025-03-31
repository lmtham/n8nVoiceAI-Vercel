(function() {
  // Create a style element for the widget CSS
  const style = document.createElement('style');
  style.textContent = `
    .voice-widget-container {
      position: fixed;
      z-index: 9999;
    }
    
    .voice-widget-button {
      height: 64px;
      width: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #8a2387, #e94057, #f27121);
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      border: none;
      outline: none;
    }
    
    .voice-widget-button:hover {
      transform: scale(1.05);
    }
    
    .voice-widget-button svg {
      width: 24px;
      height: 24px;
    }
    
    .voice-widget-panel {
      position: absolute;
      width: 380px;
      max-width: calc(100vw - 32px);
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .dark .voice-widget-panel {
      background-color: rgba(23, 23, 23, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .voice-widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .dark .voice-widget-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .voice-widget-title {
      font-weight: 500;
      font-size: 16px;
      margin: 0;
    }
    
    .voice-widget-controls {
      display: flex;
      gap: 8px;
    }
    
    .voice-widget-control-button {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .dark .voice-widget-control-button {
      color: #aaa;
    }
    
    .voice-widget-control-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #333;
    }
    
    .dark .voice-widget-control-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .voice-widget-chat {
      height: 320px;
      overflow-y: auto;
      padding: 16px;
    }
    
    .voice-widget-message {
      margin-bottom: 16px;
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 16px;
      position: relative;
      line-height: 1.5;
      font-size: 14px;
    }
    
    .voice-widget-message-ai {
      background-color: rgba(0, 0, 0, 0.05);
      margin-right: auto;
      border-top-left-radius: 4px;
    }
    
    .dark .voice-widget-message-ai {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .voice-widget-message-user {
      background-color: rgba(0, 120, 255, 0.1);
      margin-left: auto;
      border-top-right-radius: 4px;
    }
    
    .voice-widget-footer {
      padding: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .dark .voice-widget-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .voice-widget-transcript {
      min-height: 24px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #666;
      font-style: italic;
    }
    
    .dark .voice-widget-transcript {
      color: #aaa;
    }
    
    .voice-widget-mic-button {
      width: 100%;
      height: 48px;
      border-radius: 24px;
      background: linear-gradient(135deg, #8a2387, #e94057, #f27121);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .voice-widget-mic-button:hover {
      opacity: 0.9;
    }
    
    .voice-widget-mic-button:active {
      transform: scale(0.98);
    }
    
    .voice-widget-status {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }
    
    .dark .voice-widget-status {
      color: #aaa;
    }
    
    .voice-widget-pulse {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(138, 35, 135, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(138, 35, 135, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(138, 35, 135, 0);
      }
    }
    
    .voice-widget-scale-in {
      animation: scaleIn 0.3s forwards;
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .voice-widget-minimized {
      height: 56px;
      overflow: hidden;
    }
    
    .bottom-right {
      bottom: 24px;
      right: 24px;
    }
    
    .bottom-left {
      bottom: 24px;
      left: 24px;
    }
    
    .top-right {
      top: 24px;
      right: 24px;
    }
    
    .top-left {
      top: 24px;
      left: 24px;
    }
  `;
  document.head.appendChild(style);

  // Load React and ReactDOM from CDN
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Main widget class
  class VoiceWidget {
    constructor(config) {
      this.config = {
        webhookUrl: '',
        apiKey: '',
        position: 'bottom-right',
        buttonLabel: 'Voice Assistant',
        greetingMessage: 'Hello! How can I assist you today?',
        theme: 'system',
        mode: 'standard',
        ttsProvider: 'deepgram',
        ...config
      };
      
      this.container = null;
      this.isOpen = false;
      this.isListening = false;
      this.isMinimized = false;
      this.isSpeaking = false;
      this.isProcessing = false;
      this.messages = [];
      this.transcript = null;
      this.audioElement = new Audio();
      
      // Initialize the widget
      this.init();
    }
    
    async init() {
      try {
        // Create container
        this.container = document.createElement('div');
        this.container.className = `voice-widget-container ${this.config.position}`;
        document.body.appendChild(this.container);
        
        // Set up audio element
        this.setupAudioElement();
        
        // Render the widget
        this.render();
        
        // Add greeting message
        if (this.config.greetingMessage) {
          this.addMessage({
            text: this.config.greetingMessage,
            sender: 'ai',
            timestamp: Date.now()
          });
          
          // Generate speech for greeting
          this.generateSpeech(this.config.greetingMessage);
        }
      } catch (error) {
        console.error('Error initializing voice widget:', error);
      }
    }
    
    setupAudioElement() {
      this.audioElement.autoplay = true;
      this.audioElement.muted = false;
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.preload = 'auto';
      
      this.audioElement.addEventListener('ended', () => {
        console.log('Audio playback ended');
        this.isSpeaking = false;
        this.updateStatus();
      });
      
      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        this.isSpeaking = false;
        this.updateStatus();
      });
    }
    
    render() {
      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.className = 'voice-widget-button';
      toggleButton.setAttribute('aria-label', this.config.buttonLabel);
      toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
      toggleButton.addEventListener('click', () => this.toggleWidget());
      this.container.appendChild(toggleButton);
      this.toggleButton = toggleButton;
      
      // Create panel (initially hidden)
      const panel = document.createElement('div');
      panel.className = 'voice-widget-panel voice-widget-scale-in';
      panel.style.display = 'none';
      this.container.appendChild(panel);
      this.panel = panel;
      
      this.updatePanel();
    }
    
    updatePanel() {
      if (!this.panel) return;
      
      // Update panel content
      this.panel.innerHTML = `
        <div class="voice-widget-header">
          <h3 class="voice-widget-title">Voice Assistant</h3>
          <div class="voice-widget-controls">
            <button class="voice-widget-control-button" aria-label="${this.isMinimized ? 'Expand' : 'Minimize'}" id="minimize-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </button>
            <button class="voice-widget-control-button" aria-label="Close" id="close-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        ${!this.isMinimized ? `
          <div class="voice-widget-chat" id="chat-container">
            ${this.renderMessages()}
          </div>
          <div class="voice-widget-footer">
            <div class="voice-widget-transcript" id="transcript-container">
              ${this.transcript ? this.transcript.text : ''}
            </div>
            <button class="voice-widget-mic-button ${this.isListening ? 'voice-widget-pulse' : ''}" id="mic-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <span style="margin-left: 8px;">${this.isListening ? 'Listening...' : 'Click to speak'}</span>
            </button>
            <div class="voice-widget-status" id="status-container">
              ${this.getStatusText()}
            </div>
          </div>
        ` : ''}
      `;
      
      // Add event listeners
      const minimizeButton = this.panel.querySelector('#minimize-button');
      if (minimizeButton) {
        minimizeButton.addEventListener('click', () => this.toggleMinimize());
      }
      
      const closeButton = this.panel.querySelector('#close-button');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.toggleWidget());
      }
      
      const micButton = this.panel.querySelector('#mic-button');
      if (micButton) {
        micButton.addEventListener('click', () => this.toggleListening());
      }
      
      // Scroll chat to bottom
      const chatContainer = this.panel.querySelector('#chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
    
    renderMessages() {
      return this.messages.map(message => `
        <div class="voice-widget-message voice-widget-message-${message.sender}">
          ${message.text}
        </div>
      `).join('');
    }
    
    getStatusText() {
      if (this.isProcessing) return 'Processing...';
      if (this.isSpeaking) return 'Speaking... (speak to interrupt)';
      if (this.isListening) return 'Listening...';
      return 'Click the microphone to speak';
    }
    
    toggleWidget() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.panel.style.display = 'block';
        this.toggleButton.style.display = 'none';
      } else {
        // Stop any ongoing operations when closing
        if (this.isListening) this.toggleListening();
        if (this.isSpeaking) this.stopSpeech();
        
        setTimeout(() => {
          this.panel.style.display = 'none';
          this.toggleButton.style.display = 'flex';
        }, 300);
      }
    }
    
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
      if (this.isMinimized) {
        this.panel.classList.add('voice-widget-minimized');
      } else {
        this.panel.classList.remove('voice-widget-minimized');
      }
      this.updatePanel();
    }
    
    toggleListening() {
      this.isListening = !this.isListening;
      
      if (this.isListening) {
        // Start recording
        this.startRecording();
      } else {
        // Stop recording
        this.stopRecording();
      }
      
      this.updatePanel();
    }
    
    startRecording() {
      // This is a simplified version - in a real implementation, 
      // you would use the browser's Web Speech API or a similar library
      console.log('Starting voice recording...');
      
      // Simulate receiving transcript after 3 seconds
      setTimeout(() => {
        this.transcript = {
          text: 'Hello, how are you today?',
          isFinal: true
        };
        
        this.handleTranscript(this.transcript);
      }, 3000);
    }
    
    stopRecording() {
      console.log('Stopping voice recording...');
    }
    
    async handleTranscript(transcript) {
      this.updatePanel();
      
      if (transcript.isFinal && transcript.text.trim()) {
        // If user starts speaking while AI is speaking, immediately interrupt the AI
        if (this.isSpeaking) {
          console.log("User interrupting AI speech");
          this.stopSpeech();
        }
        
        // Add user message
        this.addMessage({
          text: transcript.text,
          sender: 'user',
          timestamp: Date.now()
        });
        
        // Add pending AI message
        const pendingMessageId = Date.now().toString();
        this.addMessage({
          id: pendingMessageId,
          text: 'Thinking...',
          sender: 'ai',
          timestamp: Date.now(),
          pending: true
        });
        
        try {
          // Process with n8n webhook
          const response = await this.sendToN8n(transcript.text);
          
          // Update with actual AI response
          this.updateMessage(pendingMessageId, {
            text: response,
            pending: false
          });
          
          // Generate speech for AI response
          this.generateSpeech(response);
        } catch (error) {
          console.error('Error processing with n8n:', error);
          
          // Update with error message
          this.updateMessage(pendingMessageId, {
            text: "Sorry, I couldn't process that request.",
            pending: false
          });
        }
      }
    }
    
    addMessage(message) {
      this.messages.push({
        id: message.id || Date.now().toString(),
        ...message
      });
      this.updatePanel();
    }
    
    updateMessage(id, updates) {
      this.messages = this.messages.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      );
      this.updatePanel();
    }
    
    async sendToN8n(text) {
      this.isProcessing = true;
      this.updateStatus();
      
      try {
        // Make API call to n8n webhook
        const response = await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
          },
          body: JSON.stringify({
            text,
            messages: this.messages,
            mode: this.config.mode
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response || "I'm sorry, I couldn't generate a response.";
      } catch (error) {
        console.error('Error sending to n8n:', error);
        throw error;
      } finally {
        this.isProcessing = false;
        this.updateStatus();
      }
    }
    
    async generateSpeech(text) {
      if (!text || text.trim() === '') return;
      
      // Stop any ongoing speech
      this.stopSpeech();
      
      this.isSpeaking = true;
      this.updateStatus();
      
      try {
        // In a real implementation, you would call a TTS API here
        // For this demo, we'll use the browser's built-in speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => {
            this.isSpeaking = false;
            this.updateStatus();
          };
          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.updateStatus();
          };
          window.speechSynthesis.speak(utterance);
        } else {
          console.log('Speech synthesis not supported');
          this.isSpeaking = false;
          this.updateStatus();
        }
      } catch (error) {
        console.error('Error generating speech:', error);
        this.isSpeaking = false;
        this.updateStatus();
      }
    }
    
    stopSpeech() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      
      this.isSpeaking = false;
      this.updateStatus();
    }
    
    updateStatus() {
      const statusContainer = this.panel?.querySelector('#status-container');
      if (statusContainer) {
        statusContainer.textContent = this.getStatusText();
      }
    }
    
    destroy() {
      // Clean up resources
      if (this.container && document.body.contains(this.container)) {
        document.body.removeChild(this.container);
      }
      
      this.stopSpeech();
    }
  }

  // Export to window for usage in script tags
  window.VoiceWidget = VoiceWidget;
})();