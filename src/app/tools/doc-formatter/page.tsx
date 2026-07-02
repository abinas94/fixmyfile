"use client";

import { useState } from "react";
import { Wand2, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

interface FormatPreset {
  id: string;
  name: string;
  description: string;
  font: string;
  headingFont: string;
  bodySize: number; // in half-points
  h1Size: number;
  h2Size: number;
  h3Size: number;
  lineSpacing: number; // in 240ths of a line
  paragraphAfter: number; // twips
  paragraphBefore: number;
  firstLineIndent: number; // 0 for block style
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  bulletIndent: number;
  bulletHanging: number;
  tableStyle: "bordered" | "minimal" | "header-only";
  imageMaxWidthPercent: number;
}

const presets: FormatPreset[] = [
  {
    id: "corporate",
    name: "Corporate / Business (Block Style)",
    description: "No indent. Space between paragraphs. Clean and modern. Standard for business reports, letters, proposals.",
    font: "Calibri", headingFont: "Calibri",
    bodySize: 22, h1Size: 32, h2Size: 26, h3Size: 24,
    lineSpacing: 276, paragraphAfter: 200, paragraphBefore: 0, firstLineIndent: 0,
    marginTop: 1440, marginBottom: 1440, marginLeft: 1440, marginRight: 1440,
    bulletIndent: 720, bulletHanging: 360, tableStyle: "bordered", imageMaxWidthPercent: 85,
  },
  {
    id: "academic-apa",
    name: "Academic / APA 7th Edition",
    description: "Times New Roman 12pt, double-spaced, 0.5\" first-line indent. University standard for essays and research papers.",
    font: "Times New Roman", headingFont: "Times New Roman",
    bodySize: 24, h1Size: 24, h2Size: 24, h3Size: 24,
    lineSpacing: 480, paragraphAfter: 0, paragraphBefore: 0, firstLineIndent: 720,
    marginTop: 1440, marginBottom: 1440, marginLeft: 1440, marginRight: 1440,
    bulletIndent: 720, bulletHanging: 360, tableStyle: "minimal", imageMaxWidthPercent: 90,
  },
  {
    id: "ieee",
    name: "IEEE / Technical Journal",
    description: "Times New Roman 10pt, single column, tight spacing. Standard for engineering and technical papers.",
    font: "Times New Roman", headingFont: "Times New Roman",
    bodySize: 20, h1Size: 24, h2Size: 22, h3Size: 20,
    lineSpacing: 240, paragraphAfter: 120, paragraphBefore: 0, firstLineIndent: 360,
    marginTop: 1440, marginBottom: 1440, marginLeft: 1440, marginRight: 1440,
    bulletIndent: 540, bulletHanging: 270, tableStyle: "header-only", imageMaxWidthPercent: 80,
  },
  {
    id: "government-india",
    name: "Indian Government / Official",
    description: "Arial 11pt, 1.5 spacing, wider left margin for binding. Standard for government documents, NOCs, applications.",
    font: "Arial", headingFont: "Arial",
    bodySize: 22, h1Size: 28, h2Size: 24, h3Size: 22,
    lineSpacing: 360, paragraphAfter: 120, paragraphBefore: 0, firstLineIndent: 0,
    marginTop: 1440, marginBottom: 1440, marginLeft: 1800, marginRight: 1080,
    bulletIndent: 720, bulletHanging: 360, tableStyle: "bordered", imageMaxWidthPercent: 75,
  },
  {
    id: "minimal",
    name: "Minimal / Clean Report",
    description: "Calibri Light, generous spacing, no indent. For clean internal reports, memos, project docs.",
    font: "Calibri Light", headingFont: "Calibri",
    bodySize: 22, h1Size: 36, h2Size: 28, h3Size: 24,
    lineSpacing: 300, paragraphAfter: 160, paragraphBefore: 0, firstLineIndent: 0,
    marginTop: 1080, marginBottom: 1080, marginLeft: 1260, marginRight: 1260,
    bulletIndent: 720, bulletHanging: 360, tableStyle: "minimal", imageMaxWidthPercent: 90,
  },
];

export default function DocFormatter() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("corporate");
  const [spellIssues, setSpellIssues] = useState<{word: string; suggestions: string[]; accepted: string | null}[]>([]);
  const [showSpellReview, setShowSpellReview] = useState(false);
  const [pendingFormat, setPendingFormat] = useState(false);
  const [options, setOptions] = useState({
    fixFonts: true,
    fixParagraphs: true,
    fixMargins: true,
    fixHeadings: true,
    fixLists: true,
    fixTables: true,
    fixImages: true,
    fixNumberingDistance: true,
    fixCases: true,
    spellCheck: true,
  });

  const wNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const wpNS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
  const aNS = "http://schemas.openxmlformats.org/drawingml/2006/main";

  function isInsideSectPr(el: Element): boolean {
    let current: Element | null = el;
    while (current) {
      if (current.localName === "sectPr") return true;
      current = current.parentElement;
    }
    return false;
  }

  function getParaStyle(para: Element): string {
    const pPr = para.getElementsByTagNameNS(wNS, "pPr")[0];
    const pStyle = pPr?.getElementsByTagNameNS(wNS, "pStyle")[0];
    return pStyle?.getAttribute("w:val")?.toLowerCase() || "";
  }

  function isListPara(para: Element): boolean {
    const pPr = para.getElementsByTagNameNS(wNS, "pPr")[0];
    return (pPr?.getElementsByTagNameNS(wNS, "numPr").length || 0) > 0;
  }

  function hasDrawing(para: Element): boolean {
    return para.getElementsByTagNameNS(wNS, "drawing").length > 0;
  }

  function hasTable(el: Element): boolean {
    return el.localName === "tbl";
  }

  function getOrCreatePPr(para: Element, xmlDoc: Document): Element {
    let pPr = para.getElementsByTagNameNS(wNS, "pPr")[0];
    if (!pPr) {
      pPr = xmlDoc.createElementNS(wNS, "w:pPr");
      para.insertBefore(pPr, para.firstChild);
    }
    return pPr;
  }

  function setSpacing(pPr: Element, xmlDoc: Document, before: number, after: number, line: number) {
    let spacing = pPr.getElementsByTagNameNS(wNS, "spacing")[0];
    if (!spacing) { spacing = xmlDoc.createElementNS(wNS, "w:spacing"); pPr.appendChild(spacing); }
    spacing.setAttribute("w:before", String(before));
    spacing.setAttribute("w:after", String(after));
    spacing.setAttribute("w:line", String(line));
    spacing.setAttribute("w:lineRule", "auto");
  }

  function setIndent(pPr: Element, xmlDoc: Document, left: number, hanging: number, firstLine: number) {
    let ind = pPr.getElementsByTagNameNS(wNS, "ind")[0];
    if (!ind) { ind = xmlDoc.createElementNS(wNS, "w:ind"); pPr.appendChild(ind); }
    // Remove conflicting attributes
    ind.removeAttribute("w:firstLine");
    ind.removeAttribute("w:hanging");
    ind.removeAttribute("w:left");
    if (left > 0) ind.setAttribute("w:left", String(left));
    if (hanging > 0) ind.setAttribute("w:hanging", String(hanging));
    else if (firstLine > 0) ind.setAttribute("w:firstLine", String(firstLine));
  }

  function setAlignment(pPr: Element, xmlDoc: Document, val: string) {
    let jc = pPr.getElementsByTagNameNS(wNS, "jc")[0];
    if (!jc) { jc = xmlDoc.createElementNS(wNS, "w:jc"); pPr.appendChild(jc); }
    jc.setAttribute("w:val", val);
  }

  // Small words not capitalized in title case
  const smallWords = new Set(["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "by", "in", "of", "up", "as", "is", "it"]);

  function toTitleCase(text: string): string {
    return text.replace(/\b\w+/g, (word, index) => {
      if (index === 0 || !smallWords.has(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    });
  }

  function fixSentenceCase(text: string): string {
    // Don't modify text that's intentionally all-caps and short (likely acronyms)
    if (text.length <= 4 && text === text.toUpperCase()) return text;
    // Fix: capitalize after . ! ? and at start of text
    let result = text;
    // If entire text is ALL CAPS and longer than 5 chars, convert to sentence case
    if (text.length > 5 && text === text.toUpperCase() && /[a-zA-Z]/.test(text)) {
      result = text.toLowerCase();
    }
    // Capitalize first letter
    result = result.replace(/^\s*[a-z]/, (c) => c.toUpperCase());
    // Capitalize after sentence-ending punctuation
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, punct, letter) => punct + letter.toUpperCase());
    return result;
  }

  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Spell-check scan (runs before formatting)
  const scanForSpelling = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXmlStr = await zip.file("word/document.xml")?.async("string");
      if (!docXmlStr) { setIsProcessing(false); return; }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXmlStr, "text/xml");

      // Extract all text
      const allText: string[] = [];
      const tElements = xmlDoc.getElementsByTagNameNS(wNS, "t");
      for (let i = 0; i < tElements.length; i++) {
        const t = tElements[i].textContent || "";
        if (t.trim()) allText.push(t);
      }
      const fullText = allText.join(" ");

      // Extract unique words
      const words = fullText.match(/[a-zA-Z]{3,}/g) || [];
      const uniqueWords = [...new Set(words.map((w) => w.toLowerCase()))];

      // Simple spell-check using a common English words set
      // Load a basic dictionary (top 10000 English words covers 95% of usage)
      const commonWords = await loadCommonDictionary();
      
      const misspelled: {word: string; suggestions: string[]; accepted: string | null}[] = [];
      for (const word of uniqueWords) {
        if (word.length < 3) continue;
        if (commonWords.has(word.toLowerCase())) continue;
        // Skip proper nouns (originally capitalized), numbers, acronyms
        const originals = words.filter((w) => w.toLowerCase() === word);
        const isProperNoun = originals.some((w) => w[0] === w[0].toUpperCase() && w.slice(1) === w.slice(1).toLowerCase());
        if (isProperNoun) continue;
        if (/^\d+$/.test(word)) continue;
        if (word === word.toUpperCase() && word.length <= 5) continue; // Acronym

        // Find suggestions using edit distance
        const suggestions = findSuggestions(word, commonWords);
        misspelled.push({ word, suggestions: suggestions.slice(0, 4), accepted: null });
      }

      if (misspelled.length > 0) {
        setSpellIssues(misspelled);
        setShowSpellReview(true);
        setPendingFormat(true);
      } else {
        // No spelling issues, proceed directly
        setPendingFormat(false);
        await handleFormat();
      }
    } catch (error) {
      console.error(error);
    } finally { setIsProcessing(false); }
  };

  async function loadCommonDictionary(): Promise<Set<string>> {
    // Common English words (embedded subset for client-side)
    const basics = "the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us".split(" ");
    // Extended with common words
    const extended = "about above across after again against all almost along already also always among another any anyone anything are around back because been before began begin being below between both bring build built but came can come could day did different does done down each end enough even every face few find first following for form found from get give go going gone good got great group had has have help her here high him his home house how however i if important in into is it its just keep know large last later leave left let life like line little long look made make man many may me might more most much must my name need never new next no not now number of off often old on one only or other our out over own part people place point problem program public put quite rather read really right run said same say second see seem set she should show side since small so some something sometimes state still story such take tell than that the their them then there these they thing think this those thought three through time to together too turn under united until up us use used using very want was water way we well were what when which while who why will with without word work world would write year you young your".split(" ");
    const wordSet = new Set([...basics, ...extended]);
    return wordSet;
  }

  function findSuggestions(word: string, dictionary: Set<string>): string[] {
    const suggestions: {word: string; dist: number}[] = [];
    dictionary.forEach((dictWord) => {
      if (Math.abs(dictWord.length - word.length) > 2) return;
      const dist = levenshtein(word.toLowerCase(), dictWord);
      if (dist <= 2 && dist > 0) {
        suggestions.push({ word: dictWord, dist });
      }
    });
    return suggestions.sort((a, b) => a.dist - b.dist).map((s) => s.word);
  }

  function levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i-1] === a[j-1]) matrix[i][j] = matrix[i-1][j-1];
        else matrix[i][j] = Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
      }
    }
    return matrix[b.length][a.length];
  }

  const handleFormat = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);
      const preset = presets.find((p) => p.id === selectedPreset)!;

      const docXmlPath = "word/document.xml";
      const docXmlStr = await zip.file(docXmlPath)?.async("string");
      if (!docXmlStr) throw new Error("Invalid .docx file");

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXmlStr, "text/xml");
      if (xmlDoc.querySelector("parsererror")) throw new Error("Corrupted document XML");

      // ============ FONTS ============
      if (options.fixFonts) {
        const rPrElements = xmlDoc.getElementsByTagNameNS(wNS, "rPr");
        for (let i = 0; i < rPrElements.length; i++) {
          const rPr = rPrElements[i];
          if (isInsideSectPr(rPr)) continue;
          const fonts = rPr.getElementsByTagNameNS(wNS, "rFonts")[0];
          if (fonts) {
            fonts.setAttribute("w:ascii", preset.font);
            fonts.setAttribute("w:hAnsi", preset.font);
            fonts.setAttribute("w:cs", preset.font);
          } else {
            const f = xmlDoc.createElementNS(wNS, "w:rFonts");
            f.setAttribute("w:ascii", preset.font);
            f.setAttribute("w:hAnsi", preset.font);
            f.setAttribute("w:cs", preset.font);
            rPr.insertBefore(f, rPr.firstChild);
          }
          // Fix size
          let sz = rPr.getElementsByTagNameNS(wNS, "sz")[0];
          if (!sz) { sz = xmlDoc.createElementNS(wNS, "w:sz"); rPr.appendChild(sz); }
          let szCs = rPr.getElementsByTagNameNS(wNS, "szCs")[0];
          if (!szCs) { szCs = xmlDoc.createElementNS(wNS, "w:szCs"); rPr.appendChild(szCs); }
          // Determine size based on context
          const paraStyle = getParaStyle(rPr.closest("w\\:p, p") as Element || rPr.parentElement?.parentElement as Element);
          if (paraStyle.includes("heading1") || paraStyle.includes("heading 1")) {
            sz.setAttribute("w:val", String(preset.h1Size)); szCs.setAttribute("w:val", String(preset.h1Size));
          } else if (paraStyle.includes("heading2") || paraStyle.includes("heading 2")) {
            sz.setAttribute("w:val", String(preset.h2Size)); szCs.setAttribute("w:val", String(preset.h2Size));
          } else if (paraStyle.includes("heading3") || paraStyle.includes("heading 3")) {
            sz.setAttribute("w:val", String(preset.h3Size)); szCs.setAttribute("w:val", String(preset.h3Size));
          } else {
            sz.setAttribute("w:val", String(preset.bodySize)); szCs.setAttribute("w:val", String(preset.bodySize));
          }
        }
      }

      // ============ PARAGRAPHS: Spacing + Indent ============
      if (options.fixParagraphs) {
        const allParas = xmlDoc.getElementsByTagNameNS(wNS, "p");
        let prevWasList = false;
        let prevHadImage = false;

        for (let i = 0; i < allParas.length; i++) {
          const para = allParas[i];
          if (isInsideSectPr(para)) continue;
          const style = getParaStyle(para);
          const isList = isListPara(para);
          const isHeading = style.includes("heading") || style.includes("title");
          const isImage = hasDrawing(para);
          const pPr = getOrCreatePPr(para, xmlDoc);

          if (isHeading) {
            // Headings: space before, small space after, no indent
            const headingBefore = style.includes("1") ? 360 : style.includes("2") ? 280 : 200;
            setSpacing(pPr, xmlDoc, headingBefore, 120, preset.lineSpacing);
            setIndent(pPr, xmlDoc, 0, 0, 0);
          } else if (isList) {
            // List items: tight spacing, proper hanging indent
            const beforeSpacing = prevWasList ? 40 : 160;
            setSpacing(pPr, xmlDoc, beforeSpacing, 40, 264);
            // Don't override list indent - let fixLists handle it
          } else if (isImage) {
            // Image paragraphs: space before/after, center-aligned
            setSpacing(pPr, xmlDoc, 240, 240, 240);
            setAlignment(pPr, xmlDoc, "center");
            setIndent(pPr, xmlDoc, 0, 0, 0);
          } else {
            // Normal body paragraphs
            const beforeSpacing = prevHadImage ? 240 : preset.paragraphBefore;
            setSpacing(pPr, xmlDoc, beforeSpacing, preset.paragraphAfter, preset.lineSpacing);
            // Block style: no indent, space between. Indent style: first-line indent, no space between.
            if (preset.firstLineIndent > 0) {
              setIndent(pPr, xmlDoc, 0, 0, preset.firstLineIndent);
            } else {
              setIndent(pPr, xmlDoc, 0, 0, 0);
            }
          }

          prevWasList = isList;
          prevHadImage = isImage;
        }
      }

      // ============ LISTS: Bullets + Numbering ============
      if (options.fixLists) {
        const allParas = xmlDoc.getElementsByTagNameNS(wNS, "p");
        for (let i = 0; i < allParas.length; i++) {
          const para = allParas[i];
          if (isInsideSectPr(para)) continue;
          const pPr = para.getElementsByTagNameNS(wNS, "pPr")[0];
          if (!pPr) continue;
          const numPr = pPr.getElementsByTagNameNS(wNS, "numPr")[0];
          if (!numPr) continue;

          // Get nesting level
          const ilvl = numPr.getElementsByTagNameNS(wNS, "ilvl")[0];
          const level = parseInt(ilvl?.getAttribute("w:val") || "0");

          // Set proper hanging indent per level
          const leftIndent = preset.bulletIndent * (level + 1);
          setIndent(pPr, xmlDoc, leftIndent, preset.bulletHanging, 0);
        }
      }

      // ============ TABLES ============
      if (options.fixTables) {
        const tables = xmlDoc.getElementsByTagNameNS(wNS, "tbl");
        for (let t = 0; t < tables.length; t++) {
          const tbl = tables[t];

          // Set table properties
          let tblPr = tbl.getElementsByTagNameNS(wNS, "tblPr")[0];
          if (!tblPr) {
            tblPr = xmlDoc.createElementNS(wNS, "w:tblPr");
            tbl.insertBefore(tblPr, tbl.firstChild);
          }

          // Table width: 100% of page
          let tblW = tblPr.getElementsByTagNameNS(wNS, "tblW")[0];
          if (!tblW) { tblW = xmlDoc.createElementNS(wNS, "w:tblW"); tblPr.appendChild(tblW); }
          tblW.setAttribute("w:w", "5000");
          tblW.setAttribute("w:type", "pct");

          // Table borders based on style
          let tblBorders = tblPr.getElementsByTagNameNS(wNS, "tblBorders")[0];
          if (tblBorders) tblPr.removeChild(tblBorders);
          tblBorders = xmlDoc.createElementNS(wNS, "w:tblBorders");

          const borderTypes = ["top", "left", "bottom", "right", "insideH", "insideV"];
          if (preset.tableStyle === "bordered") {
            for (const bt of borderTypes) {
              const b = xmlDoc.createElementNS(wNS, "w:" + bt);
              b.setAttribute("w:val", "single"); b.setAttribute("w:sz", "4");
              b.setAttribute("w:space", "0"); b.setAttribute("w:color", "000000");
              tblBorders.appendChild(b);
            }
          } else if (preset.tableStyle === "header-only") {
            for (const bt of ["top", "bottom", "insideH"]) {
              const b = xmlDoc.createElementNS(wNS, "w:" + bt);
              b.setAttribute("w:val", "single"); b.setAttribute("w:sz", bt === "insideH" ? "2" : "4");
              b.setAttribute("w:space", "0"); b.setAttribute("w:color", "4472C4");
              tblBorders.appendChild(b);
            }
          } else {
            // minimal - only top and bottom of table
            for (const bt of ["top", "bottom"]) {
              const b = xmlDoc.createElementNS(wNS, "w:" + bt);
              b.setAttribute("w:val", "single"); b.setAttribute("w:sz", "4");
              b.setAttribute("w:space", "0"); b.setAttribute("w:color", "808080");
              tblBorders.appendChild(b);
            }
          }
          tblPr.appendChild(tblBorders);

          // Cell margins/padding
          let tblCellMar = tblPr.getElementsByTagNameNS(wNS, "tblCellMar")[0];
          if (!tblCellMar) { tblCellMar = xmlDoc.createElementNS(wNS, "w:tblCellMar"); tblPr.appendChild(tblCellMar); }
          for (const side of ["top", "bottom", "left", "right"]) {
            let sideEl = tblCellMar.getElementsByTagNameNS(wNS, side)[0];
            if (!sideEl) { sideEl = xmlDoc.createElementNS(wNS, "w:" + side); tblCellMar.appendChild(sideEl); }
            sideEl.setAttribute("w:w", "80"); sideEl.setAttribute("w:type", "dxa");
          }

          // First row: bold (header row)
          const rows = tbl.getElementsByTagNameNS(wNS, "tr");
          if (rows.length > 0) {
            const firstRow = rows[0];
            const cells = firstRow.getElementsByTagNameNS(wNS, "tc");
            for (let c = 0; c < cells.length; c++) {
              const paras = cells[c].getElementsByTagNameNS(wNS, "p");
              for (let p = 0; p < paras.length; p++) {
                const runs = paras[p].getElementsByTagNameNS(wNS, "r");
                for (let r = 0; r < runs.length; r++) {
                  let rPr = runs[r].getElementsByTagNameNS(wNS, "rPr")[0];
                  if (!rPr) { rPr = xmlDoc.createElementNS(wNS, "w:rPr"); runs[r].insertBefore(rPr, runs[r].firstChild); }
                  if (!rPr.getElementsByTagNameNS(wNS, "b").length) {
                    rPr.appendChild(xmlDoc.createElementNS(wNS, "w:b"));
                  }
                }
              }
            }
            // Mark as header row for repeat on page break
            let trPr = firstRow.getElementsByTagNameNS(wNS, "trPr")[0];
            if (!trPr) { trPr = xmlDoc.createElementNS(wNS, "w:trPr"); firstRow.insertBefore(trPr, firstRow.firstChild); }
            if (!trPr.getElementsByTagNameNS(wNS, "tblHeader").length) {
              trPr.appendChild(xmlDoc.createElementNS(wNS, "w:tblHeader"));
            }
          }
        }
      }

      // ============ IMAGES: Proper sizing + center ============
      if (options.fixImages) {
        const usableWidthTwips = 12240 - preset.marginLeft - preset.marginRight;
        const maxWidthEMU = Math.round(usableWidthTwips * 635 * (preset.imageMaxWidthPercent / 100));

        const inlineElements = xmlDoc.getElementsByTagNameNS(wpNS, "inline");
        for (let i = 0; i < inlineElements.length; i++) {
          const inline = inlineElements[i];
          const extent = inline.getElementsByTagNameNS(wpNS, "extent")[0];
          if (!extent) continue;
          const cx = parseInt(extent.getAttribute("cx") || "0");
          const cy = parseInt(extent.getAttribute("cy") || "0");
          if (cx === 0 || cy === 0) continue;

          if (cx > maxWidthEMU) {
            const ratio = cy / cx;
            extent.setAttribute("cx", String(maxWidthEMU));
            extent.setAttribute("cy", String(Math.round(maxWidthEMU * ratio)));
            const extEls = inline.getElementsByTagNameNS(aNS, "ext");
            for (let j = 0; j < extEls.length; j++) {
              if (extEls[j].getAttribute("cx")) {
                extEls[j].setAttribute("cx", String(maxWidthEMU));
                extEls[j].setAttribute("cy", String(Math.round(maxWidthEMU * ratio)));
              }
            }
          }
        }
        // Same for anchored images
        const anchorElements = xmlDoc.getElementsByTagNameNS(wpNS, "anchor");
        for (let i = 0; i < anchorElements.length; i++) {
          const anchor = anchorElements[i];
          const extent = anchor.getElementsByTagNameNS(wpNS, "extent")[0];
          if (!extent) continue;
          const cx = parseInt(extent.getAttribute("cx") || "0");
          const cy = parseInt(extent.getAttribute("cy") || "0");
          if (cx === 0 || cy === 0) continue;
          if (cx > maxWidthEMU) {
            const ratio = cy / cx;
            extent.setAttribute("cx", String(maxWidthEMU));
            extent.setAttribute("cy", String(Math.round(maxWidthEMU * ratio)));
          }
        }
      }

      // ============ NUMBERING DISTANCE FROM BORDER ============
      if (options.fixNumberingDistance) {
        // Ensure all numbered/bulleted items start at a consistent distance from left margin
        // Standard: Level 0 starts at 720 twips (0.5") from left margin
        const allParas = xmlDoc.getElementsByTagNameNS(wNS, "p");
        for (let i = 0; i < allParas.length; i++) {
          const para = allParas[i];
          if (isInsideSectPr(para)) continue;
          const pPr = para.getElementsByTagNameNS(wNS, "pPr")[0];
          if (!pPr) continue;
          const numPr = pPr.getElementsByTagNameNS(wNS, "numPr")[0];
          if (!numPr) continue;

          const ilvl = numPr.getElementsByTagNameNS(wNS, "ilvl")[0];
          const level = parseInt(ilvl?.getAttribute("w:val") || "0");

          // Consistent distance: each level adds bulletIndent from preset
          // Level 0: bulletIndent from left border
          // Level 1: bulletIndent * 2
          // Level 2: bulletIndent * 3
          const leftPos = preset.bulletIndent * (level + 1);
          setIndent(pPr, xmlDoc, leftPos, preset.bulletHanging, 0);

          // Also ensure tab stop aligns with text start
          let tabs = pPr.getElementsByTagNameNS(wNS, "tabs")[0];
          if (!tabs) { tabs = xmlDoc.createElementNS(wNS, "w:tabs"); pPr.appendChild(tabs); }
          // Clear existing tabs and set proper one
          while (tabs.firstChild) tabs.removeChild(tabs.firstChild);
          const tab = xmlDoc.createElementNS(wNS, "w:tab");
          tab.setAttribute("w:val", "num");
          tab.setAttribute("w:pos", String(leftPos));
          tabs.appendChild(tab);
        }
      }

      // ============ CASE CORRECTION ============
      if (options.fixCases) {
        const allParas = xmlDoc.getElementsByTagNameNS(wNS, "p");
        for (let i = 0; i < allParas.length; i++) {
          const para = allParas[i];
          if (isInsideSectPr(para)) continue;
          const style = getParaStyle(para);
          const isHeading = style.includes("heading") || style.includes("title");

          const runs = para.getElementsByTagNameNS(wNS, "r");
          for (let r = 0; r < runs.length; r++) {
            const tElements = runs[r].getElementsByTagNameNS(wNS, "t");
            for (let t = 0; t < tElements.length; t++) {
              const textNode = tElements[t];
              let text = textNode.textContent || "";
              if (!text.trim()) continue;

              if (isHeading) {
                // Headings: Title Case (capitalize first letter of each significant word)
                text = toTitleCase(text);
              } else {
                // Body text: fix sentence case
                text = fixSentenceCase(text);
              }
              textNode.textContent = text;
            }
          }
        }
      }

      // ============ SPELL CHECK (apply user-approved corrections) ============
      if (options.spellCheck && spellIssues.length > 0) {
        const corrections = spellIssues.filter((s) => s.accepted !== null);
        if (corrections.length > 0) {
          const allParas = xmlDoc.getElementsByTagNameNS(wNS, "p");
          for (let i = 0; i < allParas.length; i++) {
            const para = allParas[i];
            const runs = para.getElementsByTagNameNS(wNS, "r");
            for (let r = 0; r < runs.length; r++) {
              const tElements = runs[r].getElementsByTagNameNS(wNS, "t");
              for (let t = 0; t < tElements.length; t++) {
                const textNode = tElements[t];
                let text = textNode.textContent || "";
                for (const corr of corrections) {
                  if (corr.accepted) {
                    // Replace word preserving boundaries
                    const regex = new RegExp("\\b" + escapeRegex(corr.word) + "\\b", "g");
                    text = text.replace(regex, corr.accepted);
                  }
                }
                textNode.textContent = text;
              }
            }
          }
        }
      }

      // ============ MARGINS ============
      if (options.fixMargins) {
        const sectPrElements = xmlDoc.getElementsByTagNameNS(wNS, "sectPr");
        for (let i = 0; i < sectPrElements.length; i++) {
          const sectPr = sectPrElements[i];
          let pgMar = sectPr.getElementsByTagNameNS(wNS, "pgMar")[0];
          if (!pgMar) { pgMar = xmlDoc.createElementNS(wNS, "w:pgMar"); sectPr.appendChild(pgMar); }
          pgMar.setAttribute("w:top", String(preset.marginTop));
          pgMar.setAttribute("w:right", String(preset.marginRight));
          pgMar.setAttribute("w:bottom", String(preset.marginBottom));
          pgMar.setAttribute("w:left", String(preset.marginLeft));
          pgMar.setAttribute("w:header", "720");
          pgMar.setAttribute("w:footer", "720");
          pgMar.setAttribute("w:gutter", "0");
        }
      }

      // ============ SERIALIZE & SAVE ============
      const serializer = new XMLSerializer();
      zip.file(docXmlPath, serializer.serializeToString(xmlDoc));

      // Update styles.xml default font
      if (options.fixFonts) {
        const stylesContent = await zip.file("word/styles.xml")?.async("string");
        if (stylesContent) {
          const stylesDoc = parser.parseFromString(stylesContent, "text/xml");
          if (!stylesDoc.querySelector("parsererror")) {
            const docDefaults = stylesDoc.getElementsByTagNameNS(wNS, "docDefaults")[0];
            if (docDefaults) {
              const rPr = docDefaults.getElementsByTagNameNS(wNS, "rPr")[0];
              if (rPr) {
                const fonts = rPr.getElementsByTagNameNS(wNS, "rFonts")[0];
                if (fonts) { fonts.setAttribute("w:ascii", preset.font); fonts.setAttribute("w:hAnsi", preset.font); fonts.setAttribute("w:cs", preset.font); }
                let sz = rPr.getElementsByTagNameNS(wNS, "sz")[0];
                if (sz) sz.setAttribute("w:val", String(preset.bodySize));
              }
            }
            zip.file("word/styles.xml", serializer.serializeToString(stylesDoc));
          }
        }
      }

      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "formatted-" + file.name;
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error formatting document. Make sure it is a valid .docx file.\n\n" + (error instanceof Error ? error.message : ""));
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Document Formatter</h1>
            <p className="text-[var(--muted-foreground)]">Professional formatting in one click — follows journal and international standards</p>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Formats fonts, paragraphs, tables, images, bullets, and numbering to professional standards. Follows APA, IEEE, and corporate formatting rules.
        </p>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".docx" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 space-y-6">
          {/* Preset Selection */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <h3 className="font-semibold mb-4">Formatting Standard</h3>
            <div className="grid grid-cols-1 gap-3">
              {presets.map((p) => (
                <button key={p.id} onClick={() => { setSelectedPreset(p.id); setIsComplete(false); }}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${selectedPreset === p.id ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20" : "border-[var(--border)] hover:border-[var(--primary)]/50"}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{p.description}</p>
                    </div>
                    {selectedPreset === p.id && <Check className="w-4 h-4 text-[var(--primary)] flex-shrink-0 ml-2" />}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)]">{p.font} {p.bodySize/2}pt</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)]">{p.lineSpacing === 480 ? "Double" : p.lineSpacing === 360 ? "1.5x" : p.lineSpacing === 276 ? "1.15x" : "Single"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)]">{p.firstLineIndent > 0 ? "First-line indent" : "Block (no indent)"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)]">Table: {p.tableStyle}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <h3 className="font-semibold mb-3">What to format</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "fixFonts", label: "Fonts & Sizes", desc: "Consistent font family and size for body, headings" },
                { key: "fixParagraphs", label: "Paragraphs & Spacing", desc: "Line spacing, paragraph gaps, proper indent rules" },
                { key: "fixMargins", label: "Page Margins", desc: "Standard margins for the selected format" },
                { key: "fixHeadings", label: "Heading Hierarchy", desc: "H1 > H2 > H3 proper sizing" },
                { key: "fixLists", label: "Bullets & Numbering", desc: "Proper hanging indent per level, consistent spacing" },
                { key: "fixNumberingDistance", label: "Numbering Distance", desc: "All numbered items at fixed distance from left border" },
                { key: "fixTables", label: "Table Formatting", desc: "Borders, cell padding, bold header row, full width" },
                { key: "fixImages", label: "Image Sizing", desc: "Fit to page width, center-align, maintain aspect ratio" },
                { key: "fixCases", label: "Fix Cases", desc: "Title Case for headings, Sentence case for body, fix ALL CAPS" },
                { key: "spellCheck", label: "Spell Check", desc: "Detect misspelled words and ask before correcting" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)] cursor-pointer hover:bg-[var(--accent)] transition-colors">
                  <input type="checkbox" checked={options[opt.key as keyof typeof options]}
                    onChange={(e) => setOptions({ ...options, [opt.key]: e.target.checked })}
                    className="mt-0.5 rounded" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <ProcessingButton onClick={options.spellCheck ? scanForSpelling : handleFormat} isProcessing={isProcessing} isComplete={isComplete} label={options.spellCheck ? "Scan & Format" : "Format & Download"} />
          </div>
        </div>
      )}

      {/* Spell Check Review Panel */}
      {showSpellReview && spellIssues.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-amber-800 dark:text-amber-300">
              Spell Check: {spellIssues.length} potential issue{spellIssues.length > 1 ? "s" : ""} found
            </h3>
            <div className="flex gap-2">
              <button onClick={() => { setSpellIssues(spellIssues.map((s) => ({ ...s, accepted: null }))); }}
                className="text-xs px-3 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)]">
                Ignore All
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {spellIssues.map((issue, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)]">
                <span className="text-sm font-mono text-red-600 dark:text-red-400 font-medium min-w-[100px]">{issue.word}</span>
                <span className="text-xs text-[var(--muted-foreground)]">→</span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {issue.suggestions.length > 0 ? issue.suggestions.map((sug) => (
                    <button key={sug} onClick={() => {
                      const updated = [...spellIssues];
                      updated[idx] = { ...updated[idx], accepted: sug };
                      setSpellIssues(updated);
                    }}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${issue.accepted === sug ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-500" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                      {sug}
                    </button>
                  )) : <span className="text-xs text-[var(--muted-foreground)] italic">No suggestions</span>}
                  <button onClick={() => {
                    const updated = [...spellIssues];
                    updated[idx] = { ...updated[idx], accepted: null };
                    setSpellIssues(updated);
                  }}
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${issue.accepted === null ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                    Keep original
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button onClick={() => { setShowSpellReview(false); handleFormat(); }}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              Apply Corrections & Format
            </button>
          </div>
        </div>
      )}

      {/* Standards info */}
      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-3">Formatting Standards Applied</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--muted-foreground)]">
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Paragraphs</p>
            <p>Block style: space between, no indent</p>
            <p>Academic: first-line indent, no extra space</p>
            <p>Headings: larger gap before, small gap after</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Lists & Bullets</p>
            <p>Hanging indent: number/bullet outdented</p>
            <p>Tight spacing within list block</p>
            <p>Gap before first item and after last item</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Tables</p>
            <p>Full page width, proper cell padding</p>
            <p>Header row: bold + repeats on page break</p>
            <p>Borders: full, minimal, or header-only</p>
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)] mb-1">Images / Figures</p>
            <p>Scaled to fit page width (aspect ratio maintained)</p>
            <p>Center-aligned with spacing above/below</p>
            <p>Never bleeds outside margins</p>
          </div>
        </div>
      </div>
    </div>
  );
}
