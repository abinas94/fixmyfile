"use client";

import { Shield, Server } from "lucide-react";

export default function ServerNotice() {
  return (
    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-xs">
      <div className="flex items-start gap-2">
        <Server className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-300">This tool uses server-side processing</p>
          <p className="text-amber-700 dark:text-amber-400 mt-0.5">
            Your file is temporarily sent to a secure conversion server for processing. 
            It is <strong>automatically deleted</strong> immediately after conversion — no files are stored.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-amber-600 dark:text-amber-400">
        <Shield className="w-3 h-3" />
        <span>Encrypted transfer (HTTPS) • Auto-deleted after conversion • GDPR compliant</span>
      </div>
    </div>
  );
}
