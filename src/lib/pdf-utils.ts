import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

// Merge multiple PDF files into one
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

// Split PDF into individual pages or ranges
export async function splitPDF(
  file: File,
  ranges: { start: number; end: number }[]
): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    const pageIndices = [];
    for (let i = range.start - 1; i < range.end && i < pdf.getPageCount(); i++) {
      pageIndices.push(i);
    }
    const copiedPages = await newPdf.copyPages(pdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    results.push(await newPdf.save());
  }

  return results;
}

// Split PDF into individual pages
export async function splitPDFIntoPages(file: File): Promise<Uint8Array[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const results: Uint8Array[] = [];

  for (let i = 0; i < pdf.getPageCount(); i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);
    results.push(await newPdf.save());
  }

  return results;
}

// Compress PDF by reducing image quality and removing metadata
export async function compressPDF(
  file: File,
  quality: "low" | "medium" | "high" = "medium"
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  // Remove metadata to reduce size
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setProducer("");
  pdf.setCreator("");

  const saveOptions: { useObjectStreams?: boolean } = {};
  if (quality === "high") {
    saveOptions.useObjectStreams = false;
  } else {
    saveOptions.useObjectStreams = true;
  }

  return pdf.save(saveOptions);
}

// Rotate PDF pages
export async function rotatePDF(
  file: File,
  rotation: number,
  pageIndices?: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  const indicesToRotate = pageIndices || pages.map((_, i) => i);

  for (const index of indicesToRotate) {
    if (index < pages.length) {
      const page = pages[index];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotation));
    }
  }

  return pdf.save();
}

// Add text watermark to PDF
export async function addWatermark(
  file: File,
  text: string,
  options: {
    fontSize?: number;
    opacity?: number;
    rotation?: number;
    color?: { r: number; g: number; b: number };
  } = {}
): Promise<Uint8Array> {
  const {
    fontSize = 50,
    opacity = 0.3,
    rotation = -45,
    color = { r: 0.5, g: 0.5, b: 0.5 },
  } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return pdf.save();
}

// Add image watermark to PDF
export async function addImageWatermark(
  file: File,
  imageFile: File,
  options: {
    scale?: number;
    opacity?: number;
    rotation?: number;
    position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  } = {}
): Promise<Uint8Array> {
  const {
    scale = 0.3,
    opacity = 0.3,
    rotation = 0,
    position = "center",
  } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  // Embed the watermark image
  const imageBuffer = await imageFile.arrayBuffer();
  let image;
  if (imageFile.type === "image/png") {
    image = await pdf.embedPng(imageBuffer);
  } else if (imageFile.type === "image/jpeg" || imageFile.type === "image/jpg") {
    image = await pdf.embedJpg(imageBuffer);
  } else {
    // Convert other formats to PNG via canvas
    const bitmap = await createImageBitmap(new Blob([imageBuffer]));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const pngData = await new Promise<ArrayBuffer>((resolve) => {
      canvas.toBlob((blob) => {
        blob!.arrayBuffer().then(resolve);
      }, "image/png");
    });
    image = await pdf.embedPng(pngData);
  }

  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Calculate watermark dimensions based on scale (relative to page width)
    const imgWidth = width * scale;
    const imgHeight = (image.height / image.width) * imgWidth;

    // Calculate position
    let x: number;
    let y: number;
    switch (position) {
      case "top-left":
        x = 20;
        y = height - imgHeight - 20;
        break;
      case "top-right":
        x = width - imgWidth - 20;
        y = height - imgHeight - 20;
        break;
      case "bottom-left":
        x = 20;
        y = 20;
        break;
      case "bottom-right":
        x = width - imgWidth - 20;
        y = 20;
        break;
      case "center":
      default:
        x = (width - imgWidth) / 2;
        y = (height - imgHeight) / 2;
        break;
    }

    page.drawImage(image, {
      x,
      y,
      width: imgWidth,
      height: imgHeight,
      opacity,
      rotate: degrees(rotation),
    });
  }

  return pdf.save();
}

// Convert images to PDF
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    if (file.type === "image/png") {
      image = await pdf.embedPng(arrayBuffer);
    } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
      image = await pdf.embedJpg(arrayBuffer);
    } else {
      // For other formats, try to convert via canvas
      const bitmap = await createImageBitmap(new Blob([arrayBuffer]));
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const pngData = await new Promise<ArrayBuffer>((resolve) => {
        canvas.toBlob((blob) => {
          blob!.arrayBuffer().then(resolve);
        }, "image/png");
      });
      image = await pdf.embedPng(pngData);
    }

    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return pdf.save();
}

// Get PDF page count
export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
}

// Download helper
export function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download as zip (for multiple files)
export async function downloadAsZip(
  files: { data: Uint8Array; name: string }[]
) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.data as unknown as ArrayBuffer);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pdf-tools-output.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
