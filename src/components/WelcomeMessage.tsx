"use client";

import { Sparkles } from "lucide-react";

export function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        QuickInterview AI
      </h1>
      
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        Your voice-powered interview coach. Ask any interview question and get expert answers instantly.
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-md text-left">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className="text-2xl">🎤</span>
          <div>
            <h3 className="font-semibold mb-1">Voice-First</h3>
            <p className="text-sm text-muted-foreground">
              Simply speak your interview question
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold mb-1">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Get expert answers from top AI models
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className="text-2xl">💾</span>
          <div>
            <h3 className="font-semibold mb-1">History Saved</h3>
            <p className="text-sm text-muted-foreground">
              Review past conversations anytime
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-muted-foreground">
        Tap the microphone button below to get started
      </div>
    </div>
  );
}
