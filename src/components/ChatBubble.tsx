"use client";

import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Copy, Trash2, User, Bot } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ChatBubbleProps {
  message: Message;
  onDelete?: (id: string) => void;
  isStreaming?: boolean;
}

export function ChatBubble({ message, onDelete, isStreaming }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Message copied to clipboard");
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
          )}
        </div>
        
        <div
          className={cn(
            "absolute top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "-left-16" : "-right-16"
          )}
        >
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-background border border-border hover:bg-accent transition-colors"
            title="Copy message"
          >
            {copied ? (
              <span className="text-xs text-green-600">✓</span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md bg-background border border-border hover:bg-destructive/10 hover:border-destructive/20 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}