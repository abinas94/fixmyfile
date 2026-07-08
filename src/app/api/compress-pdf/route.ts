import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.CLOUDCONVERT_API_KEY;
const BASE_URL = "https://api.cloudconvert.com/v2";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const quality = formData.get("quality") as string || "balanced";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // DPI settings based on quality level
    const dpiMap: Record<string, number> = {
      maximum: 72,    // Aggressive — smallest file
      balanced: 150,  // Good balance
      minimum: 300,   // Light compression
    };
    const targetDpi = dpiMap[quality] || 150;

    // Step 1: Create upload task
    const uploadTaskRes = await fetch(`${BASE_URL}/import/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!uploadTaskRes.ok) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 502 });
    }

    const uploadTaskData = await uploadTaskRes.json();
    const uploadTaskId = uploadTaskData.data.id;
    const uploadUrl = uploadTaskData.data.result.form.url;
    const uploadParams = uploadTaskData.data.result.form.parameters;

    // Step 2: Upload file
    const uploadForm = new FormData();
    for (const [key, value] of Object.entries(uploadParams)) {
      uploadForm.append(key, value as string);
    }
    uploadForm.append("file", new Blob([await file.arrayBuffer()]), file.name);

    const uploadRes = await fetch(uploadUrl, { method: "POST", body: uploadForm });
    if (!uploadRes.ok) {
      return NextResponse.json({ error: "Upload failed" }, { status: 502 });
    }

    // Step 3: Create optimize task (PDF-specific compression)
    const optimizeRes = await fetch(`${BASE_URL}/optimize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: [uploadTaskId],
        input_format: "pdf",
        engine: "qpdf",
        profile: quality === "maximum" ? "web" : quality === "minimum" ? "print" : "default",
      }),
    });

    if (!optimizeRes.ok) {
      // Fallback: use convert (pdf to pdf) with compression settings
      const convertRes = await fetch(`${BASE_URL}/convert`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          input: [uploadTaskId],
          input_format: "pdf",
          output_format: "pdf",
          engine: "libreoffice",
        }),
      });

      if (!convertRes.ok) {
        return NextResponse.json({ error: "Compression failed" }, { status: 502 });
      }

      const convertData = await convertRes.json();
      const convertTaskId = convertData.data.id;

      // Wait for conversion
      let attempts = 0;
      while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
        const statusRes = await fetch(`${BASE_URL}/tasks/${convertTaskId}`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        if (!statusRes.ok) continue;
        const status = await statusRes.json();
        if (status.data.status === "finished") break;
        if (status.data.status === "error") {
          return NextResponse.json({ error: "Compression failed" }, { status: 502 });
        }
      }

      // Export
      const exportRes = await fetch(`${BASE_URL}/export/url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input: [convertTaskId] }),
      });
      const exportData = await exportRes.json();
      const exportTaskId = exportData.data.id;

      attempts = 0;
      let exportUrl = "";
      while (attempts < 15) {
        await new Promise((r) => setTimeout(r, 1500));
        attempts++;
        const statusRes = await fetch(`${BASE_URL}/tasks/${exportTaskId}`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        const status = await statusRes.json();
        if (status.data.status === "finished" && status.data.result?.files?.length) {
          exportUrl = status.data.result.files[0].url;
          break;
        }
      }

      if (!exportUrl) return NextResponse.json({ error: "Timeout" }, { status: 504 });
      const fileRes = await fetch(exportUrl);
      const buffer = await fileRes.arrayBuffer();

      // Cleanup
      fetch(`${BASE_URL}/tasks/${uploadTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});
      fetch(`${BASE_URL}/tasks/${convertTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});
      fetch(`${BASE_URL}/tasks/${exportTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});

      return new NextResponse(buffer, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="compressed.pdf"' },
      });
    }

    // Optimize task succeeded
    const optimizeData = await optimizeRes.json();
    const optimizeTaskId = optimizeData.data.id;

    // Wait for optimization
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      const statusRes = await fetch(`${BASE_URL}/tasks/${optimizeTaskId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.data.status === "finished") break;
      if (status.data.status === "error") {
        return NextResponse.json({ error: "Optimization failed: " + (status.data.message || "") }, { status: 502 });
      }
    }

    // Export
    const exportRes = await fetch(`${BASE_URL}/export/url`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ input: [optimizeTaskId] }),
    });
    const exportData = await exportRes.json();
    const exportTaskId = exportData.data.id;

    attempts = 0;
    let exportUrl = "";
    while (attempts < 15) {
      await new Promise((r) => setTimeout(r, 1500));
      attempts++;
      const statusRes = await fetch(`${BASE_URL}/tasks/${exportTaskId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const status = await statusRes.json();
      if (status.data.status === "finished" && status.data.result?.files?.length) {
        exportUrl = status.data.result.files[0].url;
        break;
      }
    }

    if (!exportUrl) return NextResponse.json({ error: "Timeout" }, { status: 504 });

    const fileRes = await fetch(exportUrl);
    const buffer = await fileRes.arrayBuffer();

    // Cleanup all tasks
    fetch(`${BASE_URL}/tasks/${uploadTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});
    fetch(`${BASE_URL}/tasks/${optimizeTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});
    fetch(`${BASE_URL}/tasks/${exportTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});

    return new NextResponse(buffer, {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="compressed.pdf"' },
    });
  } catch (error) {
    console.error("Compress API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
