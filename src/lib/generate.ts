import { createServerFn } from "@tanstack/react-start";
import { getCamera, getRatio, getStyle } from "./look";
import type {
  Assets,
  DevelopmentResult,
  GenerateStep,
  ImagePromptFields,
  LookSettings,
  Script,
  Shot,
  TriageResult,
  VideoPromptFields,
} from "./types";

export type GenerateInput = {
  step: GenerateStep;
  novelTitle: string;
  novelText: string;
  look: LookSettings;
  episodeTitle?: string;
  episodeLogline?: string;
  scriptSummary?: string;
  assetsSummary?: string;
  storyboardSummary?: string;
};

export type GenerateOk = {
  ok: true;
  step: GenerateStep;
  triage?: TriageResult;
  development?: DevelopmentResult;
  script?: Script;
  assets?: Assets;
  storyboard?: Shot[];
  imagePrompts?: ImagePromptFields[];
  videoPrompts?: VideoPromptFields[];
};

export type GenerateResult = GenerateOk | { ok: false; error: string };

const MAX_TOKENS: Record<GenerateStep, number> = {
  triage: 1800,
  episodes: 2200,
  script: 3200,
  assets: 2600,
  storyboard: 3400,
  prompts: 4000,
};

function systemFor(step: GenerateStep, look: LookSettings): string {
  const style = getStyle(look.styleId);
  const camera = getCamera(look.cameraId);
  const ratio = getRatio(look.ratioId);
  const wide = ratio.w >= ratio.h;
  const common = `你是${wide ? "横屏电影感现实剧" : "竖屏短剧"}的编剧与导演。画幅 ${ratio.label}（${ratio.name}），视觉「${style.name}」，相机偏向「${camera.name}」。构图必须服从该画幅，不要擅自改成另一种画幅。只输出一个 JSON 对象，不要 Markdown，不要解释。
分析是转化性的：提取功能与可拍动作，不要大段抄原文。通俗题材里的对峙、反转、情爱张力按虚构叙事处理。`;
  switch (step) {
    case "triage":
      return `${common}
任务：改编价值快评。JSON 形状：
{"verdict":"worth|borderline|skip","densityNote":"","screenReady":[""],"proseOnly":[""],"openingReplace":"","productionLoad":"","recommendation":""}
screenReady 是已经可拍的可见动作；proseOnly 是需要改写才能上镜的段落。`;
    case "episodes":
      return `${common}
任务：故事引擎与分集候选。最多 3 集。JSON：
{"engine":"","directorNote":"","genre":"","episodes":[{"id":"EP01","number":1,"title":"","logline":"","dramaticResult":"","sourceSpan":"","hook":""}]}
每一集必须有一个局部戏剧结果和明确交接，不要一章一集。`;
    case "script":
      return `${common}
任务：写一集可拍剧本，3–5 场。只写发生了什么。JSON：
{"episodeId":"EP01","title":"","durationHint":"","scenes":[{"id":"SC001","heading":"内/外 · 地点 · 日/夜","time":"","location":"","action":"","dialogue":[{"character":"","line":"","parenthetical":""}]}]}
对白短，动作可见。`;
    case "assets":
      return `${common}
任务：拆视觉资产。JSON：
{"characters":[{"id":"CHAR-名","name":"","age":"","identity":"","look":"","wardrobe":"","continuityLock":""}],"locations":[{"id":"LOC-名","name":"","description":"","lighting":"","views":[""],"continuityLock":""}],"props":[{"id":"PROP-名","name":"","description":"","state":"","continuityLock":""}]}
连续性锁必须是可核对的具体短语。`;
    case "storyboard":
      return `${common}
任务：把剧本拆成 8–12 个镜头。JSON：
{"shots":[{"id":"SHOT-001","sceneId":"SC001","title":"","scale":"特写|近景|中景|全景|过肩","camera":"","durationSec":4,"purpose":"","startFrame":"","endFrame":"","action":"","dialogue":""}]}
每镜有可验证的起止帧，时长 4–10 秒。横屏用横向空间、过肩与全景建立，不要写成手机竖拍从上到下的构图，除非画幅本身是竖的。`;
    case "prompts":
      return `${common}
任务：为资产与分镜写结构化提示词字段（英文画面描述，中文 title）。不要把质量词/负面词写进字段，那些由系统另拼。JSON：
{"imagePrompts":[{"id":"IMG-1","kind":"lookdev|character|location|prop|keyframe","title":"","subject":"","wardrobe":"","setting":"","lighting":"","composition":"","notes":""}],"videoPrompts":[{"id":"MOTION-001","shotId":"SHOT-001","title":"","durationSec":4,"cameraMove":"","subject":"","action":"","setting":"","lighting":"","startState":"","endState":"","dialogue":"","audio":""}]}
图片 5–8 张；视频与镜头一一对应。禁止要求画面出现字幕、caption、水印。`;
  }
}

function userFor(input: GenerateInput): string {
  const parts = [
    `原著名：${input.novelTitle}`,
    `原著：\n${input.novelText}`,
    `视觉：${getStyle(input.look.styleId).name} / ${getCamera(input.look.cameraId).name} / ${getRatio(input.look.ratioId).name}（${getRatio(input.look.ratioId).label}）`,
  ];
  if (input.episodeTitle) {
    parts.push(`当前集：${input.episodeTitle}`);
    parts.push(`集 logline：${input.episodeLogline ?? ""}`);
  }
  if (input.scriptSummary) parts.push(`剧本摘要：\n${input.scriptSummary}`);
  if (input.assetsSummary) parts.push(`资产摘要：\n${input.assetsSummary}`);
  if (input.storyboardSummary) parts.push(`分镜摘要：\n${input.storyboardSummary}`);
  return parts.join("\n\n");
}

function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("模型没有返回 JSON");
  return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
}

function asString(v: unknown, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

function asStringArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

function asNum(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function normalize(step: GenerateStep, data: Record<string, unknown>): GenerateOk {
  switch (step) {
    case "triage": {
      const verdictRaw = asString(data.verdict, "borderline");
      const verdict =
        verdictRaw === "worth" || verdictRaw === "skip" || verdictRaw === "borderline"
          ? verdictRaw
          : "borderline";
      return {
        ok: true,
        step,
        triage: {
          verdict,
          densityNote: asString(data.densityNote),
          screenReady: asStringArr(data.screenReady),
          proseOnly: asStringArr(data.proseOnly),
          openingReplace: asString(data.openingReplace),
          productionLoad: asString(data.productionLoad),
          recommendation: asString(data.recommendation),
        },
      };
    }
    case "episodes": {
      const episodesRaw = Array.isArray(data.episodes) ? data.episodes : [];
      const episodes = episodesRaw.slice(0, 3).map((e, i) => {
        const row = (e ?? {}) as Record<string, unknown>;
        const n = i + 1;
        return {
          id: asString(row.id, `EP0${n}`),
          number: asNum(row.number, n),
          title: asString(row.title, `第${n}集`),
          logline: asString(row.logline),
          dramaticResult: asString(row.dramaticResult),
          sourceSpan: asString(row.sourceSpan),
          hook: asString(row.hook),
        };
      });
      return {
        ok: true,
        step,
        development: {
          engine: asString(data.engine),
          directorNote: asString(data.directorNote),
          genre: asString(data.genre),
          episodes,
        },
      };
    }
    case "script": {
      const scenesRaw = Array.isArray(data.scenes) ? data.scenes : [];
      const scenes = scenesRaw.map((s, i) => {
        const row = (s ?? {}) as Record<string, unknown>;
        const dialogueRaw = Array.isArray(row.dialogue) ? row.dialogue : [];
        return {
          id: asString(row.id, `SC${String(i + 1).padStart(3, "0")}`),
          heading: asString(row.heading),
          time: asString(row.time),
          location: asString(row.location),
          action: asString(row.action),
          dialogue: dialogueRaw.map((d) => {
            const line = (d ?? {}) as Record<string, unknown>;
            return {
              character: asString(line.character),
              line: asString(line.line),
              parenthetical: asString(line.parenthetical) || undefined,
            };
          }),
        };
      });
      return {
        ok: true,
        step,
        script: {
          episodeId: asString(data.episodeId, "EP01"),
          title: asString(data.title),
          durationHint: asString(data.durationHint),
          scenes,
        },
      };
    }
    case "assets": {
      const chars = Array.isArray(data.characters) ? data.characters : [];
      const locs = Array.isArray(data.locations) ? data.locations : [];
      const props = Array.isArray(data.props) ? data.props : [];
      return {
        ok: true,
        step,
        assets: {
          characters: chars.map((c, i) => {
            const row = (c ?? {}) as Record<string, unknown>;
            return {
              id: asString(row.id, `CHAR-${i + 1}`),
              name: asString(row.name),
              age: asString(row.age),
              identity: asString(row.identity),
              look: asString(row.look),
              wardrobe: asString(row.wardrobe),
              continuityLock: asString(row.continuityLock),
            };
          }),
          locations: locs.map((c, i) => {
            const row = (c ?? {}) as Record<string, unknown>;
            return {
              id: asString(row.id, `LOC-${i + 1}`),
              name: asString(row.name),
              description: asString(row.description),
              lighting: asString(row.lighting),
              views: asStringArr(row.views),
              continuityLock: asString(row.continuityLock),
            };
          }),
          props: props.map((c, i) => {
            const row = (c ?? {}) as Record<string, unknown>;
            return {
              id: asString(row.id, `PROP-${i + 1}`),
              name: asString(row.name),
              description: asString(row.description),
              state: asString(row.state),
              continuityLock: asString(row.continuityLock),
            };
          }),
        },
      };
    }
    case "storyboard": {
      const shotsRaw = Array.isArray(data.shots) ? data.shots : [];
      return {
        ok: true,
        step,
        storyboard: shotsRaw.map((s, i) => {
          const row = (s ?? {}) as Record<string, unknown>;
          return {
            id: asString(row.id, `SHOT-${String(i + 1).padStart(3, "0")}`),
            sceneId: asString(row.sceneId, "SC001"),
            title: asString(row.title),
            scale: asString(row.scale),
            camera: asString(row.camera),
            durationSec: asNum(row.durationSec, 4),
            purpose: asString(row.purpose),
            startFrame: asString(row.startFrame),
            endFrame: asString(row.endFrame),
            action: asString(row.action),
            dialogue: asString(row.dialogue) || undefined,
          };
        }),
      };
    }
    case "prompts": {
      const imgs = Array.isArray(data.imagePrompts) ? data.imagePrompts : [];
      const vids = Array.isArray(data.videoPrompts) ? data.videoPrompts : [];
      const kinds = new Set(["lookdev", "character", "location", "prop", "keyframe"]);
      return {
        ok: true,
        step,
        imagePrompts: imgs.map((c, i) => {
          const row = (c ?? {}) as Record<string, unknown>;
          const kind = asString(row.kind, "keyframe");
          return {
            id: asString(row.id, `IMG-${i + 1}`),
            kind: (kinds.has(kind) ? kind : "keyframe") as ImagePromptFields["kind"],
            title: asString(row.title),
            subject: asString(row.subject),
            wardrobe: asString(row.wardrobe),
            setting: asString(row.setting),
            lighting: asString(row.lighting),
            composition: asString(row.composition),
            notes: asString(row.notes),
          };
        }),
        videoPrompts: vids.map((c, i) => {
          const row = (c ?? {}) as Record<string, unknown>;
          return {
            id: asString(row.id, `MOTION-${String(i + 1).padStart(3, "0")}`),
            shotId: asString(row.shotId, `SHOT-${String(i + 1).padStart(3, "0")}`),
            title: asString(row.title),
            durationSec: asNum(row.durationSec, 4),
            cameraMove: asString(row.cameraMove),
            subject: asString(row.subject),
            action: asString(row.action),
            setting: asString(row.setting),
            lighting: asString(row.lighting),
            startState: asString(row.startState),
            endState: asString(row.endState),
            dialogue: asString(row.dialogue) || undefined,
            audio: asString(row.audio),
          };
        }),
      };
    }
  }
}

export const getAiStatus = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ available: boolean }> => {
    return { available: Boolean(process.env.XAI_API_KEY) };
  },
);

export const generateStep = createServerFn({ method: "POST" })
  .validator((input: GenerateInput) => input)
  .handler(async ({ data }): Promise<GenerateResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "当前环境未开放模型，打开样章仍可浏览完整拍摄包。" };

    const novelText =
      data.novelText.length > 8000
        ? `${data.novelText.slice(0, 3600)}\n\n[…中段省略…]\n\n${data.novelText.slice(-3200)}`
        : data.novelText;

    const payload: GenerateInput = { ...data, novelText };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: data.step === "triage" ? 0.4 : 0.7,
        max_tokens: MAX_TOKENS[data.step],
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemFor(data.step, data.look) },
          { role: "user", content: userFor(payload) },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `模型请求失败（${res.status}），请稍后重试。` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = parseJsonObject(content);
      return normalize(data.step, parsed);
    } catch {
      return { ok: false, error: "模型返回无法解析，请再跑一次。" };
    }
  });

export type ImagineStillResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export const imagineStill = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; aspectRatio: string }) => input)
  .handler(async ({ data }): Promise<ImagineStillResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "当前环境未开放 Imagine。" };

    const prompt = data.prompt.trim().slice(0, 4000);
    if (!prompt) return { ok: false, error: "提示词是空的。" };

    async function request(body: Record<string, unknown>) {
      return fetch("https://api.x.ai/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
    }

    const payload = {
      model: "grok-imagine-image-2.0",
      prompt,
      n: 1,
      aspect_ratio: data.aspectRatio,
    };

    let res = await request(payload);
    if (!res.ok && (res.status === 400 || res.status === 422)) {
      const { aspect_ratio: _drop, ...fallback } = payload;
      res = await request(fallback);
    }
    if (!res.ok) {
      return { ok: false, error: `Imagine 生成失败（${res.status}），请稍后重试。` };
    }

    const body = (await res.json()) as {
      data?: { url?: string }[];
      url?: string;
    };
    const url = body.data?.[0]?.url ?? body.url ?? "";
    if (!url) return { ok: false, error: "Imagine 没有返回图片。" };
    return { ok: true, url };
  });

function clipSeconds(n: number) {
  if (!Number.isFinite(n) || n <= 6) return 6;
  return 10;
}

export type ImagineVideoStartResult =
  | { ok: true; requestId: string; duration: number }
  | { ok: false; error: string };

export const imagineVideoStart = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; aspectRatio: string; durationSec: number; imageUrl?: string }) => input)
  .handler(async ({ data }): Promise<ImagineVideoStartResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "当前环境未开放 Imagine。" };

    const prompt = data.prompt.trim().slice(0, 4000);
    if (!prompt) return { ok: false, error: "提示词是空的。" };

    const duration = clipSeconds(data.durationSec);
    const payload: Record<string, unknown> = {
      model: "grok-imagine-video-1.5",
      prompt,
      duration,
      aspect_ratio: data.aspectRatio,
      resolution: "720p",
    };
    if (data.imageUrl) payload.image = { url: data.imageUrl };

    const res = await fetch("https://api.x.ai/v1/videos/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `视频生成失败（${res.status}），请稍后重试。` };
    }
    const body = (await res.json()) as { request_id?: string; requestId?: string };
    const requestId = body.request_id ?? body.requestId ?? "";
    if (!requestId) return { ok: false, error: "Imagine 没有返回任务编号。" };
    return { ok: true, requestId, duration };
  });

export type ImagineVideoPollResult =
  | { ok: true; status: "pending" }
  | { ok: true; status: "done"; url: string }
  | { ok: false; error: string };

export const imagineVideoPoll = createServerFn({ method: "POST" })
  .validator((input: { requestId: string }) => input)
  .handler(async ({ data }): Promise<ImagineVideoPollResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "当前环境未开放 Imagine。" };

    const res = await fetch(`https://api.x.ai/v1/videos/${encodeURIComponent(data.requestId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      return { ok: false, error: `查询视频失败（${res.status}）。` };
    }
    const body = (await res.json()) as {
      status?: string;
      video?: { url?: string };
      url?: string;
    };
    if (body.status === "done") {
      const url = body.video?.url ?? body.url ?? "";
      if (!url) return { ok: false, error: "视频完成了但没有地址。" };
      return { ok: true, status: "done", url };
    }
    if (body.status === "failed" || body.status === "expired") {
      return { ok: false, error: body.status === "expired" ? "视频任务过期了。" : "视频生成失败。" };
    }
    return { ok: true, status: "pending" };
  });
