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
    const quality = (formData.get("quality") as string) || "balanced";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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

    // Step 3: Use convert (pdf to pdf) with Ghostscript engine for REAL compression
    // Ghostscript actually recompresses images and reduces quality
    const profileMap: Record<string, string> = {
      maximum: "ebook",     // ~150dpi — aggressive compression
      balanced: "printer",  // ~300dpi — good balance
      minimum: "prepress",  // ~300dpi high quality — light compression
    };
    const profile = profileMap[quality] || "printer";

    const convertRes = await fetch(`${BASE_URL}/convert`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: [uploadTaskId],
        input_format: "pdf",
        output_format: "pdf",
        engine: "ghostscript",
        engine_version: "10",
        pdf_a: false,
        pages: null,
        // Ghostscript profiles: screen (72dpi), ebook (150dpi), printer (300dpi), prepress (300dpi HQ)
        ghostscript_pdfsettings: `/${profile === "ebook" ? "ebook" : profile === "prepress" ? "prepress" : "printer"}`,
      }),
    });

    if (!convertRes.ok) {
      const err = await convertRes.text();
      console.error("Convert task failed:", err);
      
      // Fallback: try optimize with different engine
      const optimizeRes = await fetch(`${BASE_URL}/optimize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          input: [uploadTaskId],
          input_format: "pdf",
        }),
      });

      if (!optimizeRes.ok) {
        return NextResponse.json({ error: "Compression not available" }, { status: 502 });
      }

      const optimizeData = await optimizeRes.json();
      const taskId = optimizeData.data.id;
      const result = await waitForTask(taskId);
      if (!result) return NextResponse.json({ error: "Compression timeout" }, { status: 504 });

      const buffer = await downloadResult(taskId);
      if (!buffer) return NextResponse.json({ error: "Download failed" }, { status: 502 });

      cleanup([uploadTaskId, taskId]);
      return new NextResponse(buffer, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="compressed.pdf"' },
      });
    }

    const convertData = await convertRes.json();
    const convertTaskId = convertData.data.id;

    // Step 4: Wait for conversion
    const finished = await waitForTask(convertTaskId);
    if (!finished) {
      return NextResponse.json({ error: "Compression timed out" }, { status: 504 });
    }

    // Step 5: Download result
    const buffer = await downloadResult(convertTaskId);
    if (!buffer) {
      return NextResponse.json({ error: "Download failed" }, { status: 502 });
    }

    // Cleanup
    cleanup([uploadTaskId, convertTaskId]);

    return new NextResponse(buffer, {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="compressed.pdf"' },
    });
  } catch (error) {
    console.error("Compress API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function waitForTask(taskId: string): Promise<boolean> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) continue;
    const data = await res.json();
    if (data.data.status === "finished") return true;
    if (data.data.status === "error") {
      console.error("Task error:", data.data.message);
      return false;
    }
  }
  return false;
}

async function downloadResult(taskId: string): Promise<ArrayBuffer | null> {
  // Create export
  const exportRes = await fetch(`${BASE_URL}/export/url`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input: [taskId] }),
  });
  if (!exportRes.ok) return null;

  const exportData = await exportRes.json();
  const exportTaskId = exportData.data.id;

  // Wait for export
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch(`${BASE_URL}/tasks/${exportTaskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) continue;
    const data = await res.json();
    if (data.data.status === "finished" && data.data.result?.files?.length) {
      const fileUrl = data.data.result.files[0].url;
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) return null;

      // Clean export task
      fetch(`${BASE_URL}/tasks/${exportTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});

      return fileRes.arrayBuffer();
    }
    if (data.data.status === "error") return null;
  }
  return null;
}

function cleanup(taskIds: string[]) {
  for (const id of taskIds) {
    fetch(`${BASE_URL}/tasks/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});
  }
}
