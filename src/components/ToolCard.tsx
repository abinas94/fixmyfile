import Link from "next/link";
import {
  Layers,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  RotateCw,
  Stamp,
  Workflow,
  FileOutput,
  Hash,
  Crop,
  PenTool,
  Lock,
  Unlock,
  Globe,
  Scaling,
  FileDown,
  RefreshCw,
  QrCode,
  Palette,
  UserSquare2,
  TextCursorInput,
  CaseSensitive,
  IndianRupee,
  Receipt,
  TrendingUp,
  Braces,
  Binary,
  Link as LinkIcon,
  FileText,
  Layout,
  AlignLeft,
  Search,
  ListX,
  ScanText,
  FileSearch,
  FolderSearch,
  ReceiptText,
  Table,
  Wand2,
  Eraser,
  ScanLine,
  Sparkles,
} from "lucide-react";
import type { ToolConfig } from "@/lib/tools-config";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  RotateCw,
  Stamp,
  Workflow,
  FileOutput,
  Hash,
  Crop,
  CropIcon: Crop,
  PenTool,
  Lock,
  Unlock,
  Globe,
  Scaling,
  FileDown,
  RefreshCw,
  QrCode,
  Palette,
  UserSquare: UserSquare2,
  TextCursorInput,
  CaseSensitive,
  IndianRupee,
  Receipt,
  TrendingUp,
  Braces,
  Binary,
  Link: LinkIcon,
  FileText,
  Layout,
  AlignLeft,
  Search,
  ListX,
  ScanText,
  FileSearch,
  FolderSearch,
  ReceiptText,
  Table,
  Wand2,
  Eraser,
  ScanLine,
  Sparkles,
};

export default function ToolCard({ tool }: { tool: ToolConfig }) {
  const Icon = iconMap[tool.icon] || Layers;

  return (
    <Link href={tool.href} className="group block">
      <div className="relative p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-center text-center">
        <div
          className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <h3 className="text-xs sm:text-sm lg:text-lg font-semibold mb-0.5 sm:mb-1 group-hover:text-[var(--primary)] transition-colors leading-tight">
          {tool.name}
        </h3>
        <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--muted-foreground)] line-clamp-2 hidden sm:block">
          {tool.description}
        </p>
        <div className="mt-2 sm:mt-3 lg:mt-4 inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[9px] sm:text-xs font-medium">
          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="hidden sm:inline">Client-side</span>
          <span className="sm:hidden">Free</span>
        </div>
      </div>
    </Link>
  );
}
