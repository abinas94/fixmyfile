export async function convertFile(
  file: File,
  inputFormat: string,
  outputFormat: string,
  onProgress?: (msg: string) => void
): Promise<Blob> {
  onProgress?.("Uploading file...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("inputFormat", inputFormat);
  formData.append("outputFormat", outputFormat);

  const response = await fetch("/api/convert", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Conversion failed (${response.status})`);
  }

  onProgress?.("Downloading result...");
  const blob = await response.blob();
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
