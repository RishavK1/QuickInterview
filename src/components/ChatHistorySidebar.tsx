"use client";

import { ChatSession } from "@/types";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onClose,
}: ChatHistorySidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-accent transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2">
          {sortedSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No chat history yet</p>
              <p className="text-xs mt-1">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                    currentSessionId === session.id
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                >
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 transition-all"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}