"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { correctSpeechText } from '@/utils/speechCorrections';

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        
        // Configure recognition
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        // Handle results
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += transcriptPiece + ' ';
            } else {
              interimTranscript += transcriptPiece;
            }
          }
          
          const fullTranscript = finalTranscriptRef.current + interimTranscript;
          const correctedTranscript = correctSpeechText(fullTranscript);
          setTranscript(correctedTranscript);
        };

        // Handle errors
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          if (event.error === 'no-speech') {
            setError('No speech detected. Please try again.');
          } else if (event.error === 'audio-capture') {
            setError('No microphone found. Please check your device.');
          } else if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Please allow access.');
          } else {
            setError(`Error: ${event.error}`);
          }
          
          setIsListening(false);
        };

        // Handle end
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setError(null);
        finalTranscriptRef.current = '';
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start listening. Please try again.');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}
