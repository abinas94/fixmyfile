"use client";

import { Loader2, Download, CheckCircle } from "lucide-react";

interface ProcessingButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  isComplete: boolean;
  label: string;
  disabled?: boolean;
}

export default function ProcessingButton({
  onClick,
  isProcessing,
  isComplete,
  label,
  disabled = false,
}: ProcessingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={`
        relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base
        transition-all duration-300 shadow-lg
        ${
          isComplete
            ? "bg-green-500 text-white shadow-green-500/30 hover:bg-green-600"
            : isProcessing
            ? "bg-[var(--primary)] text-white opacity-80 cursor-wait"
            : disabled
            ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/30 hover:scale-105 active:scale-95"
        }
      `}
    >
      {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
      {isComplete && <CheckCircle className="w-5 h-5" />}
      {!isProcessing && !isComplete && <Download className="w-5 h-5" />}
      {isProcessing ? "Processing..." : isComplete ? "Done!" : label}
    </button>
  );
}
