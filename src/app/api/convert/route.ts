import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.CLOUDCONVERT_API_KEY;
const BASE_URL = "https://api.cloudconvert.com/v2";

export const maxDuration = 60; // 60 second timeout for Vercel

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

    // Step 1: Create a job with upload task + convert task + export task
    const jobResponse = await fetch(`${BASE_URL}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "upload-file": {
            operation: "import/upload",
          },
          "convert-file": {
            operation: "convert",
            input: ["upload-file"],
            input_format: inputFormat,
            output_format: outputFormat,
          },
          "export-file": {
            operation: "export/url",
            input: ["convert-file"],
          },
        },
      }),
    });

    if (!jobResponse.ok) {
      const err = await jobResponse.text();
      console.error("Job creation failed:", err);
      return NextResponse.json({ error: "Conversion service error" }, { status: 502 });
    }

    const job = await jobResponse.json();

    // Step 2: Find the upload task and upload the file
    const uploadTask = job.data.tasks.find((t: { name: string }) => t.name === "upload-file");
    if (!uploadTask || !uploadTask.result || !uploadTask.result.form) {
      return NextResponse.json({ error: "Upload task not ready" }, { status: 502 });
    }

    const uploadForm = new FormData();
    // Add all form parameters from CloudConvert
    for (const [key, value] of Object.entries(uploadTask.result.form.parameters)) {
      uploadForm.append(key, value as string);
    }
    // Add the actual file
    const fileBuffer = await file.arrayBuffer();
    uploadForm.append("file", new Blob([fileBuffer]), file.name);

    const uploadResponse = await fetch(uploadTask.result.form.url, {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadResponse.ok) {
      return NextResponse.json({ error: "File upload failed" }, { status: 502 });
    }

    // Step 3: Wait for job completion (poll)
    let attempts = 0;
    let jobStatus = "";
    let exportUrl = "";

    while (attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;

      const statusResponse = await fetch(`${BASE_URL}/jobs/${job.data.id}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });

      if (!statusResponse.ok) continue;

      const statusData = await statusResponse.json();
      jobStatus = statusData.data.status;

      if (jobStatus === "finished") {
        const exportTask = statusData.data.tasks.find(
          (t: { name: string; status: string }) => t.name === "export-file" && t.status === "finished"
        );
        if (exportTask && exportTask.result && exportTask.result.files && exportTask.result.files.length > 0) {
          exportUrl = exportTask.result.files[0].url;
        }
        break;
      } else if (jobStatus === "error") {
        const errorTask = statusData.data.tasks.find((t: { status: string }) => t.status === "error");
        console.error("Conversion error:", errorTask?.message);
        return NextResponse.json({ error: "Conversion failed: " + (errorTask?.message || "unknown error") }, { status: 502 });
      }
    }

    if (!exportUrl) {
      return NextResponse.json({ error: "Conversion timed out" }, { status: 504 });
    }

    // Step 4: Download the converted file and return it
    const fileResponse = await fetch(exportUrl);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: "Failed to download converted file" }, { status: 502 });
    }

    const convertedBuffer = await fileResponse.arrayBuffer();

    // Determine content type
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
    console.error("Conversion API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
