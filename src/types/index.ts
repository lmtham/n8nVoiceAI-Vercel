
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  pending?: boolean;
}

export interface VoiceSettings {
  voiceId: string;
  modelId: string;
  stability: number;
  clarity: number;
  speechRate: number;
}

export interface N8nWebhookConfig {
  webhookUrl: string;
  apiKey?: string;
  mode?: 'standard' | 'popup';
  initialMessages?: Message[];
  showWelcomeScreen?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptResult {
  text: string;
  words?: TranscriptWord[];
  isFinal: boolean;
}

export interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  pending?: boolean;
}

export interface WidgetProps {
  webhookUrl: string;
  apiKey?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  buttonLabel?: string;
  greetingMessage?: string;
  theme?: 'light' | 'dark' | 'system';
  mode?: 'standard' | 'popup';
  initialMessages?: Message[];
  showWelcomeScreen?: boolean;
}

export interface VoiceRecorderProps {
  onTranscriptReceived: (transcript: TranscriptResult) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}
