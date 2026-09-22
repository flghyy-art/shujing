import type { LookSettings } from "./types";

export type StylePack = {
  id: string;
  name: string;
  en: string;
  blurb: string;
  prompt: string;
  quality: string[];
  negative: string[];
};

export type CameraPack = {
  id: string;
  name: string;
  en: string;
  blurb: string;
  prompt: string;
};

export type RatioPack = {
  id: string;
  name: string;
  label: string;
  w: number;
  h: number;
  prompt: string;
  arToken: string;
};

export const STYLES: StylePack[] = [
  {
    id: "cinematic-realism",
    name: "电影感写实",
    en: "Cinematic realism",
    blurb: "横屏剧场光、真实肤质、35mm 质感，按故事片来拍。",
    prompt:
      "cinematic photorealistic live-action feature, 35mm film, naturalistic skin, motivated practical lighting, grounded production design, widescreen composition, shallow depth of field",
    quality: [
      "cinematic lighting",
      "film grain",
      "natural skin texture",
      "color graded",
      "shallow depth of field",
      "anamorphic bokeh",
      "电影感",
    ],
    negative: [
      "vertical video",
      "tiktok",
      "phone selfie",
      "cartoon",
      "blurry",
      "watermark",
      "text overlay",
      "subtitle",
      "extra fingers",
      "字幕",
      "水印",
      "竖屏",
    ],
  },
  {
    id: "urban-drama",
    name: "都市写实",
    en: "Urban realism",
    blurb: "当代中国都市：湿沥青、店招霓虹、真实肤质。",
    prompt:
      "contemporary Chinese urban drama, photorealistic live action, wet asphalt, storefront neon, naturalistic skin, grounded production design",
    quality: [
      "cinematic lighting",
      "sharp focus",
      "natural skin texture",
      "film grain",
      "highly detailed",
      "电影感",
    ],
    negative: [
      "blurry",
      "watermark",
      "text overlay",
      "subtitle",
      "logo",
      "extra fingers",
      "deformed",
      "cartoon",
      "字幕",
      "水印",
    ],
  },
  {
    id: "period-wuxia",
    name: "古装仙侠",
    en: "Period wuxia",
    blurb: "广袖、灯笼、山雾与剑光，古装电影质感。",
    prompt:
      "Chinese period wuxia, silk hanfu, lantern light, mountain mist, sword gleam, cinematic costume drama",
    quality: [
      "cinematic lighting",
      "volumetric light",
      "highly detailed",
      "film grain",
      "光影细腻",
      "构图讲究",
    ],
    negative: [
      "blurry",
      "watermark",
      "text overlay",
      "subtitle",
      "modern clothing",
      "extra fingers",
      "deformed",
      "字幕",
      "水印",
    ],
  },
  {
    id: "manhua-cel",
    name: "漫剧赛璐璐",
    en: "Motion-comic cel",
    blurb: "干净线稿、赛璐璐上色，适合漫剧与动态漫。",
    prompt:
      "Chinese motion comic, clean line art, cel shading, expressive eyes, graphic novel panel, consistent character design",
    quality: [
      "clean lineart",
      "vibrant cel shading",
      "sharp focus",
      "highly detailed",
      "consistent character sheet",
    ],
    negative: [
      "photorealistic",
      "blurry",
      "watermark",
      "text overlay",
      "subtitle",
      "3d render",
      "extra fingers",
      "字幕",
      "水印",
    ],
  },
  {
    id: "film-stock",
    name: "电影胶片",
    en: "Film stock",
    blurb: "35mm 质感、轻微卤化银、暗部保留。",
    prompt:
      "35mm film still, Kodak Portra color science, subtle halation, preserved shadows, anamorphic widescreen texture",
    quality: [
      "film grain",
      "cinematic lighting",
      "color graded",
      "sharp focus",
      "natural skin texture",
      "电影感",
    ],
    negative: [
      "digital noise",
      "oversaturated",
      "watermark",
      "text overlay",
      "subtitle",
      "HDR glow",
      "extra fingers",
      "字幕",
    ],
  },
  {
    id: "neon-night",
    name: "霓虹夜戏",
    en: "Neon night",
    blurb: "雨、反射、品红青对比，夜戏专用。",
    prompt:
      "rain-soaked neon night, magenta and cyan bounce light, reflective puddles, urban night cinematography",
    quality: [
      "volumetric light",
      "cinematic lighting",
      "rim light",
      "highly detailed",
      "sharp focus",
      "光影细腻",
    ],
    negative: [
      "daylight",
      "overexposed",
      "watermark",
      "text overlay",
      "subtitle",
      "blurry",
      "extra fingers",
      "过曝",
      "字幕",
    ],
  },
  {
    id: "retro-period",
    name: "年代怀旧",
    en: "Retro period",
    blurb: "略褪色、钨丝灯、旧物纹理。",
    prompt:
      "Chinese retro period drama, faded print, tungsten practicals, worn textures, nostalgic production design",
    quality: [
      "film grain",
      "cinematic lighting",
      "color graded",
      "natural skin texture",
      "highly detailed",
    ],
    negative: [
      "modern LED",
      "watermark",
      "text overlay",
      "subtitle",
      "blurry",
      "extra fingers",
      "oversaturated",
      "字幕",
    ],
  },
  {
    id: "noir-bw",
    name: "黑白默片",
    en: "Black-and-white",
    blurb: "高反差、硬光、沉默的戏剧张力。",
    prompt:
      "high-contrast black and white cinematography, hard light, deep shadows, silent-film gravity, no color",
    quality: [
      "sharp focus",
      "high contrast",
      "cinematic lighting",
      "film grain",
      "highly detailed",
    ],
    negative: [
      "color",
      "watermark",
      "text overlay",
      "subtitle",
      "blurry",
      "extra fingers",
      "deformed",
      "字幕",
    ],
  },
  {
    id: "cgi-cinema",
    name: "三维电影感",
    en: "3D cinematic",
    blurb: "虚幻引擎级材质，适合概念预演。",
    prompt:
      "cinematic Unreal Engine render, ray-traced lighting, filmic color, detailed materials, still from a feature",
    quality: [
      "octane render",
      "ray tracing",
      "cinematic lighting",
      "highly detailed",
      "8k",
      "sharp focus",
    ],
    negative: [
      "low poly",
      "plastic skin",
      "watermark",
      "text overlay",
      "subtitle",
      "blurry",
      "extra fingers",
      "字幕",
    ],
  },
];

export const CAMERAS: CameraPack[] = [
  {
    id: "handheld-close",
    name: "手持贴近",
    en: "Handheld close",
    blurb: "呼吸感、压迫、情绪贴脸。",
    prompt:
      "handheld camera, close to the subject, slight breathing motion, intimate coverage",
  },
  {
    id: "gimbal-follow",
    name: "稳定器跟拍",
    en: "Gimbal follow",
    blurb: "走路、进门、过肩的跟拍。",
    prompt: "gimbal tracking shot, smooth follow, subject-centered framing",
  },
  {
    id: "locked-off",
    name: "固定锁机",
    en: "Locked-off",
    blurb: "三脚架、干净、让表演自己发生。",
    prompt: "locked-off tripod shot, no camera move, composed static frame",
  },
  {
    id: "slow-dolly",
    name: "缓慢推轨",
    en: "Slow dolly",
    blurb: "推进或拉出，给发现与揭示。",
    prompt: "slow dolly in, measured camera move, revealing emphasis",
  },
  {
    id: "over-shoulder",
    name: "过肩对峙",
    en: "Over-shoulder",
    blurb: "对话与权力关系的默认覆盖。",
    prompt: "over-the-shoulder coverage, dirty single, power-axis framing",
  },
  {
    id: "insert-pressure",
    name: "特写压迫",
    en: "Insert / ECU",
    blurb: "手、钥匙、眼神，信息落点。",
    prompt: "extreme close-up, tactile insert, pressure on a detail",
  },
  {
    id: "aerial-establish",
    name: "航拍建立",
    en: "Aerial establish",
    blurb: "场的第一眼，地理与天气。",
    prompt: "aerial establishing shot, slow drift, weather and geography first",
  },
  {
    id: "dutch",
    name: "荷兰角",
    en: "Dutch angle",
    blurb: "失衡、不安、少用才值钱。",
    prompt: "dutch angle, tilted horizon, unease in the frame",
  },
];

export const RATIOS: RatioPack[] = [
  {
    id: "16-9",
    name: "16:9 横屏",
    label: "16:9",
    w: 16,
    h: 9,
    prompt: "widescreen 16:9 cinematic frame, theatrical composition",
    arToken: "--ar 16:9",
  },
  {
    id: "21-9",
    name: "21:9 宽银幕",
    label: "21:9",
    w: 21,
    h: 9,
    prompt: "ultra-wide 21:9 anamorphic frame",
    arToken: "--ar 21:9",
  },
  {
    id: "9-16",
    name: "9:16 竖屏短剧",
    label: "9:16",
    w: 9,
    h: 16,
    prompt: "vertical 9:16 frame, full-body or stacked composition for mobile",
    arToken: "--ar 9:16",
  },
  {
    id: "3-4",
    name: "3:4 竖构图",
    label: "3:4",
    w: 3,
    h: 4,
    prompt: "vertical 3:4 portrait composition",
    arToken: "--ar 3:4",
  },
  {
    id: "2-3",
    name: "2:3 海报",
    label: "2:3",
    w: 2,
    h: 3,
    prompt: "2:3 poster portrait composition",
    arToken: "--ar 2:3",
  },
  {
    id: "1-1",
    name: "1:1 方图",
    label: "1:1",
    w: 1,
    h: 1,
    prompt: "1:1 square composition",
    arToken: "--ar 1:1",
  },
];

export const QUALITY_CATALOG: { group: string; words: string[] }[] = [
  {
    group: "画质",
    words: [
      "masterpiece",
      "best quality",
      "8k",
      "ultra detailed",
      "sharp focus",
      "highly detailed",
    ],
  },
  {
    group: "光影",
    words: [
      "cinematic lighting",
      "volumetric light",
      "rim light",
      "golden hour",
      "practical lights",
      "光影细腻",
    ],
  },
  {
    group: "质感",
    words: [
      "film grain",
      "natural skin texture",
      "anamorphic bokeh",
      "color graded",
      "肤质真实",
      "电影感",
    ],
  },
  {
    group: "构图",
    words: [
      "rule of thirds",
      "centered symmetry",
      "deep focus",
      "shallow depth of field",
      "构图讲究",
    ],
  },
  {
    group: "画风",
    words: [
      "clean lineart",
      "vibrant cel shading",
      "consistent character sheet",
      "octane render",
      "ray tracing",
      "high contrast",
    ],
  },
];

export const NEGATIVE_CATALOG: { group: string; words: string[] }[] = [
  {
    group: "画质",
    words: [
      "blurry",
      "low quality",
      "jpeg artifacts",
      "noise",
      "overexposed",
      "过曝",
      "模糊",
    ],
  },
  {
    group: "解剖",
    words: [
      "deformed",
      "extra fingers",
      "extra limbs",
      "bad anatomy",
      "mutated hands",
      "多余手指",
      "变形",
    ],
  },
  {
    group: "叠加",
    words: [
      "watermark",
      "text overlay",
      "subtitle",
      "logo",
      "caption",
      "UI",
      "水印",
      "字幕",
    ],
  },
  {
    group: "风格污染",
    words: [
      "cartoon",
      "photorealistic",
      "oversaturated",
      "plastic skin",
      "low poly",
      "3d render",
    ],
  },
];

export function defaultLook(): LookSettings {
  const style = STYLES[0];
  return {
    styleId: style.id,
    cameraId: "slow-dolly",
    ratioId: "16-9",
    qualityWords: [...style.quality],
    negativeWords: [...style.negative],
    customQuality: [],
    customNegative: [],
  };
}

export function applyStyleDefaults(look: LookSettings, styleId: string): LookSettings {
  const style = STYLES.find((s) => s.id === styleId) ?? STYLES[0];
  return {
    ...look,
    styleId: style.id,
    qualityWords: [...style.quality],
    negativeWords: [...style.negative],
  };
}

export function allQualityWords(look: LookSettings): string[] {
  return unique([...look.qualityWords, ...look.customQuality]);
}

export function allNegativeWords(look: LookSettings): string[] {
  return unique([...look.negativeWords, ...look.customNegative]);
}

function unique(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = item.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export function getStyle(id: string) {
  return STYLES.find((s) => s.id === id) ?? STYLES[0];
}

export function getCamera(id: string) {
  return CAMERAS.find((c) => c.id === id) ?? CAMERAS[0];
}

export function getRatio(id: string) {
  return RATIOS.find((r) => r.id === id) ?? RATIOS[0];
}

export function catalogQualitySet() {
  return new Set(QUALITY_CATALOG.flatMap((g) => g.words));
}

export function catalogNegativeSet() {
  return new Set(NEGATIVE_CATALOG.flatMap((g) => g.words));
}
