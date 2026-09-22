import {
  allNegativeWords,
  allQualityWords,
  getCamera,
  getRatio,
  getStyle,
} from "./look";
import type { ImagePromptFields, LookSettings, VideoPromptFields } from "./types";

function joinParts(parts: Array<string | undefined | null>) {
  return parts
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function unique(list: string[]) {
  return [...new Set(list.map((s) => s.trim()).filter(Boolean))];
}

export function composeImagePrompt(fields: ImagePromptFields, look: LookSettings) {
  const style = getStyle(look.styleId);
  const camera = getCamera(look.cameraId);
  const ratio = getRatio(look.ratioId);
  const quality = allQualityWords(look);
  const body = joinParts([
    fields.subject,
    fields.wardrobe,
    fields.setting,
    fields.lighting,
    fields.composition,
    camera.prompt,
    style.prompt,
    ...quality,
    ratio.prompt,
  ]);
  return `${body} ${ratio.arToken}`.trim();
}

export function composeImageNegative(look: LookSettings) {
  return allNegativeWords(look).join(", ");
}

export function composeImaginePrompt(fields: ImagePromptFields, look: LookSettings) {
  const style = getStyle(look.styleId);
  const camera = getCamera(look.cameraId);
  const ratio = getRatio(look.ratioId);
  const quality = unique(allQualityWords(look)).slice(0, 6).join(", ");
  const lead = joinParts([fields.subject, fields.wardrobe]);
  const place = joinParts([fields.setting, fields.lighting]);
  const parts = [
    lead ? `${lead}.` : "",
    place ? `${place}.` : "",
    fields.composition ? `${fields.composition}.` : "",
    `${style.prompt}, ${camera.prompt}.`,
    `Photoreal cinematic still, ${ratio.label}, ${quality}. No captions, subtitles, or watermarks.`,
  ];
  return parts
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

export function composeImagineVideoPrompt(fields: VideoPromptFields, look: LookSettings) {
  const style = getStyle(look.styleId);
  const ratio = getRatio(look.ratioId);
  return [
    fields.subject,
    fields.action,
    fields.setting,
    `Camera ${fields.cameraMove}.`,
    `Start: ${fields.startState}. End: ${fields.endState}.`,
    fields.dialogue ? `He/she says: "${fields.dialogue}".` : "No on-screen text.",
    `${style.prompt}. ${ratio.label}, ${fields.durationSec} seconds.`,
  ]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

export function composeVideoPrompt(fields: VideoPromptFields, look: LookSettings) {
  const style = getStyle(look.styleId);
  const camera = getCamera(look.cameraId);
  const ratio = getRatio(look.ratioId);
  const quality = allQualityWords(look);
  const lines = [
    fields.subject,
    fields.setting,
    fields.action,
    `Camera: ${fields.cameraMove}. ${camera.prompt}.`,
    fields.lighting,
    `Start: ${fields.startState}`,
    `End: ${fields.endState}`,
    fields.dialogue
      ? `Dialogue in frame, lip-sync exactly: "${fields.dialogue}"`
      : "No on-screen captions or subtitles.",
    `Audio: ${fields.audio}`,
    joinParts([style.prompt, ...quality, ratio.prompt]),
    `Duration ${fields.durationSec}s, ${ratio.label}.`,
  ];
  return lines.filter((l) => l && l.trim()).join("\n");
}

export function composeVideoNegative(look: LookSettings) {
  const extra = [
    "no text overlays",
    "no captions",
    "no subtitles",
    "no morphing",
    "no teleport",
    "no extra limbs",
  ];
  return unique([...allNegativeWords(look), ...extra]).join(", ");
}

export function lookSummary(look: LookSettings) {
  const style = getStyle(look.styleId);
  const camera = getCamera(look.cameraId);
  const ratio = getRatio(look.ratioId);
  return {
    style: style.name,
    camera: camera.name,
    ratio: ratio.label,
    qualityCount: allQualityWords(look).length,
    negativeCount: allNegativeWords(look).length,
  };
}
