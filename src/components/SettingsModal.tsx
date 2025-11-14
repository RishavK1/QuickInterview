"use client";

import { AIProvider } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: AIProvider;
  apiKey: string;
  onSave: (provider: AIProvider, apiKey: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  provider,
  apiKey,
  onSave,
}: SettingsModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(provider);
  const [inputApiKey, setInputApiKey] = useState(apiKey);

  useEffect(() => {
    setSelectedProvider(provider);
    setInputApiKey(apiKey);
  }, [provider, apiKey, isOpen]);

  const handleSave = () => {
    onSave(selectedProvider, inputApiKey);
    onClose();
  };

  const getApiKeyPlaceholder = () => {
    switch (selectedProvider) {
      case 'gemini':
        return 'Enter your Gemini API key';
      case 'openai':
        return 'Enter your OpenAI API key (sk-...)';
      case 'claude':
        return 'Enter your Claude API key (sk-ant-...)';
      default:
        return 'Enter your API key';
    }
  };

  const getApiKeyLink = () => {
    switch (selectedProvider) {
      case 'gemini':
        return 'https://makersuite.google.com/app/apikey';
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'claude':
        return 'https://console.anthropic.com/settings/keys';
      default:
        return '#';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider and API key to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={(value) => setSelectedProvider(value as AIProvider)}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini (Free)</SelectItem>
                <SelectItem value="openai">OpenAI GPT</SelectItem>
                <SelectItem value="claude">Anthropic Claude</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred AI model provider
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={getApiKeyPlaceholder()}
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an API key?{' '}
              <a
                href={getApiKeyLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get one here
              </a>
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-semibold">💡 Quick Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Your API key is stored locally in your browser</li>
              <li>• Gemini offers a generous free tier</li>
              <li>• You can change providers anytime</li>
              <li>• API keys are never sent to our servers</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!inputApiKey.trim()}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
