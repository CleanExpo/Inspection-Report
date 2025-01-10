import React, { useState, useCallback } from "react";

export interface VoiceInputProps {
  onCapture: (text: string) => void;
  className?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onCapture,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVoiceInput = useCallback(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-AU";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.start();

    setIsListening(true);
    setError(null);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcript:", transcript);
      setIsListening(false);
      onCapture(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setError('Failed to recognize speech');
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, [onCapture]);

  if (error) {
    return (
      <div className={`text-red-500 ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleVoiceInput}
        disabled={isListening}
        className={`
          flex items-center justify-center
          px-4 py-2 rounded
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
          text-white font-medium
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
      >
        <svg 
          className={`w-5 h-5 mr-2 ${isListening ? 'animate-pulse' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
        </svg>
        {isListening ? "Listening..." : "Start Voice Input"}
      </button>
    </div>
  );
};

export default VoiceInput;
