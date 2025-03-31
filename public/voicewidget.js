/**
 * Voice Widget - Embeddable Voice AI Assistant
 * Version 1.0.0
 */

(function() {
  // Create widget styles
  const style = document.createElement('style');
  style.textContent = `
    .voice-widget-container {
      position: fixed;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
    
    .voice-widget-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      max-width: calc(100vw - 32px);
      background-color: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.1);
      transform: scale(0.95);
      opacity: 0;
      pointer-events: none;
    }
    
    .voice-widget-panel.active {
      transform: scale(1);
      opacity: 1;
      pointer-events: all;
    }
    
    .voice-widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      background-color: #f9f9f9;
    }
    
    .voice-widget-title {
      font-weight: 600;
      font-size: 16px;
      margin: 0;
      color: #333;
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
      transition: background-color 0.2s ease;
    }
    
    .voice-widget-control-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .voice-widget-reset-button {
      background-color: #4CAF50;
      color: white;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: 8px;
      transition: background-color 0.2s ease;
    }
    
    .voice-widget-reset-button:hover {
      background-color: #45a049;
    }
    
    .voice-widget-chat {
      height: 300px;
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
      background-color: #f0f0f0;
      margin-right: auto;
      border-top-left-radius: 4px;
    }
    
    .voice-widget-message-user {
      background-color: #e1f5fe;
      margin-left: auto;
      border-top-right-radius: 4px;
    }
    
    .voice-widget-footer {
      padding: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      background-color: #f9f9f9;
    }
    
    .voice-widget-transcript {
      min-height: 24px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #666;
      font-style: italic;
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
      font-size: 14px;
      font-weight: 500;
    }
    
    .voice-widget-mic-button:hover {
      opacity: 0.9;
    }
    
    .voice-widget-status {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 8px;
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
    
    .voice-widget-visualizer {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      margin-bottom: 16px;
    }
    
    .voice-widget-visualizer-bar {
      width: 4px;
      height: 100%;
      background-color: #8a2387;
      margin: 0 2px;
      border-radius: 2px;
      animation: none;
    }
    
    .voice-widget-visualizer-bar.active {
      animation: sound 0.5s infinite alternate;
    }
    
    @keyframes sound {
      0% {
        height: 10%;
      }
      100% {
        height: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  // Main widget class
  class VoiceWidget {
    constructor(config = {}) {
      this.config = {
        position: 'bottom-right',
        webhookUrl: '',
        apiKey: '',
        ttsProvider: 'deepgram',
        deepgramApiKey: '6915c6d15184afacb050f65c9fa22bf35b193160', // Default Deepgram API key
        ...config
      };
      
      this.container = null;
      this.panel = null;
      this.toggleButton = null;
      this.isOpen = false;
      this.isListening = false;
      this.isSpeaking = false;
      this.isProcessing = false;
      this.messages = [];
      this.transcript = '';
      this.recognition = null;
      this.audioContext = null;
      this.visualizerBars = [];
      this.audioElement = null;
      this.currentAudioUrl = null;
      
      // Initialize the widget
      this.init();
    }
    
    init() {
      // Create container
      this.container = document.createElement('div');
      this.container.className = `voice-widget-container ${this.config.position}`;
      document.body.appendChild(this.container);
      
      // Create toggle button
      this.toggleButton = document.createElement('button');
      this.toggleButton.className = 'voice-widget-button';
      this.toggleButton.setAttribute('aria-label', this.config.buttonLabel);
      this.toggleButton.innerHTML = this.getMicrophoneIcon();
      this.toggleButton.addEventListener('click', () => this.togglePanel());
      this.container.appendChild(this.toggleButton);
      
      // Create panel
      this.panel = document.createElement('div');
      this.panel.className = 'voice-widget-panel';
      this.container.appendChild(this.panel);
      
      // Render initial panel content
      this.renderPanel();
      
      // Add greeting message
      if (this.config.greetingMessage) {
        this.addMessage(this.config.greetingMessage, 'ai');
      }
      
      // Initialize speech recognition if supported
      this.initSpeechRecognition();
    }
    
    getMicrophoneIcon() {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>`;
    }
    
    getCloseIcon() {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>`;
    }
    
    renderPanel() {
      this.panel.innerHTML = `
        <div class="voice-widget-header">
          <h3 class="voice-widget-title">Voice Assistant</h3>
          <div class="voice-widget-controls">
            <button class="voice-widget-reset-button" id="voice-widget-reset" title="Reset conversation">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
            <button class="voice-widget-control-button" id="voice-widget-close">
              ${this.getCloseIcon()}
            </button>
          </div>
        </div>
        
        <div class="voice-widget-chat" id="voice-widget-chat">
          ${this.renderMessages()}
        </div>
        
        <div class="voice-widget-footer">
          <div class="voice-widget-visualizer" id="voice-widget-visualizer">
            ${this.renderVisualizer()}
          </div>
          
          <div class="voice-widget-transcript" id="voice-widget-transcript">
            ${this.transcript || ''}
          </div>
          
          <button class="voice-widget-mic-button ${this.isListening ? 'voice-widget-pulse' : ''}" id="voice-widget-mic">
            ${this.getMicrophoneIcon()}
            <span style="margin-left: 8px;">${this.isListening ? 'Listening...' : 'Click to speak'}</span>
          </button>
          
          <div class="voice-widget-status" id="voice-widget-status">
            ${this.getStatusText()}
          </div>
        </div>
      `;
      
      // Add event listeners
      const closeButton = this.panel.querySelector('#voice-widget-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.togglePanel());
      }
      
      const resetButton = this.panel.querySelector('#voice-widget-reset');
      if (resetButton) {
        resetButton.addEventListener('click', () => this.resetConversation());
      }
      
      const micButton = this.panel.querySelector('#voice-widget-mic');
      if (micButton) {
        micButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleListening();
        });
      }
      
      // Initialize visualizer bars
      this.visualizerBars = Array.from(this.panel.querySelectorAll('.voice-widget-visualizer-bar'));
    }
    
    renderVisualizer() {
      let bars = '';
      for (let i = 0; i < 10; i++) {
        bars += `<div class="voice-widget-visualizer-bar ${this.isListening ? 'active' : ''}"></div>`;
      }
      return bars;
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
      if (this.isSpeaking) return 'Speaking...';
      if (this.isListening) return 'Listening...';
      return 'Click the microphone to speak';
    }
    
    togglePanel() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.panel.classList.add('active');
      } else {
        this.panel.classList.remove('active');
        // Stop listening if panel is closed
        if (this.isListening) {
          this.toggleListening();
        }
      }
    }
    
    toggleListening() {
      this.isListening = !this.isListening;
      
      // Update visualizer
      this.visualizerBars.forEach(bar => {
        if (this.isListening) {
          bar.classList.add('active');
          // Add random delay to each bar for more natural effect
          bar.style.animationDelay = `${Math.random() * 0.5}s`;
        } else {
          bar.classList.remove('active');
        }
      });
      
      if (this.isListening) {
        // Start recognition
        if (this.recognition) {
          try {
            this.recognition.start();
            console.log('Speech recognition started');
          } catch (error) {
            console.error('Error starting speech recognition:', error);
          }
        }
      } else {
        // Stop recognition
        if (this.recognition) {
          try {
            this.recognition.stop();
            console.log('Speech recognition stopped');
          } catch (error) {
            console.error('Error stopping speech recognition:', error);
          }
        }
      }
      
      // Re-render panel with updated state
      this.renderPanel();
    }
    
    initSpeechRecognition() {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('Speech recognition not supported in this browser');
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update transcript
        this.transcript = interimTranscript || finalTranscript;
        const transcriptElement = this.panel.querySelector('#voice-widget-transcript');
        if (transcriptElement) {
          transcriptElement.textContent = this.transcript;
        }
        
        // Process final transcript
        if (finalTranscript) {
          this.processUserInput(finalTranscript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        this.renderPanel();
      };
      
      this.recognition.onend = () => {
        // Only restart if we're still in listening mode
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('Error restarting speech recognition:', error);
            this.isListening = false;
            this.renderPanel();
          }
        }
      };
    }
    
    processUserInput(text) {
      // Add user message
      this.addMessage(text, 'user');
      
      // Show processing state
      this.isProcessing = true;
      this.renderPanel();
      
      // Add AI thinking message
      const thinkingMessage = { id: Date.now(), text: 'Thinking...', sender: 'ai', timestamp: Date.now() };
      this.messages.push(thinkingMessage);
      this.renderPanel();
      this.scrollToBottom();
      
      // Process with webhook if provided
      if (this.config.webhookUrl) {
        // Create a session ID if it doesn't exist in localStorage
        let sessionId = localStorage.getItem('n8n_session_id');
        if (!sessionId) {
          sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('n8n_session_id', sessionId);
        }
        
        // Format the conversation history like the main app
        const conversationHistory = this.messages
          .filter(m => m !== thinkingMessage)
          .map(msg => ({
            content: msg.text,
            isUser: msg.sender === 'user',
            timestamp: new Date(msg.timestamp).toISOString()
          }));
        
        // Format the payload to match the expected format by n8n
        const payload = {
          action: 'sendMessage',
          sessionId: sessionId,
          chatInput: text,
          message: text,
          type: 'text',
          timestamp: new Date().toISOString(),
          conversationHistory: conversationHistory
        };
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        
        console.log('Sending to n8n webhook:', this.config.webhookUrl);
        console.log('Payload:', JSON.stringify(payload));
        
        fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Try to parse the response as JSON, but fall back to text if it's not valid JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return response.json();
            } else {
              return response.text().then(text => {
                try {
                  return JSON.parse(text);
                } catch (e) {
                  return text;
                }
              });
            }
          })
          .then(data => {
            console.log('Response from n8n:', data);
            
            // Extract the response text based on the data format
            let botResponseText = '';
            
            if (typeof data === 'string') {
              botResponseText = data;
            } else if (data.output) { // n8n AI format
              botResponseText = data.output;
            } else if (data.message) {
              botResponseText = data.message;
            } else if (data.response) {
              botResponseText = data.response;
            } else if (data.content) {
              botResponseText = data.content;
            } else if (data.text) {
              botResponseText = data.text;
            }
            
            const responseText = botResponseText || "I received your message but I'm not sure how to respond.";
            
            // Update AI message
            const messageIndex = this.messages.findIndex(m => m === thinkingMessage);
            if (messageIndex !== -1) {
              this.messages[messageIndex] = { 
                id: thinkingMessage.id, 
                text: responseText, 
                sender: 'ai', 
                timestamp: Date.now() 
              };
            }
            
            // Generate speech if TTS is configured
            if (this.config.ttsProvider && responseText) {
              this.generateSpeech(responseText);
            }
            
            this.renderPanel();
            this.scrollToBottom();
          })
          .catch(error => {
            console.error('Error processing with webhook:', error);
            // Update with error message
            const messageIndex = this.messages.findIndex(m => m === thinkingMessage);
            if (messageIndex !== -1) {
              this.messages[messageIndex] = { 
                id: thinkingMessage.id, 
                text: "I'm sorry, I couldn't process that request. Please try again.", 
                sender: 'ai', 
                timestamp: Date.now() 
              };
            }
            this.renderPanel();
            this.scrollToBottom();
          })
          .finally(() => {
            this.isProcessing = false;
            this.renderPanel();
          });
      } else {
        // Demo response if no webhook
        setTimeout(() => {
          const messageIndex = this.messages.findIndex(m => m === thinkingMessage);
          if (messageIndex !== -1) {
            this.messages[messageIndex] = { 
              id: thinkingMessage.id, 
              text: "This is a demo response. Please configure a webhook URL to process real requests.", 
              sender: 'ai', 
              timestamp: Date.now() 
            };
          }
          this.isProcessing = false;
          this.renderPanel();
          this.scrollToBottom();
        }, 1000);
      }
    }
    
    scrollToBottom() {
      // Scroll chat to bottom
      setTimeout(() => {
        const chatContainer = this.panel.querySelector('#voice-widget-chat');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
    
    sendToWebhook(text) {
      return new Promise((resolve, reject) => {
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        
        // Format messages in the same way as the main application
        const formattedMessages = this.messages.map(m => ({
          id: m.id,
          text: m.text,
          sender: m.sender,
          timestamp: m.timestamp || Date.now()
        }));
        
        fetch(this.config.webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text,
            messages: formattedMessages,
            mode: 'standard',
            ttsProvider: this.config.ttsProvider || 'deepgram'
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // Handle the response in the same way as the main application
            const responseText = data.response || data.text || data.message || data;
            
            // Generate speech if TTS is configured
            if (this.config.ttsProvider && responseText) {
              this.generateSpeech(responseText);
            }
            
            resolve(responseText);
          })
          .catch(error => {
            console.error('Error sending to webhook:', error);
            reject(error);
          });
      });
    }
    
    generateSpeech(text) {
      if (!text || !this.config.ttsProvider) return;
      
      this.isSpeaking = true;
      this.renderPanel();
      
      // Use Deepgram TTS API for high-quality voice
      if (this.config.ttsProvider === 'deepgram') {
        this.generateDeepgramSpeech(text);
      } else if ('speechSynthesis' in window) {
        // Fallback to browser's built-in speech synthesis
        this.generateBrowserSpeech(text);
      } else {
        console.log('Speech synthesis not supported');
        this.isSpeaking = false;
        this.renderPanel();
      }
    }
    
    generateDeepgramSpeech(text) {
      console.log('Generating speech with Deepgram:', text.substring(0, 50) + '...');
      
      // Get the API key from config
      const apiKey = this.config.deepgramApiKey;
      if (!apiKey) {
        console.error('Deepgram API key is required for TTS');
        this.isSpeaking = false;
        this.renderPanel();
        return;
      }
      
      // Create audio element if it doesn't exist
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.addEventListener('ended', () => {
          this.isSpeaking = false;
          this.renderPanel();
        });
        this.audioElement.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          this.isSpeaking = false;
          this.renderPanel();
        });
      }
      
      // Make request to Deepgram TTS API
      fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKey}`
        },
        body: JSON.stringify({
          text: text
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Deepgram TTS API error: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Create object URL from blob
        const audioUrl = URL.createObjectURL(blob);
        
        // Clean up previous audio URL if it exists
        if (this.currentAudioUrl) {
          URL.revokeObjectURL(this.currentAudioUrl);
        }
        
        this.currentAudioUrl = audioUrl;
        this.audioElement.src = audioUrl;
        
        // Play the audio
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Audio play error:', err);
            
            // If autoplay was prevented, try with user interaction
            if (err.name === 'NotAllowedError') {
              console.log('Autoplay prevented. User interaction required.');
            }
            
            this.isSpeaking = false;
            this.renderPanel();
          });
        }
      })
      .catch(error => {
        console.error('Error generating speech with Deepgram:', error);
        this.isSpeaking = false;
        this.renderPanel();
      });
    }
    
    generateBrowserSpeech(text) {
      // Use browser's built-in speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices
        let voices = window.speechSynthesis.getVoices();
        
        // If voices array is empty, wait for voices to load
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            this.setFemaleVoice(utterance, voices);
          };
        } else {
          this.setFemaleVoice(utterance, voices);
        }
        
        // Set other properties
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Slightly higher pitch for female voice
        utterance.volume = 1.0;
        
        utterance.onend = () => {
          this.isSpeaking = false;
          this.renderPanel();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          this.isSpeaking = false;
          this.renderPanel();
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        console.log('Speech synthesis not supported');
        this.isSpeaking = false;
        this.renderPanel();
      }
    }
    
    setFemaleVoice(utterance, voices) {
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang}) - Female: ${v.name.includes('Female') || v.name.includes('female')}`));
      
      // Try to find a female voice in this priority:
      // 1. English female voice with "female" in the name
      // 2. Any English female voice
      // 3. Any female voice
      // 4. Any English voice
      // 5. First available voice
      
      let femaleVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Female') || voice.name.includes('female'))
      );
      
      if (!femaleVoice) {
        // Try Microsoft voices which are often female but don't have "female" in the name
        femaleVoice = voices.find(voice => 
          voice.lang.includes('en') && 
          (voice.name.includes('Zira') || voice.name.includes('Microsoft') || voice.name.includes('Google'))
        );
      }
      
      if (!femaleVoice) {
        // Try any female voice
        femaleVoice = voices.find(voice => 
          voice.name.includes('Female') || voice.name.includes('female')
        );
      }
      
      if (!femaleVoice) {
        // Fallback to any English voice
        femaleVoice = voices.find(voice => voice.lang.includes('en'));
      }
      
      // Final fallback to first voice
      utterance.voice = femaleVoice || voices[0];
      
      console.log('Selected voice:', utterance.voice ? utterance.voice.name : 'Default voice');
    }
    
    addMessage(text, sender) {
      this.messages.push({
        id: Date.now(),
        text,
        sender,
        timestamp: Date.now()
      });
      
      this.renderPanel();
      this.scrollToBottom();
    }
    
    destroy() {
      // Stop any ongoing processes
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
      
      // Remove container from DOM
      if (this.container && document.body.contains(this.container)) {
        document.body.removeChild(this.container);
      }
    }
    
    resetConversation() {
      // Clear messages
      this.messages = [];
      this.transcript = '';
      
      // Generate a new session ID
      const newSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('n8n_session_id', newSessionId);
      console.log('Chat session reset with new session ID:', newSessionId);
      
      // Update UI
      this.renderPanel();
      this.scrollToBottom();
    }
  }
  
  // Export to window for usage in script tags
  window.VoiceWidget = VoiceWidget;
})();