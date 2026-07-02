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
};

export default function ToolCard({ tool }: { tool: ToolConfig }) {
  const Icon = iconMap[tool.icon] || Layers;

  return (
    <Link href={tool.href} className="group block">
      <div className="relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 h-full">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          {tool.description}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Client-side
        </div>
      </div>
    </Link>
  );
}
