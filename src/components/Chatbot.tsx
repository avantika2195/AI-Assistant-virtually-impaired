import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Mic } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const processMessage = (text: string) => {
    const lowerText = text.toLowerCase();
    let response = '';

    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      response = 'Hello! How can I help you today?';
    } else if (lowerText.includes('help') || lowerText.includes('what can you do')) {
      response = 'I can help you with image recognition, navigation, and general assistance. What would you like to do?';
    } else if (lowerText.includes('what is the current time right now') || lowerText.includes('can you tell me what time it is')) {
      response = `The current time is ${new Date().toLocaleTimeString()}`;
    } else if (lowerText.includes('can you do something intresting') || lowerText.includes('what else can you do')) {
      response = 'I am not trained yet to help you with such things but i will be availble very soon with large amount of data to help you with every complex problem. Hope you will consider this time';
    } else if (lowerText.includes('how is todays weather') || lowerText.includes('what is the weather today')) {
      response = 'I apologize, but I currently don\'t have access to weather information. Would you like me to help you with something else?';
    } else {
      response = 'I\'m not sure how to help with that. Would you like me to describe your surroundings using the camera?';
    }

    return response;
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const userMessage: Message = { text: transcript, isUser: true };
      setMessages(prev => [...prev, userMessage]);

      const response = processMessage(transcript);
      const botMessage: Message = { text: response, isUser: false };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        speak(response);
      }, 500);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <button
        onClick={handleVoiceInput}
        disabled={isListening}
        className={`w-full flex items-center justify-center py-3 px-6 rounded-lg transition-colors ${
          isListening
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white`}
      >
        {isListening ? (
          <>
            <MessageCircle className="w-5 h-5 mr-2 animate-pulse" />
            Listening...
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            Hold to Speak
          </>
        )}
      </button>
    </div>
  );
}

