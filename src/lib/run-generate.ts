import { generateStep, type GenerateResult } from "./generate";
import { currentEpisode } from "./pipeline";
import type { GenerateStep as Step, Project } from "./types";

export async function runGenerate(project: Project, step: Step): Promise<GenerateResult> {
  const ep = currentEpisode(project);
  const script = ep?.script;
  const assets = ep?.assets;
  const board = ep?.storyboard;

  return generateStep({
    data: {
      step,
      novelTitle: project.novel.title,
      novelText: project.novel.text,
      look: project.look,
      episodeTitle: ep?.brief.title,
      episodeLogline: ep?.brief.logline,
      scriptSummary: script
        ? script.scenes
            .map(
              (s) =>
                `${s.id} ${s.heading}\n${s.action}\n${s.dialogue.map((d) => `${d.character}: ${d.line}`).join("\n")}`,
            )
            .join("\n\n")
        : undefined,
      assetsSummary: assets
        ? [
            ...assets.characters.map((c) => `${c.name}: ${c.look}; ${c.wardrobe}; 锁:${c.continuityLock}`),
            ...assets.locations.map((l) => `${l.name}: ${l.description}`),
            ...assets.props.map((p) => `${p.name}: ${p.description}`),
          ].join("\n")
        : undefined,
      storyboardSummary: board
        ? board
            .map(
              (s) =>
                `${s.id} ${s.title} ${s.scale} ${s.durationSec}s 起:${s.startFrame} 止:${s.endFrame} ${s.dialogue ?? ""}`,
            )
            .join("\n")
        : undefined,
    },
  });
}
