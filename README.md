# FixMyFile — Free Online File Tools

**55+ free browser-based tools for PDFs, images, documents, and more.**

🔗 **Live:** [https://fixmyfile.vercel.app](https://fixmyfile.vercel.app)

---

## What makes it different

- **100% client-side** — your files never leave your browser
- **No sign-up** — use any tool instantly
- **No file size limits** — process files of any size
- **Works offline** — PWA with service worker caching
- **Mobile-first** — designed for phones

---

## Tools

### PDF Tools
Merge, Split, Compress, Rotate, Watermark (text + image), Add Page Numbers, Crop, Sign, Protect, Unlock, Extract Pages, PDF to Image, PDF to Word, PDF to Excel, PDF to PowerPoint, Image to PDF, HTML to PDF, Excel to PDF, Scan to PDF, Pipeline Builder

### Image Tools
Background Remover (AI), Image Enhancer, Resize, Compress, Crop, Convert (PNG/JPG/WebP), Rotate & Flip, Watermark, Passport Photo Maker, Image to Base64

### OCR & Text Extraction
Image to Text (50+ languages), PDF OCR, Batch OCR, Receipt Scanner, Table Extractor

### Document Tools
Document Formatter (APA/IEEE/Corporate/Government), Word to PDF, PPT to PDF, PPT to Images, Compress PPT, Merge PPT, Word Counter, Case Converter, Text Formatter, Find & Replace, Remove Duplicates

### Calculators
EMI Calculator (with Loan Affordability Advisor), GST Calculator, SIP Calculator

### Developer Tools
JSON Formatter, Base64 Encode/Decode, URL Encoder/Decoder, Color Picker, QR Code Generator, QR & Barcode Scanner

---

## Tech Stack

- **Next.js 16** (React, TypeScript, Tailwind CSS)
- **pdf-lib** — PDF manipulation
- **Tesseract.js** — OCR engine
- **@imgly/background-removal** — AI background removal
- **pdfjs-dist** — PDF rendering
- **JSZip** — ZIP file handling
- **Deployed on Vercel** (zero cost)

---

## Privacy

All file processing happens in the browser using JavaScript/WebAssembly. No files are ever uploaded to any server. The site works fully offline after first load.

---

## License

MIT
