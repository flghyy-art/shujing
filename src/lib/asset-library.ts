import {
  composeImageNegative,
  composeImagePrompt,
  composeImaginePrompt,
  composeImagineVideoPrompt,
} from "./compose-prompt";
import { grokImagineAgentUrl, imagineAgentUrl, imagineUrl } from "./imagine-link";
import { getRatio } from "./look";
import { currentEpisode } from "./pipeline";
import type {
  CharacterAsset,
  ImagePromptFields,
  LocationAsset,
  LookSettings,
  Project,
  PropAsset,
  ScriptScene,
  Shot,
  VideoPromptFields,
} from "./types";

export type AssetKind = "lookdev" | "character" | "location" | "prop" | "scene" | "keyframe";

export type ProductionAsset = {
  id: string;
  kind: AssetKind;
  name: string;
  kicker: string;
  summary: string;
  facts: { label: string; value: string }[];
  continuityLock: string;
  sceneIds: string[];
  fields: ImagePromptFields;
  prompt: string;
  imaginePrompt: string;
  negative: string;
  imagineUrl: string;
  agentUrl: string;
  videoPrompt?: string;
  durationSec?: number;
};

export type SceneGroup = {
  id: string;
  heading: string;
  location: string;
  time: string;
  action: string;
  sceneStill: ProductionAsset;
  characters: ProductionAsset[];
  locationAsset?: ProductionAsset;
  shots: ProductionAsset[];
};

export type AssetBoard = {
  groups: SceneGroup[];
  characters: ProductionAsset[];
  locations: ProductionAsset[];
  props: ProductionAsset[];
  lookdev: ProductionAsset | null;
};

export const ASSET_KIND_LABEL: Record<AssetKind, string> = {
  lookdev: "风格帧",
  character: "人物",
  location: "场景",
  prop: "道具",
  scene: "场次",
  keyframe: "分镜帧",
};

function bare(id: string) {
  return id.replace(/^(CHAR|LOC|PROP|IMG|SCENE|SHOT)-/i, "");
}

function findImage(
  prompts: ImagePromptFields[] | null | undefined,
  kind: ImagePromptFields["kind"],
  id: string,
  name: string,
) {
  if (!prompts?.length) return undefined;
  const key = bare(id) || name;
  return prompts.find((p) => {
    if (p.kind !== kind) return false;
    const pk = bare(p.id);
    return pk === key || p.title.includes(name) || p.id.includes(key);
  });
}

function ratioLabel(look: LookSettings) {
  return getRatio(look.ratioId).label;
}

function finish(
  fields: ImagePromptFields,
  look: LookSettings,
  extra: Omit<
    ProductionAsset,
    "fields" | "prompt" | "imaginePrompt" | "negative" | "imagineUrl" | "agentUrl"
  > & {
    videoPrompt?: string;
    durationSec?: number;
  },
): ProductionAsset {
  const imaginePrompt = composeImaginePrompt(fields, look);
  return {
    ...extra,
    fields,
    prompt: composeImagePrompt(fields, look),
    imaginePrompt,
    negative: composeImageNegative(look),
    imagineUrl: imagineUrl(imaginePrompt),
    agentUrl: imagineAgentUrl(imaginePrompt, ratioLabel(look)),
  };
}

function fromCharacter(c: CharacterAsset, prompt?: ImagePromptFields): ImagePromptFields {
  return (
    prompt ?? {
      id: `IMG-${bare(c.id) || c.name}`,
      kind: "character",
      title: `角色板 · ${c.name}`,
      subject: `${c.name}, ${c.age}, ${c.identity}. ${c.look}`,
      wardrobe: c.wardrobe,
      setting: "character reference still in the story world, not a fashion pose",
      lighting: "motivated practical key, naturalistic skin",
      composition: "widescreen character portrait, face and hands readable",
      notes: c.continuityLock,
    }
  );
}

function fromLocation(loc: LocationAsset, prompt?: ImagePromptFields): ImagePromptFields {
  return (
    prompt ?? {
      id: `IMG-${bare(loc.id) || loc.name}`,
      kind: "location",
      title: `场景 · ${loc.name}`,
      subject: loc.description,
      wardrobe: "",
      setting: `${loc.description}. Views: ${loc.views.join("; ")}`,
      lighting: loc.lighting,
      composition: "widescreen establishing still, theatrical composition",
      notes: loc.continuityLock,
    }
  );
}

function fromProp(p: PropAsset, prompt?: ImagePromptFields): ImagePromptFields {
  return (
    prompt ?? {
      id: `IMG-${bare(p.id) || p.name}`,
      kind: "prop",
      title: `道具 · ${p.name}`,
      subject: p.description,
      wardrobe: "",
      setting: p.state,
      lighting: "hard practical, tactile material",
      composition: "insert still, object readable, no labels or logos",
      notes: p.continuityLock,
    }
  );
}

function fromScene(sc: ScriptScene): ImagePromptFields {
  return {
    id: `IMG-${sc.id}`,
    kind: "location",
    title: `场次 · ${sc.heading}`,
    subject: sc.action,
    wardrobe: "",
    setting: `${sc.heading}. ${sc.location} ${sc.time}`,
    lighting: "motivated practical lighting matching time of day",
    composition: "widescreen cinematic still of this scene, theatrical blocking",
    notes: sc.heading,
  };
}

function fromShot(sh: Shot): ImagePromptFields {
  return {
    id: `IMG-${sh.id}`,
    kind: "keyframe",
    title: `${sh.id} · ${sh.title}`,
    subject: sh.startFrame,
    wardrobe: "",
    setting: `${sh.action}. End: ${sh.endFrame}`,
    lighting: "",
    composition: `${sh.scale}, ${sh.camera}, widescreen cinematic still`,
    notes: sh.purpose,
  };
}

function locationMatchesScene(loc: LocationAsset, sc: ScriptScene) {
  return Boolean(loc.name) && (sc.location.includes(loc.name) || sc.heading.includes(loc.name));
}

function characterInScene(name: string, sc: ScriptScene) {
  return sc.action.includes(name) || sc.dialogue.some((d) => d.character === name);
}

function stubCharacters(scenes: ScriptScene[]): CharacterAsset[] {
  const names = new Set<string>();
  for (const sc of scenes) {
    for (const d of sc.dialogue) {
      if (d.character.trim()) names.add(d.character.trim());
    }
  }
  return [...names].map((name) => ({
    id: `CHAR-${name}`,
    name,
    age: "",
    identity: "出场人物",
    look: name,
    wardrobe: "",
    continuityLock: "",
  }));
}

function stubLocations(scenes: ScriptScene[]): LocationAsset[] {
  const seen = new Map<string, LocationAsset>();
  for (const sc of scenes) {
    const name = sc.location.trim() || sc.heading;
    if (seen.has(name)) continue;
    seen.set(name, {
      id: `LOC-${name}`,
      name,
      description: sc.action,
      lighting: sc.time,
      views: [sc.heading],
      continuityLock: "",
    });
  }
  return [...seen.values()];
}

function makeCharacter(c: CharacterAsset, look: LookSettings, prompts: ImagePromptFields[] | null, sceneIds: string[]) {
  const img = findImage(prompts, "character", c.id, c.name);
  const fields = fromCharacter(c, img);
  return finish(fields, look, {
    id: c.id,
    kind: "character",
    name: c.name,
    kicker: [c.age, c.identity].filter(Boolean).join(" · ") || "人物",
    summary: c.look,
    facts: [
      { label: "服装", value: c.wardrobe },
      { label: "身份", value: c.identity },
    ].filter((f) => f.value),
    continuityLock: c.continuityLock,
    sceneIds,
  });
}

function makeLocation(loc: LocationAsset, look: LookSettings, prompts: ImagePromptFields[] | null, sceneIds: string[]) {
  const img = findImage(prompts, "location", loc.id, loc.name);
  const fields = fromLocation(loc, img);
  return finish(fields, look, {
    id: loc.id,
    kind: "location",
    name: loc.name,
    kicker: loc.views.slice(0, 3).join(" · ") || "场景",
    summary: loc.description,
    facts: [
      { label: "光线", value: loc.lighting },
      { label: "机位", value: loc.views.join(" · ") },
    ].filter((f) => f.value),
    continuityLock: loc.continuityLock,
    sceneIds,
  });
}

export function buildAssetBoard(project: Project): AssetBoard {
  const ep = currentEpisode(project);
  const empty: AssetBoard = { groups: [], characters: [], locations: [], props: [], lookdev: null };
  if (!ep) return empty;
  const look = project.look;
  const scenes = ep.script?.scenes ?? [];
  const prompts = ep.imagePrompts;
  const motions = ep.videoPrompts;
  const shots = ep.storyboard ?? [];
  const charSrc = ep.assets?.characters?.length ? ep.assets.characters : stubCharacters(scenes);
  const locSrc = ep.assets?.locations?.length ? ep.assets.locations : stubLocations(scenes);

  const characters = charSrc.map((c) =>
    makeCharacter(
      c,
      look,
      prompts,
      scenes.filter((sc) => characterInScene(c.name, sc)).map((sc) => sc.id),
    ),
  );
  const locations = locSrc.map((loc) =>
    makeLocation(
      loc,
      look,
      prompts,
      scenes.filter((sc) => locationMatchesScene(loc, sc)).map((sc) => sc.id),
    ),
  );
  let lookdev: ProductionAsset | null = null;
  const lookdevFields = prompts?.find((p) => p.kind === "lookdev");
  if (lookdevFields) {
    lookdev = finish(lookdevFields, look, {
      id: lookdevFields.id,
      kind: "lookdev",
      name: lookdevFields.title,
      kicker: "全片光线与材质",
      summary: lookdevFields.notes || lookdevFields.setting,
      facts: [
        { label: "光线", value: lookdevFields.lighting },
        { label: "构图", value: lookdevFields.composition },
      ].filter((f) => f.value),
      continuityLock: lookdevFields.notes,
      sceneIds: [],
    });
  }

  const groups: SceneGroup[] = scenes.map((sc) => {
    const fields = fromScene(sc);
    const sceneStill = finish(fields, look, {
      id: `SCENE-${sc.id}`,
      kind: "scene",
      name: sc.location || sc.heading,
      kicker: sc.heading,
      summary: sc.action,
      facts: [
        { label: "时间", value: sc.time },
        { label: "地点", value: sc.location },
      ].filter((f) => f.value),
      continuityLock: sc.heading,
      sceneIds: [sc.id],
    });
    const locationAsset = locations.find((loc) => {
      const src = locSrc.find((l) => l.id === loc.id);
      return src ? locationMatchesScene(src, sc) : sc.location.includes(loc.name);
    });
    const sceneChars = characters.filter((c) => characterInScene(c.name, sc));
    const sceneShots = shots
      .filter((sh) => sh.sceneId === sc.id)
      .map((sh) => {
        const img = fromShot(sh);
        const motion = motions?.find((v: VideoPromptFields) => v.shotId === sh.id);
        return finish(img, look, {
          id: sh.id,
          kind: "keyframe",
          name: sh.title,
          kicker: `${sh.scale} · ${sh.camera} · ${sh.durationSec}s`,
          summary: sh.action,
          facts: [
            { label: "起", value: sh.startFrame },
            { label: "止", value: sh.endFrame },
          ],
          continuityLock: sh.purpose,
          sceneIds: [sc.id],
          videoPrompt: motion ? composeImagineVideoPrompt(motion, look) : undefined,
          durationSec: sh.durationSec,
        });
      });
    return {
      id: sc.id,
      heading: sc.heading,
      location: sc.location,
      time: sc.time,
      action: sc.action,
      sceneStill,
      characters: sceneChars,
      locationAsset,
      shots: sceneShots,
    };
  });

  const props = (ep.assets?.props ?? []).map((p) => {
    const img = findImage(prompts, "prop", p.id, p.name);
    const fields = fromProp(p, img);
    return finish(fields, look, {
      id: p.id,
      kind: "prop",
      name: p.name,
      kicker: p.state,
      summary: p.description,
      facts: [{ label: "状态", value: p.state }].filter((f) => f.value),
      continuityLock: p.continuityLock,
      sceneIds: [],
    });
  });

  return { groups, characters, locations, props, lookdev };
}

export function buildAssetLibrary(project: Project): ProductionAsset[] {
  const board = buildAssetBoard(project);
  const seen = new Set<string>();
  const out: ProductionAsset[] = [];
  const push = (a?: ProductionAsset | null) => {
    if (!a || seen.has(a.id)) return;
    seen.add(a.id);
    out.push(a);
  };
  push(board.lookdev);
  for (const g of board.groups) {
    push(g.sceneStill);
    g.characters.forEach(push);
    push(g.locationAsset);
    g.shots.forEach(push);
  }
  board.characters.forEach(push);
  board.locations.forEach(push);
  board.props.forEach(push);
  return out;
}

export function countByKind(items: ProductionAsset[]) {
  return {
    character: items.filter((i) => i.kind === "character").length,
    location: items.filter((i) => i.kind === "location").length,
    prop: items.filter((i) => i.kind === "prop").length,
    lookdev: items.filter((i) => i.kind === "lookdev").length,
    scene: items.filter((i) => i.kind === "scene").length,
    keyframe: items.filter((i) => i.kind === "keyframe").length,
  };
}

const BATCH_KIND_ORDER: AssetKind[] = [
  "lookdev",
  "character",
  "location",
  "scene",
  "prop",
  "keyframe",
];

export function buildImagineBatchLaunch(project: Project) {
  const library = buildAssetLibrary(project);
  const ratio = getRatio(project.look.ratioId).label;
  const sorted = [...library].sort(
    (a, b) => BATCH_KIND_ORDER.indexOf(a.kind) - BATCH_KIND_ORDER.indexOf(b.kind),
  );
  const negative = sorted[0]?.negative ?? "";
  const header = `为《${project.novel.title}》逐条生成 ${ratio} 电影感写实静帧，每条资产一张图。顺序：风格帧 → 人物角色板 → 场景 → 场次 → 道具。同一角色的脸、发型、服装必须连续。不要字幕、水印、文字叠层。`;
  const blocks = sorted.map(
    (a, i) => `${i + 1}. 【${ASSET_KIND_LABEL[a.kind]}】${a.name}\n${a.imaginePrompt}`,
  );
  const clipboard = [header, negative ? `负面词：${negative}` : "", ...blocks]
    .filter(Boolean)
    .join("\n\n");

  const compactHeader = `${header} 若清单被截断，以剪贴板里的完整文本为准，请让我粘贴后续条目。\n\n`;
  let urlBody = compactHeader;
  let included = 0;
  for (const block of blocks) {
    if (urlBody.length + block.length + 2 > 2800) break;
    urlBody += `${block}\n\n`;
    included += 1;
  }
  if (included < sorted.length) {
    urlBody += `（URL 只带了前 ${included} 条，其余 ${sorted.length - included} 条已复制到剪贴板，请粘贴后继续生成。）`;
  }

  return {
    url: grokImagineAgentUrl(urlBody),
    clipboard,
    count: sorted.length,
    included,
    pages: sorted.map((a) => ({
      id: a.id,
      name: a.name,
      kind: a.kind,
      url: a.agentUrl || a.imagineUrl,
    })),
  };
}
