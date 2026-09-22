import type { Chapter } from "./types";

const HEADING =
  /^(第[0-9零一二三四五六七八九十百千两]+[章节回部卷]|Chapter\s+\d+|CHAPTER\s+\d+)([^\n]*)/i;

export function indexChapters(text: string): Chapter[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const hits: { line: number; title: string }[] = [];

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line.length === 0 || line.length > 40) return;
    const m = line.match(HEADING);
    if (m) hits.push({ line: i, title: line });
  });

  if (hits.length >= 2) {
    return hits.map((hit, idx) => {
      const start = hit.line;
      const end = idx + 1 < hits.length ? hits[idx + 1].line : lines.length;
      const body = lines.slice(start + 1, end).join("\n").trim();
      return { sequence: idx + 1, title: hit.title, text: body };
    });
  }

  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length === 0) return [];

  const groupSize = Math.max(1, Math.ceil(blocks.length / Math.min(6, blocks.length)));
  const chapters: Chapter[] = [];
  for (let i = 0; i < blocks.length; i += groupSize) {
    const slice = blocks.slice(i, i + groupSize);
    chapters.push({
      sequence: chapters.length + 1,
      title: `段 ${chapters.length + 1}`,
      text: slice.join("\n\n"),
    });
  }
  return chapters;
}

export function novelPreview(text: string, max = 280) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function truncateForModel(text: string, maxChars = 8000) {
  if (text.length <= maxChars) return text;
  const head = text.slice(0, Math.floor(maxChars * 0.45));
  const tail = text.slice(-Math.floor(maxChars * 0.4));
  return `${head}\n\n[…中段省略…]\n\n${tail}`;
}
