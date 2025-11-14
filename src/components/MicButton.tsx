"use client";

import { cn } from "@/lib/utils";
import { MicIcon } from "./icons/MicIcon";
import { StopIcon } from "./icons/StopIcon";

interface MicButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
  className?: string;
}

export function MicButton({
  isListening,
  onStartListening,
  onStopListening,
  disabled,
  className,
}: MicButtonProps) {
  const handleClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300",
        "focus:outline-none focus:ring-4 focus:ring-primary/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isListening
          ? "w-16 h-16 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse"
          : "w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl",
        className
      )}
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      {isListening ? (
        <StopIcon className="w-8 h-8 text-white" />
      ) : (
        <MicIcon className="w-8 h-8 text-white" />
      )}
      
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
      )}
    </button>
  );
}
