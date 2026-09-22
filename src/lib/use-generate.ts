import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ProductionAsset } from "./asset-library";
import { getAiStatus, imagineStill, imagineVideoPoll, imagineVideoStart } from "./generate";
import { isStepComplete } from "./pipeline";
import { runGenerate } from "./run-generate";
import { useStudio } from "./store";
import type { GenerateStep } from "./types";

export const GENERATE_LABEL: Record<GenerateStep, string> = {
  triage: "评估改编价值",
  episodes: "切分集候选",
  script: "写可拍剧本",
  assets: "拆视觉资产",
  storyboard: "拆分镜",
  prompts: "写提示词字段",
};

export const WORKING_LABEL: Record<GenerateStep, string> = {
  triage: "正在抽样评估改编密度…",
  episodes: "正在按戏剧结果切分集…",
  script: "正在写成可拍场次…",
  assets: "正在锁定人物、场景与道具…",
  storyboard: "正在拆镜头与起止帧…",
  prompts: "正在写图片与视频提示词…",
};

const PIPELINE: GenerateStep[] = [
  "triage",
  "episodes",
  "script",
  "assets",
  "storyboard",
  "prompts",
];

let cachedAi: boolean | null = null;
let inflightAi: Promise<boolean> | null = null;

export function useAiAvailable() {
  const [available, setAvailable] = useState<boolean | null>(cachedAi);
  useEffect(() => {
    let alive = true;
    if (cachedAi !== null) {
      setAvailable(cachedAi);
      return () => {
        alive = false;
      };
    }
    if (!inflightAi) {
      inflightAi = getAiStatus()
        .then((r) => {
          cachedAi = r.available;
          return cachedAi;
        })
        .catch(() => {
          cachedAi = false;
          return false;
        });
    }
    inflightAi.then((value) => {
      if (alive) setAvailable(value);
    });
    return () => {
      alive = false;
    };
  }, []);
  return available;
}

export function useGenerate() {
  const generating = useStudio((s) => s.generating);
  const setGenerating = useStudio((s) => s.setGenerating);
  const setError = useStudio((s) => s.setError);
  const applyTriage = useStudio((s) => s.applyTriage);
  const applyDevelopment = useStudio((s) => s.applyDevelopment);
  const applyScript = useStudio((s) => s.applyScript);
  const applyAssets = useStudio((s) => s.applyAssets);
  const applyStoryboard = useStudio((s) => s.applyStoryboard);
  const applyPrompts = useStudio((s) => s.applyPrompts);

  async function generate(step: GenerateStep): Promise<boolean> {
    const project = useStudio.getState().active();
    if (!project) return false;
    if (useStudio.getState().generating) return false;
    setGenerating(step);
    setError(null);
    try {
      const result = await runGenerate(project, step);
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      switch (result.step) {
        case "triage":
          if (result.triage) applyTriage(result.triage);
          break;
        case "episodes":
          if (!result.development?.episodes.length) {
            setError("没有切出分集，请再试一次。");
            return false;
          }
          applyDevelopment(result.development);
          break;
        case "script":
          if (result.script) applyScript(result.script);
          break;
        case "assets":
          if (result.assets) applyAssets(result.assets);
          break;
        case "storyboard":
          if (result.storyboard) applyStoryboard(result.storyboard);
          break;
        case "prompts":
          if (result.imagePrompts && result.videoPrompts) {
            applyPrompts(result.imagePrompts, result.videoPrompts);
          }
          break;
      }
      return true;
    } catch {
      setError("生成中断，请再试一次。");
      return false;
    } finally {
      setGenerating(null);
    }
  }

  async function generateRemaining(): Promise<void> {
    for (const step of PIPELINE) {
      const project = useStudio.getState().active();
      if (!project) return;
      if (isStepComplete(project, step)) continue;
      const ok = await generate(step);
      if (!ok) return;
    }
  }

  return { generate, generateRemaining, generating };
}

export function useImagineStill() {
  const ai = useAiAvailable();
  const busyId = useStudio((s) => s.stillBusyId);
  const setBusy = useStudio((s) => s.setStillBusyId);
  const setRender = useStudio((s) => s.setRender);
  const setClip = useStudio((s) => s.setClip);
  const renders = useStudio((s) => s.active()?.renders);

  async function generateStillFromPrompt(id: string, name: string, prompt: string, aspectRatio: string) {
    if (!ai) {
      toast.error("当前环境未开放 Imagine。");
      return false;
    }
    if (useStudio.getState().stillBusyId) {
      toast.message("正在生成另一条，请稍候。");
      return false;
    }
    setBusy(id);
    try {
      const result = await imagineStill({
        data: { prompt, aspectRatio },
      });
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      setRender(id, result.url);
      toast.success(`${name} 已生成`);
      return true;
    } catch {
      toast.error("Imagine 中断，请再试一次。");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function generateStill(asset: ProductionAsset, aspectRatio: string) {
    return generateStillFromPrompt(asset.id, asset.name, asset.imaginePrompt, aspectRatio);
  }

  async function generateClipFromPrompt(
    id: string,
    name: string,
    prompt: string,
    aspectRatio: string,
    durationSec: number,
    imageUrl?: string,
  ) {
    if (!ai) {
      toast.error("当前环境未开放 Imagine。");
      return false;
    }
    if (useStudio.getState().stillBusyId) {
      toast.message("正在生成另一条，请稍候。");
      return false;
    }
    setBusy(id);
    try {
      const started = await imagineVideoStart({
        data: { prompt, aspectRatio, durationSec, imageUrl },
      });
      if (!started.ok) {
        toast.error(started.error);
        return false;
      }
      toast.message(`${name} 视频正在渲染…`);
      for (let i = 0; i < 36; i += 1) {
        await new Promise((r) => window.setTimeout(r, 4000));
        const polled = await imagineVideoPoll({ data: { requestId: started.requestId } });
        if (!polled.ok) {
          toast.error(polled.error);
          return false;
        }
        if (polled.status === "done") {
          setClip(id, polled.url);
          toast.success(`${name} 视频已生成`);
          return true;
        }
      }
      toast.error("视频还在渲染，请稍后再点一次。");
      return false;
    } catch {
      toast.error("视频生成中断，请再试一次。");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function generateClip(asset: ProductionAsset, aspectRatio: string) {
    const prompt = asset.videoPrompt ?? asset.imaginePrompt;
    const still = useStudio.getState().active()?.renders?.[asset.id];
    return generateClipFromPrompt(
      asset.id,
      asset.name,
      prompt,
      aspectRatio,
      asset.durationSec ?? 6,
      still,
    );
  }

  async function generateMany(assets: ProductionAsset[], aspectRatio: string, limit = 6) {
    const pending = assets.filter((a) => !renders?.[a.id]).slice(0, limit);
    if (!pending.length) {
      toast.message("这些资产已经生成过了。");
      return;
    }
    toast.message(`正在用 Imagine 生成 ${pending.length} 张…`);
    for (const asset of pending) {
      const ok = await generateStill(asset, aspectRatio);
      if (!ok) return;
    }
  }

  return {
    ai,
    busyId,
    renders,
    generateStill,
    generateStillFromPrompt,
    generateClip,
    generateClipFromPrompt,
    generateMany,
  };
}
