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
    const inputFormat = formData.get("inputFormat") as string;
    const outputFormat = formData.get("outputFormat") as string;

    if (!file || !inputFormat || !outputFormat) {
      return NextResponse.json({ error: "Missing file, inputFormat, or outputFormat" }, { status: 400 });
    }

    // Step 1: Create upload task
    const uploadTaskRes = await fetch(`${BASE_URL}/import/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!uploadTaskRes.ok) {
      const err = await uploadTaskRes.text();
      console.error("Upload task creation failed:", err);
      return NextResponse.json({ error: "Service unavailable" }, { status: 502 });
    }

    const uploadTaskData = await uploadTaskRes.json();
    const uploadTaskId = uploadTaskData.data.id;
    const uploadUrl = uploadTaskData.data.result.form.url;
    const uploadParams = uploadTaskData.data.result.form.parameters;

    // Step 2: Upload the file
    const uploadForm = new FormData();
    for (const [key, value] of Object.entries(uploadParams)) {
      uploadForm.append(key, value as string);
    }
    const fileBuffer = await file.arrayBuffer();
    uploadForm.append("file", new Blob([fileBuffer]), file.name);

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      console.error("File upload failed:", await uploadRes.text());
      return NextResponse.json({ error: "File upload failed" }, { status: 502 });
    }

    // Step 3: Create convert task
    const convertBody: Record<string, unknown> = {
      input: [uploadTaskId],
      input_format: inputFormat,
      output_format: outputFormat,
    };

    // Add quality options for specific conversions
    if (inputFormat === "pdf" && outputFormat === "docx") {
      convertBody.engine = "libreoffice"; // Best for PDF to Word
    } else if (inputFormat === "pdf" && outputFormat === "xlsx") {
      convertBody.engine = "libreoffice";
    } else if (inputFormat === "pdf" && outputFormat === "pptx") {
      convertBody.engine = "libreoffice";
    } else if (outputFormat === "pdf") {
      convertBody.engine = "libreoffice"; // Best for any-to-PDF
      convertBody.pdf_a = false; // Standard PDF, not archival
    }

    const convertTaskRes = await fetch(`${BASE_URL}/convert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(convertBody),
    });

    if (!convertTaskRes.ok) {
      const err = await convertTaskRes.text();
      console.error("Convert task failed:", err);
      return NextResponse.json({ error: "Conversion failed" }, { status: 502 });
    }

    const convertTaskData = await convertTaskRes.json();
    const convertTaskId = convertTaskData.data.id;

    // Step 4: Wait for conversion to finish
    let convertStatus = "";
    let attempts = 0;
    while (attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;

      const statusRes = await fetch(`${BASE_URL}/tasks/${convertTaskId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });

      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();
      convertStatus = statusData.data.status;

      if (convertStatus === "finished") break;
      if (convertStatus === "error") {
        console.error("Conversion error:", statusData.data.message);
        return NextResponse.json({ error: "Conversion failed: " + (statusData.data.message || "unknown") }, { status: 502 });
      }
    }

    if (convertStatus !== "finished") {
      return NextResponse.json({ error: "Conversion timed out" }, { status: 504 });
    }

    // Step 5: Create export task
    const exportTaskRes = await fetch(`${BASE_URL}/export/url`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [convertTaskId],
        inline: false,
      }),
    });

    if (!exportTaskRes.ok) {
      return NextResponse.json({ error: "Export failed" }, { status: 502 });
    }

    const exportTaskData = await exportTaskRes.json();
    const exportTaskId = exportTaskData.data.id;

    // Step 5b: Delete the uploaded file from CloudConvert (privacy)
    fetch(`${BASE_URL}/tasks/${uploadTaskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${API_KEY}` },
    }).catch(() => {}); // Fire and forget

    // Step 6: Wait for export and get download URL
    let exportUrl = "";
    attempts = 0;
    while (attempts < 15) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      attempts++;

      const statusRes = await fetch(`${BASE_URL}/tasks/${exportTaskId}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });

      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();

      if (statusData.data.status === "finished" && statusData.data.result?.files?.length > 0) {
        exportUrl = statusData.data.result.files[0].url;
        break;
      }
      if (statusData.data.status === "error") {
        return NextResponse.json({ error: "Export failed" }, { status: 502 });
      }
    }

    if (!exportUrl) {
      return NextResponse.json({ error: "Export timed out" }, { status: 504 });
    }

    // Step 7: Download and return the converted file
    const fileRes = await fetch(exportUrl);
    if (!fileRes.ok) {
      return NextResponse.json({ error: "Download failed" }, { status: 502 });
    }

    const convertedBuffer = await fileRes.arrayBuffer();

    // Cleanup: delete all tasks from CloudConvert (files removed from their servers)
    Promise.all([
      fetch(`${BASE_URL}/tasks/${convertTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }),
      fetch(`${BASE_URL}/tasks/${exportTaskId}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_KEY}` } }),
    ]).catch(() => {});

    const contentTypes: Record<string, string> = {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
    };

    return new NextResponse(convertedBuffer, {
      headers: {
        "Content-Type": contentTypes[outputFormat] || "application/octet-stream",
        "Content-Disposition": `attachment; filename="converted.${outputFormat}"`,
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
