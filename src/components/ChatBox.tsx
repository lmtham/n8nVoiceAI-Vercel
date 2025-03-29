
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatBoxProps {
  messages: Message[];
  className?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, className }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (messages.length === 0) {
    return (
      <div className={cn("chat-container flex items-center justify-center text-muted-foreground", className)}>
        <p>Your conversation will appear here</p>
      </div>
    );
  }
  
  return (
    <div className={cn("chat-container", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "message",
            message.sender === 'user' ? "message-user" : "message-ai",
            message.pending && "opacity-70"
          )}
        >
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">
              {message.sender === 'user' ? 'You' : 'AI Assistant'}
            </span>
            <p className={cn("text-sm", message.pending && "animate-pulse")}>
              {message.text}
            </p>
            <span className="text-xs text-muted-foreground mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;
