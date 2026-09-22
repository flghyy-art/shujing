import { ASSET_KIND_LABEL, buildAssetLibrary } from "./asset-library";
import {
  composeImageNegative,
  composeImagePrompt,
  composeImaginePrompt,
  composeImagineVideoPrompt,
  composeVideoNegative,
  composeVideoPrompt,
  lookSummary,
} from "./compose-prompt";
import { imagineAgentUrl, imagineUrl, imagineVideoAgentUrl } from "./imagine-link";
import { getCamera, getRatio, getStyle, allNegativeWords, allQualityWords } from "./look";
import { currentEpisode } from "./pipeline";
import type { Project } from "./types";

export function buildPackageMarkdown(project: Project): string {
  const look = project.look;
  const style = getStyle(look.styleId);
  const camera = getCamera(look.cameraId);
  const ratio = getRatio(look.ratioId);
  const ep = currentEpisode(project);
  const lines: string[] = [];

  lines.push(`# ${project.novel.title} · 拍摄包`);
  lines.push("");
  lines.push(`视觉方向：${style.name} / ${camera.name} / ${ratio.name}`);
  lines.push(`质量词：${allQualityWords(look).join(" · ") || "（无）"}`);
  lines.push(`负面词：${allNegativeWords(look).join(" · ") || "（无）"}`);
  lines.push("");

  if (project.triage) {
    lines.push("## 改编快评");
    lines.push("");
    lines.push(`判定：${project.triage.verdict}`);
    lines.push("");
    lines.push(project.triage.recommendation);
    lines.push("");
  }

  if (project.development) {
    lines.push("## 故事引擎");
    lines.push("");
    lines.push(project.development.engine);
    lines.push("");
    lines.push(project.development.directorNote);
    lines.push("");
    for (const e of project.development.episodes) {
      lines.push(`### ${e.id} ${e.title}`);
      lines.push(e.logline);
      lines.push("");
    }
  }

  if (ep?.script) {
    lines.push("## 剧本");
    lines.push("");
    for (const sc of ep.script.scenes) {
      lines.push(`### ${sc.id} ${sc.heading}`);
      lines.push("");
      lines.push(sc.action);
      lines.push("");
      for (const d of sc.dialogue) {
        lines.push(`**${d.character}**：${d.line}`);
      }
      lines.push("");
    }
  }

  const library = buildAssetLibrary(project);
  if (library.length) {
    lines.push("## 资产管理");
    lines.push("");
    for (const a of library) {
      lines.push(`### ${a.name} · ${ASSET_KIND_LABEL[a.kind]}`);
      lines.push("");
      if (a.kicker) lines.push(a.kicker);
      lines.push(a.summary);
      if (a.continuityLock) lines.push(`连续性锁：${a.continuityLock}`);
      if (a.sceneIds.length) lines.push(`场次：${a.sceneIds.join(" · ")}`);
      lines.push("");
      lines.push("Imagine 提示词：");
      lines.push("");
      lines.push("```");
      lines.push(a.imaginePrompt);
      lines.push("```");
      lines.push("");
      lines.push(`Grok Imagine：${a.imagineUrl}`);
      lines.push(`Imagine Agent：${a.agentUrl}`);
      lines.push("");
    }
  }

  if (ep?.assets && library.length === 0) {
    lines.push("## 视觉设定");
    lines.push("");
    for (const c of ep.assets.characters) {
      lines.push(`### ${c.name}`);
      lines.push(`${c.identity} · ${c.age}`);
      lines.push(c.look);
      lines.push(c.wardrobe);
      lines.push(`连续性锁：${c.continuityLock}`);
      lines.push("");
    }
    for (const loc of ep.assets.locations) {
      lines.push(`### ${loc.name}`);
      lines.push(loc.description);
      lines.push(`光：${loc.lighting}`);
      lines.push(`连续性锁：${loc.continuityLock}`);
      lines.push("");
    }
    for (const pr of ep.assets.props) {
      lines.push(`### ${pr.name}`);
      lines.push(pr.description);
      lines.push(`状态：${pr.state}`);
      lines.push(`连续性锁：${pr.continuityLock}`);
      lines.push("");
    }
  }

  if (ep?.storyboard) {
    lines.push("## 分镜");
    lines.push("");
    for (const sh of ep.storyboard) {
      lines.push(`### ${sh.id} ${sh.title}`);
      lines.push(`${sh.scale} · ${sh.camera} · ${sh.durationSec}s · ${sh.sceneId}`);
      lines.push(`起：${sh.startFrame}`);
      lines.push(`止：${sh.endFrame}`);
      lines.push(sh.action);
      if (sh.dialogue) lines.push(`对白：${sh.dialogue}`);
      lines.push("");
    }
  }

  if (ep?.imagePrompts) {
    lines.push("## 图片提示词");
    lines.push("");
    for (const img of ep.imagePrompts) {
      const imagine = composeImaginePrompt(img, look);
      lines.push(`### ${img.id} ${img.title}`);
      lines.push("");
      lines.push("```");
      lines.push(composeImagePrompt(img, look));
      lines.push("```");
      lines.push("");
      lines.push("Negative:");
      lines.push("");
      lines.push("```");
      lines.push(composeImageNegative(look));
      lines.push("```");
      lines.push("");
      lines.push(`Grok Imagine：${imagineUrl(imagine)}`);
      lines.push(`Imagine Agent：${imagineAgentUrl(imagine, ratio.label)}`);
      lines.push("");
    }
  }

  if (ep?.videoPrompts) {
    lines.push("## 视频提示词");
    lines.push("");
    const vNeg = composeVideoNegative(look);
    for (const v of ep.videoPrompts) {
      lines.push(`### ${v.id} · ${v.shotId} ${v.title}`);
      lines.push("");
      lines.push("```");
      lines.push(composeVideoPrompt(v, look));
      lines.push("```");
      lines.push("");
      lines.push("Negative:");
      lines.push("");
      lines.push("```");
      lines.push(vNeg);
      lines.push("```");
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function buildImagineManifest(project: Project) {
  const look = lookSummary(project.look);
  const library = buildAssetLibrary(project);
  return {
    title: project.novel.title,
    look,
    assets: library.map((a) => ({
      id: a.id,
      kind: a.kind,
      label: ASSET_KIND_LABEL[a.kind],
      name: a.name,
      summary: a.summary,
      continuityLock: a.continuityLock,
      sceneIds: a.sceneIds,
      prompt: a.imaginePrompt,
      negative: a.negative,
      imagineUrl: a.imagineUrl,
      agentUrl: a.agentUrl,
    })),
  };
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
