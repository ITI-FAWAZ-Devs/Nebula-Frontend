"use client";

import React, { useState } from "react";
import { ChevronDown, Cpu, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash", provider: "Google" },
  { id: "gemini", name: "Gemini Pro", provider: "Google" },
  { id: "bedrock", name: "Bedrock Gateway", provider: "AWS" },
];

interface ModelPickerProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelPicker({
  selectedModel,
  onSelectModel,
}: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/50 hover:text-white hover:border-white/20 transition-colors text-[11px] font-medium"
      >
        <Cpu className="h-3 w-3 text-primary" />
        <span>{currentModel.name}</span>
        <ChevronDown className="h-2.5 w-2.5 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-white/10 bg-background/95 backdrop-blur-md p-1.5 shadow-2xl z-50 flex flex-col gap-0.5">
            <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Select LLM Model
            </div>
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors",
                  selectedModel === model.id
                    ? "bg-primary/20 text-white font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex flex-col">
                  <span>{model.name}</span>
                  <span className="text-[10px] text-white/40">
                    {model.provider}
                  </span>
                </div>
                {selectedModel === model.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
