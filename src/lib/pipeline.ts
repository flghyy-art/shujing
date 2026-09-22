import type { EpisodeWork, Project, StepId } from "./types";

export const STEPS: {
  id: StepId;
  n: string;
  name: string;
  en: string;
  hint: string;
}[] = [
  { id: "manuscript", n: "01", name: "原著", en: "Source", hint: "粘贴或打开样章，建立章节索引。" },
  { id: "triage", n: "02", name: "快评", en: "Triage", hint: "这本书值不值得拍成横屏电影感现实剧。" },
  { id: "episodes", n: "03", name: "分集", en: "Episodes", hint: "故事引擎与分集候选。" },
  { id: "look", n: "04", name: "视觉方向", en: "Look", hint: "风格、相机、画幅、质量词与负面词。" },
  { id: "script", n: "05", name: "剧本", en: "Script", hint: "可拍的场次、动作与对白。" },
  { id: "assets", n: "06", name: "资产", en: "Assets", hint: "每一场戏的人物与场景：提示词、Grok Imagine 与 Imagine Agent 链接。" },
  { id: "storyboard", n: "07", name: "分镜", en: "Board", hint: "镜头、景别、起止帧。" },
  { id: "prompts", n: "08", name: "提示词", en: "Prompts", hint: "可复制的图片与视频提示词。" },
];

export function stepIndex(id: StepId) {
  return STEPS.findIndex((s) => s.id === id);
}

export function currentEpisode(project: Project): EpisodeWork | null {
  const id = project.currentEpisodeId;
  if (!id) return null;
  return project.episodeWork[id] ?? null;
}

export function isStepComplete(project: Project, id: StepId): boolean {
  const ep = currentEpisode(project);
  switch (id) {
    case "manuscript":
      return project.novel.text.trim().length > 40;
    case "triage":
      return Boolean(project.triage);
    case "episodes":
      return Boolean(project.development && project.currentEpisodeId);
    case "look":
      return Boolean(project.look.styleId && project.look.ratioId);
    case "script":
      return Boolean(ep?.script);
    case "assets":
      return Boolean(ep?.assets);
    case "storyboard":
      return Boolean(ep?.storyboard && ep.storyboard.length > 0);
    case "prompts":
      return Boolean(ep?.imagePrompts && ep?.videoPrompts);
  }
}

export function canEnter(project: Project, id: StepId): boolean {
  if (id === "manuscript" || id === "look") return true;
  const idx = stepIndex(id);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    const prev = STEPS[i].id;
    if (prev === "look") continue;
    if (!isStepComplete(project, prev)) return false;
  }
  return true;
}

export function nextIncomplete(project: Project): StepId {
  for (const s of STEPS) {
    if (s.id === "look") continue;
    if (!isStepComplete(project, s.id)) return s.id;
  }
  return "prompts";
}

export function progressCount(project: Project) {
  const done = STEPS.filter((s) => isStepComplete(project, s.id)).length;
  return { done, total: STEPS.length };
}
