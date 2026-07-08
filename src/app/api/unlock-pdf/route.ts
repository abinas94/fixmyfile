import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.CLOUDCONVERT_API_KEY;
const BASE_URL = "https://api.cloudconvert.com/v2";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!API_KEY) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Step 1: Upload
    const uploadRes = await fetch(`${BASE_URL}/import/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!uploadRes.ok) return NextResponse.json({ error: "Service unavailable" }, { status: 502 });

    const uploadData = await uploadRes.json();
    const uploadTaskId = uploadData.data.id;
    const uploadUrl = uploadData.data.result.form.url;
    const uploadParams = uploadData.data.result.form.parameters;

    const uploadForm = new FormData();
    for (const [key, value] of Object.entries(uploadParams)) uploadForm.append(key, value as string);
    uploadForm.append("file", new Blob([await file.arrayBuffer()]), file.name);
    await fetch(uploadUrl, { method: "POST", body: uploadForm });

    // Step 2: Convert PDF to PDF without encryption (decrypt)
    const convertBody: Record<string, unknown> = {
      input: [uploadTaskId],
      input_format: "pdf",
      output_format: "pdf",
      engine: "qpdf",
      decrypt: true,
    };
    if (password) convertBody.input_password = password;

    const convertRes = await fetch(`${BASE_URL}/convert`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(convertBody),
    });

    if (!convertRes.ok) {
      const err = await convertRes.text();
      console.error("Convert failed:", err);
      return NextResponse.json({ error: "Unlock failed — check if password is correct" }, { status: 502 });
    }

    const convertData = await convertRes.json();
    const convertTaskId = convertData.data.id;

    // Wait
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000)); attempts++;
      const s = await fetch(`${BASE_URL}/tasks/${convertTaskId}`, { headers: { Authorization: `Bearer ${API_KEY}` } });
      const d = await s.json();
      if (d.data.status === "finished") break;
      if (d.data.status === "error") return NextResponse.json({ error: "Unlock failed: " + (d.data.message || "wrong password?") }, { status: 502 });
    }

    // Export
    const exportRes = await fetch(`${BASE_URL}/export/url`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ input: [convertTaskId] }),
    });
    const exportData = await exportRes.json();
    const exportTaskId = exportData.data.id;

    let exportUrl = "";
    attempts = 0;
    while (attempts < 15) {
      await new Promise((r) => setTimeout(r, 1500)); attempts++;
      const s = await fetch(`${BASE_URL}/tasks/${exportTaskId}`, { headers: { Authorization: `Bearer ${API_KEY}` } });
      const d = await s.json();
      if (d.data.status === "finished" && d.data.result?.files?.length) { exportUrl = d.data.result.files[0].url; break; }
    }
    if (!exportUrl) return NextResponse.json({ error: "Timeout" }, { status: 504 });

    const fileRes = await fetch(exportUrl);
    const buffer = await fileRes.arrayBuffer();

    // Cleanup
    fetch(`${BASE_URL}/tasks/${uploadTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});
    fetch(`${BASE_URL}/tasks/${convertTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});
    fetch(`${BASE_URL}/tasks/${exportTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }).catch(() => {});

    return new NextResponse(buffer, {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="unlocked.pdf"' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
