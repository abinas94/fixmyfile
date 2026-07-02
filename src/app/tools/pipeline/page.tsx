"use client";

import { useState, useCallback } from "react";
import {
  Workflow,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Play,
  ArrowDown,
  Layers,
  Scissors,
  Minimize2,
  RotateCw,
  Stamp,
} from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import {
  mergePDFs,
  compressPDF,
  rotatePDF,
  addWatermark,
  splitPDFIntoPages,
  downloadBlob,
  downloadAsZip,
} from "@/lib/pdf-utils";

interface PipelineStep {
  id: string;
  type: "merge" | "split" | "compress" | "rotate" | "watermark";
  config: Record<string, unknown>;
}

const stepTypes = [
  {
    type: "merge" as const,
    label: "Merge",
    icon: Layers,
    description: "Combine all files into one",
    color: "from-red-500 to-rose-600",
  },
  {
    type: "split" as const,
    label: "Split Pages",
    icon: Scissors,
    description: "Split into individual pages",
    color: "from-orange-500 to-amber-600",
  },
  {
    type: "compress" as const,
    label: "Compress",
    icon: Minimize2,
    description: "Reduce file size",
    color: "from-green-500 to-emerald-600",
  },
  {
    type: "rotate" as const,
    label: "Rotate",
    icon: RotateCw,
    description: "Rotate pages",
    color: "from-teal-500 to-cyan-600",
  },
  {
    type: "watermark" as const,
    label: "Watermark",
    icon: Stamp,
    description: "Add text watermark",
    color: "from-pink-500 to-rose-600",
  },
];

export default function PipelineBuilder() {
  const [files, setFiles] = useState<File[]>([]);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setIsComplete(false);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addStep = (type: PipelineStep["type"]) => {
    const defaultConfig: Record<string, unknown> = {};
    if (type === "compress") defaultConfig.quality = "medium";
    if (type === "rotate") defaultConfig.rotation = 90;
    if (type === "watermark") {
      defaultConfig.text = "CONFIDENTIAL";
      defaultConfig.fontSize = 50;
      defaultConfig.opacity = 0.3;
    }

    setSteps((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, config: defaultConfig },
    ]);
    setShowAddStep(false);
    setIsComplete(false);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setIsComplete(false);
  };

  const updateStepConfig = (id: string, key: string, value: unknown) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, config: { ...s.config, [key]: value } } : s
      )
    );
  };

  const executePipeline = useCallback(async () => {
    if (files.length === 0 || steps.length === 0) return;
    setIsProcessing(true);

    try {
      // Helper to create a File from Uint8Array
      const toFile = (data: Uint8Array, name: string) =>
        new File([new Uint8Array(data) as unknown as BlobPart], name, { type: "application/pdf" });

      // Start with the uploaded files as byte arrays
      let currentFiles: { data: Uint8Array; name: string }[] = await Promise.all(
        files.map(async (f) => ({
          data: new Uint8Array(await f.arrayBuffer()),
          name: f.name,
        }))
      );

      for (const step of steps) {
        switch (step.type) {
          case "merge": {
            if (currentFiles.length > 1) {
              const blobs = currentFiles.map((f) => toFile(f.data, f.name));
              const merged = await mergePDFs(blobs);
              currentFiles = [{ data: merged, name: "merged.pdf" }];
            }
            break;
          }
          case "split": {
            const allPages: { data: Uint8Array; name: string }[] = [];
            for (const f of currentFiles) {
              const file = toFile(f.data, f.name);
              const pages = await splitPDFIntoPages(file);
              pages.forEach((p, i) =>
                allPages.push({
                  data: p,
                  name: `${f.name.replace(".pdf", "")}-page-${i + 1}.pdf`,
                })
              );
            }
            currentFiles = allPages;
            break;
          }
          case "compress": {
            const quality = (step.config.quality as "low" | "medium" | "high") || "medium";
            const compressed = await Promise.all(
              currentFiles.map(async (f) => {
                const file = toFile(f.data, f.name);
                const data = await compressPDF(file, quality);
                return { data, name: f.name };
              })
            );
            currentFiles = compressed;
            break;
          }
          case "rotate": {
            const rotation = (step.config.rotation as number) || 90;
            const rotated = await Promise.all(
              currentFiles.map(async (f) => {
                const file = toFile(f.data, f.name);
                const data = await rotatePDF(file, rotation);
                return { data, name: f.name };
              })
            );
            currentFiles = rotated;
            break;
          }
          case "watermark": {
            const text = (step.config.text as string) || "WATERMARK";
            const fontSize = (step.config.fontSize as number) || 50;
            const opacity = (step.config.opacity as number) || 0.3;
            const watermarked = await Promise.all(
              currentFiles.map(async (f) => {
                const file = toFile(f.data, f.name);
                const data = await addWatermark(file, text, {
                  fontSize,
                  opacity,
                });
                return { data, name: f.name };
              })
            );
            currentFiles = watermarked;
            break;
          }
        }
      }

      // Download results
      if (currentFiles.length === 1) {
        downloadBlob(currentFiles[0].data, `pipeline-${currentFiles[0].name}`);
      } else {
        await downloadAsZip(currentFiles);
      }

      setIsComplete(true);
    } catch (error) {
      console.error("Pipeline error:", error);
      alert("Error executing pipeline. Please check your files and try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [files, steps]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Workflow className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Pipeline Builder</h1>
            <p className="text-[var(--muted-foreground)]">
              Chain multiple operations in a single workflow
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Files */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-bold">
            1
          </span>
          Add your files
        </h2>
        <FileDropZone
          onFilesSelected={handleFilesSelected}
          accept=".pdf"
          multiple={true}
          maxFiles={50}
          files={files}
          onRemoveFile={handleRemoveFile}
          onReorderFiles={setFiles}
        />
      </div>

      {/* Step 2: Pipeline Steps */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-bold">
            2
          </span>
          Build your pipeline
        </h2>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const stepType = stepTypes.find((s) => s.type === step.type)!;
            const Icon = stepType.icon;

            return (
              <div key={step.id}>
                <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                  <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] mt-1 flex-shrink-0" />
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stepType.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{stepType.label}</p>
                      <button
                        onClick={() => removeStep(step.id)}
                        className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--muted-foreground)] hover:text-red-600"
                        aria-label="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Step-specific config */}
                    {step.type === "compress" && (
                      <select
                        value={step.config.quality as string}
                        onChange={(e) =>
                          updateStepConfig(step.id, "quality", e.target.value)
                        }
                        className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                      >
                        <option value="high">Maximum compression</option>
                        <option value="medium">Balanced</option>
                        <option value="low">Minimum compression</option>
                      </select>
                    )}
                    {step.type === "rotate" && (
                      <select
                        value={step.config.rotation as number}
                        onChange={(e) =>
                          updateStepConfig(
                            step.id,
                            "rotation",
                            Number(e.target.value)
                          )
                        }
                        className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)]"
                      >
                        <option value={90}>90° Right</option>
                        <option value={180}>180°</option>
                        <option value={270}>90° Left</option>
                      </select>
                    )}
                    {step.type === "watermark" && (
                      <input
                        type="text"
                        value={step.config.text as string}
                        onChange={(e) =>
                          updateStepConfig(step.id, "text", e.target.value)
                        }
                        placeholder="Watermark text"
                        className="mt-2 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] w-full"
                      />
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Step */}
        {showAddStep ? (
          <div className="mt-4 p-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]">
            <p className="text-sm font-medium mb-3">Choose an operation:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stepTypes.map((st) => {
                const Icon = st.icon;
                return (
                  <button
                    key={st.type}
                    onClick={() => addStep(st.type)}
                    className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] transition-all text-left"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${st.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{st.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowAddStep(false)}
              className="mt-3 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddStep(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add step</span>
          </button>
        )}
      </div>

      {/* Step 3: Execute */}
      {files.length > 0 && steps.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
            Run pipeline
          </h2>
          <ProcessingButton
            onClick={executePipeline}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Run Pipeline & Download"
          />
          <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
            <Play className="w-3 h-3" />
            {steps.length} step{steps.length > 1 ? "s" : ""} will be applied to{" "}
            {files.length} file{files.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-12 p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">About Pipeline Builder</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Chain multiple PDF operations together. For example: merge 5 PDFs →
          compress → add watermark → download. All processing happens in your
          browser — nothing is uploaded to any server.
        </p>
      </div>
    </div>
  );
}
