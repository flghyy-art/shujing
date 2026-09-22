import { ArrowRight, Download, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetCard, SceneShootCard } from "@/components/asset-card";
import { LookStudio } from "@/components/look-studio";
import { PromptCard } from "@/components/prompt-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSET_KIND_LABEL,
  buildAssetBoard,
  buildAssetLibrary,
  countByKind,
} from "@/lib/asset-library";
import {
  composeImageNegative,
  composeImaginePrompt,
  composeImagineVideoPrompt,
  composeVideoNegative,
} from "@/lib/compose-prompt";
import {
  buildImagineManifest,
  buildPackageMarkdown,
  downloadJson,
  downloadMarkdown,
} from "@/lib/export-package";
import { imagineAgentUrl, imagineUrl, imagineVideoAgentUrl } from "@/lib/imagine-link";
import { getRatio } from "@/lib/look";
import { canEnter, currentEpisode, STEPS } from "@/lib/pipeline";
import { useStudio } from "@/lib/store";
import type { GenerateStep, Project, StepId } from "@/lib/types";
import { GENERATE_LABEL, useAiAvailable, useGenerate } from "@/lib/use-generate";
import { cn } from "@/lib/utils";

export function StepViews() {
  const project = useStudio((s) => s.active());
  if (!project) return null;
  switch (project.currentStep) {
    case "manuscript":
      return <ManuscriptStep project={project} />;
    case "triage":
      return <TriageStep project={project} />;
    case "episodes":
      return <EpisodesStep project={project} />;
    case "look":
      return <LookStep />;
    case "script":
      return <ScriptStep project={project} />;
    case "assets":
      return <AssetsStep project={project} />;
    case "storyboard":
      return <StoryboardStep project={project} />;
    case "prompts":
      return <PromptsStep project={project} />;
  }
}

function StepHeader({
  step,
  children,
}: {
  step: StepId;
  children?: React.ReactNode;
}) {
  const meta = STEPS.find((s) => s.id === step);
  if (!meta) return null;
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
          {meta.n} · {meta.en}
        </p>
        <h2 className="mt-1 font-serif text-3xl tracking-tight">{meta.name}</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{meta.hint}</p>
      </div>
      {children}
    </header>
  );
}

function GenerateBar({
  step,
  next,
  nextLabel,
  done,
}: {
  step?: GenerateStep;
  next?: StepId;
  nextLabel?: string;
  done?: boolean;
}) {
  const { generate, generating } = useGenerate();
  const setStep = useStudio((s) => s.setStep);
  const project = useStudio((s) => s.active());
  const ai = useAiAvailable();
  const locked = Boolean(generating);
  const canNext = next && project ? canEnter(project, next) : false;

  return (
    <div className="flex flex-wrap gap-2">
      {step ? (
        <Button
          type="button"
          disabled={locked || ai === false}
          onClick={() => void generate(step)}
        >
          <Play />
          {done ? "重新生成" : GENERATE_LABEL[step]}
        </Button>
      ) : null}
      {next && nextLabel ? (
        <Button
          type="button"
          variant="secondary"
          disabled={!canNext}
          onClick={() => setStep(next)}
        >
          {nextLabel}
          <ArrowRight />
        </Button>
      ) : null}
      {ai === false && step ? (
        <p className="w-full text-xs text-muted-foreground">
          当前未开放模型。打开样章仍可浏览完整拍摄包。
        </p>
      ) : null}
    </div>
  );
}

function EpisodePicker() {
  const project = useStudio((s) => s.active());
  const setEpisode = useStudio((s) => s.setEpisode);
  if (!project?.development || project.development.episodes.length < 2) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {project.development.episodes.map((ep) => (
        <button
          key={ep.id}
          type="button"
          onClick={() => setEpisode(ep.id)}
          className={cn(
            "h-11 rounded-xl px-3 text-sm transition-colors duration-150",
            project.currentEpisodeId === ep.id
              ? "bg-paper text-paper-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
        >
          {ep.id} {ep.title}
        </button>
      ))}
    </div>
  );
}

function ManuscriptStep({ project }: { project: Project }) {
  const updateNovel = useStudio((s) => s.updateNovel);
  const [title, setTitle] = useState(project.novel.title);
  const [text, setText] = useState(project.novel.text);

  useEffect(() => {
    setTitle(project.novel.title);
    setText(project.novel.text);
  }, [project.id, project.novel.title, project.novel.text]);

  return (
    <div>
      <StepHeader step="manuscript">
        <GenerateBar next="triage" nextLabel="进入快评" />
      </StepHeader>
      <Label htmlFor="ms-title">书名</Label>
      <Input
        id="ms-title"
        className="mt-2 max-w-md"
        value={title}
        onChange={(e) => {
          const next = e.target.value;
          setTitle(next);
          updateNovel(next, text);
        }}
      />
      <Label htmlFor="ms-body" className="mt-5 block">
        正文
      </Label>
      <Textarea
        id="ms-body"
        className="mt-2 min-h-64"
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          updateNovel(title, next);
        }}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {text.trim().length} 字 · {project.novel.chapters.length} 章索引
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {project.novel.chapters.map((ch) => (
          <li key={ch.sequence} className="rounded-xl bg-secondary px-4 py-3">
            <p className="text-xs text-muted-foreground">CH {ch.sequence}</p>
            <p className="mt-1 text-sm font-medium">{ch.title}</p>
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{ch.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TriageStep({ project }: { project: Project }) {
  const t = project.triage;
  return (
    <div>
      <StepHeader step="triage">
        <GenerateBar step="triage" next="episodes" nextLabel="进入分集" done={Boolean(t)} />
      </StepHeader>
      {!t ? (
        <EmptyHint text="先抽样评估这本书值不值得拍成横屏电影感现实剧。样章已含快评，可直接往后翻。" />
      ) : (
        <div className="space-y-6">
          <VerdictBadge verdict={t.verdict} />
          <p className="max-w-2xl text-base leading-relaxed">{t.recommendation}</p>
          <p className="max-w-2xl text-sm text-muted-foreground">{t.densityNote}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <ListCard title="已经可拍" items={t.screenReady} tone="sage" />
            <ListCard title="需要改写" items={t.proseOnly} tone="rust" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <NoteCard title="开篇替换" body={t.openingReplace} />
            <NoteCard title="制作负担" body={t.productionLoad} />
          </div>
        </div>
      )}
    </div>
  );
}

function EpisodesStep({ project }: { project: Project }) {
  const d = project.development;
  const setEpisode = useStudio((s) => s.setEpisode);
  return (
    <div>
      <StepHeader step="episodes">
        <GenerateBar
          step="episodes"
          next="look"
          nextLabel="设定视觉方向"
          done={Boolean(d)}
        />
      </StepHeader>
      {!d ? (
        <EmptyHint text="按局部戏剧结果切分集，不按章号平均切。" />
      ) : (
        <div className="space-y-6">
          <NoteCard title="故事引擎" body={d.engine} />
          <NoteCard title="导演备忘" body={d.directorNote} />
          <p className="text-xs text-muted-foreground">类型 · {d.genre}</p>
          <ul className="grid gap-3">
            {d.episodes.map((ep) => {
              const active = project.currentEpisodeId === ep.id;
              return (
                <li key={ep.id}>
                  <button
                    type="button"
                    onClick={() => setEpisode(ep.id)}
                    className={cn(
                      "w-full rounded-2xl p-5 text-left transition-colors duration-150",
                      active ? "bg-paper text-paper-foreground" : "bg-secondary hover:bg-accent",
                    )}
                  >
                    <p className={cn("text-xs", active ? "text-paper-foreground/60" : "text-muted-foreground")}>
                      {ep.id} · {ep.sourceSpan}
                    </p>
                    <h3 className="mt-1 font-serif text-xl">{ep.title}</h3>
                    <p className={cn("mt-2 text-sm", active ? "text-paper-foreground/75" : "text-muted-foreground")}>
                      {ep.logline}
                    </p>
                    <p className="mt-3 text-sm">结果：{ep.dramaticResult}</p>
                    <p className={cn("mt-1 text-sm", active ? "text-paper-foreground/70" : "text-muted-foreground")}>
                      钩子：{ep.hook}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function LookStep() {
  const setStep = useStudio((s) => s.setStep);
  const project = useStudio((s) => s.active());
  const canScript = project ? canEnter(project, "script") : false;
  return (
    <div>
      <StepHeader step="look">
        <Button type="button" variant="secondary" disabled={!canScript} onClick={() => setStep("script")}>
          进入剧本
          <ArrowRight />
        </Button>
      </StepHeader>
      <LookStudio />
    </div>
  );
}

function ScriptStep({ project }: { project: Project }) {
  const ep = currentEpisode(project);
  const script = ep?.script;
  return (
    <div>
      <StepHeader step="script">
        <GenerateBar step="script" next="assets" nextLabel="拆资产" done={Boolean(script)} />
      </StepHeader>
      <EpisodePicker />
      {!script ? (
        <EmptyHint text="选定一集后写成可拍场次：动作可见，对白短。" />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {script.title} · {script.durationHint}
          </p>
          {script.scenes.map((sc) => (
            <article key={sc.id} className="rounded-2xl bg-paper p-5 text-paper-foreground">
              <p className="text-xs tracking-wide text-paper-foreground/55">
                {sc.id} · {sc.heading}
              </p>
              <p className="mt-3 text-sm leading-relaxed">{sc.action}</p>
              <ul className="mt-4 space-y-2">
                {sc.dialogue.map((d, i) => (
                  <li key={`${sc.id}-${i}`}>
                    <p className="text-xs tracking-wide text-paper-foreground/55">{d.character}</p>
                    {d.parenthetical ? (
                      <p className="text-xs text-paper-foreground/45">（{d.parenthetical}）</p>
                    ) : null}
                    <p className="font-serif text-base">{d.line}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function AssetsStep({ project }: { project: Project }) {
  const ep = currentEpisode(project);
  const assets = ep?.assets;
  const board = buildAssetBoard(project);
  const library = buildAssetLibrary(project);
  const counts = countByKind(library);
  const hasBoard = library.length > 0;

  function exportAssets() {
    downloadMarkdown(`${project.novel.title}-资产清单.md`, buildPackageMarkdown(project));
    window.setTimeout(() => {
      downloadJson(`${project.novel.title}-imagine.json`, buildImagineManifest(project));
    }, 400);
  }

  return (
    <div>
      <StepHeader step="assets">
        <div className="flex flex-wrap gap-2">
          <GenerateBar step="assets" next="storyboard" nextLabel="进入分镜" done={Boolean(assets)} />
          {hasBoard ? (
            <Button type="button" variant="paper" onClick={exportAssets}>
              <Download />
              导出资产清单
            </Button>
          ) : null}
        </div>
      </StepHeader>
      <EpisodePicker />
      {!hasBoard ? (
        <EmptyHint text="拆完后，每一场戏都会生成人物与场景资产：提示词、Grok Imagine 链接、Imagine Agent 链接，可直接拿去生成。" />
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            场次 {counts.scene} · 人物 {counts.character} · 场景 {counts.location}
            {counts.keyframe ? ` · 分镜帧 ${counts.keyframe}` : ""}
            {counts.prop ? ` · 道具 ${counts.prop}` : ""}
          </p>
          <Tabs defaultValue={board.groups.length ? "scenes" : "characters"}>
            <TabsList className="flex h-auto min-h-11 flex-wrap">
              {board.groups.length ? (
                <TabsTrigger value="scenes">场次 {board.groups.length}</TabsTrigger>
              ) : null}
              <TabsTrigger value="characters">人物 {counts.character}</TabsTrigger>
              <TabsTrigger value="locations">场景 {counts.location}</TabsTrigger>
              {counts.prop ? <TabsTrigger value="props">道具 {counts.prop}</TabsTrigger> : null}
              {board.lookdev ? <TabsTrigger value="lookdev">{ASSET_KIND_LABEL.lookdev}</TabsTrigger> : null}
            </TabsList>
            {board.groups.length ? (
              <TabsContent value="scenes" className="mt-5 space-y-5">
                {board.groups.map((g) => (
                  <SceneShootCard key={g.id} group={g} look={project.look} />
                ))}
              </TabsContent>
            ) : null}
            <TabsContent value="characters" className="mt-5 space-y-4">
              {board.characters.map((item) => (
                <AssetCard key={item.id} asset={item} look={project.look} />
              ))}
            </TabsContent>
            <TabsContent value="locations" className="mt-5 space-y-4">
              {board.locations.map((item) => (
                <AssetCard key={item.id} asset={item} look={project.look} />
              ))}
            </TabsContent>
            {counts.prop ? (
              <TabsContent value="props" className="mt-5 space-y-4">
                {board.props.map((item) => (
                  <AssetCard key={item.id} asset={item} look={project.look} />
                ))}
              </TabsContent>
            ) : null}
            {board.lookdev ? (
              <TabsContent value="lookdev" className="mt-5">
                <AssetCard asset={board.lookdev} look={project.look} />
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      )}
    </div>
  );
}

function StoryboardStep({ project }: { project: Project }) {
  const ep = currentEpisode(project);
  const shots = ep?.storyboard;
  const total = shots?.reduce((n, s) => n + s.durationSec, 0) ?? 0;
  return (
    <div>
      <StepHeader step="storyboard">
        <GenerateBar
          step="storyboard"
          next="prompts"
          nextLabel="生成提示词"
          done={Boolean(shots?.length)}
        />
      </StepHeader>
      <EpisodePicker />
      {!shots?.length ? (
        <EmptyHint text="每镜 3–8 秒，带可验证的起止帧。" />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {shots.length} 镜 · 约 {total} 秒
          </p>
          {shots.map((sh, i) => (
            <article
              key={sh.id}
              className="grid gap-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:grid-cols-[4.5rem_1fr]"
            >
              <div className="flex h-20 items-center justify-center rounded-xl bg-secondary font-serif text-lg tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-serif text-lg">{sh.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {sh.scale} · {sh.camera} · {sh.durationSec}s · {sh.sceneId}
                  </span>
                </div>
                <p className="mt-2 text-sm">{sh.action}</p>
                <p className="mt-2 text-xs text-muted-foreground">起：{sh.startFrame}</p>
                <p className="text-xs text-muted-foreground">止：{sh.endFrame}</p>
                {sh.dialogue ? (
                  <p className="mt-2 font-serif text-sm">「{sh.dialogue}」</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PromptsStep({ project }: { project: Project }) {
  const ep = currentEpisode(project);
  const look = project.look;
  const images = ep?.imagePrompts;
  const videos = ep?.videoPrompts;
  const done = Boolean(images && videos);
  const ratio = getRatio(look.ratioId).label;

  function exportPack() {
    downloadMarkdown(`${project.novel.title}-拍摄包.md`, buildPackageMarkdown(project));
  }

  return (
    <div>
      <StepHeader step="prompts">
        <div className="flex flex-wrap gap-2">
          <GenerateBar step="prompts" done={done} />
          <Button type="button" variant="paper" onClick={exportPack} disabled={!done}>
            <Download />
            导出拍摄包
          </Button>
        </div>
      </StepHeader>
      <EpisodePicker />
      {!done ? (
        <EmptyHint text="提示词字段不含质量词。质量词与负面词由视觉方向即时拼上，改词不必重跑模型。" />
      ) : (
        <Tabs defaultValue="image">
          <TabsList>
            <TabsTrigger value="image">图片 {images?.length ?? 0}</TabsTrigger>
            <TabsTrigger value="video">视频 {videos?.length ?? 0}</TabsTrigger>
          </TabsList>
          <TabsContent value="image" className="mt-5 space-y-4">
            {images?.map((img) => {
              const imagine = composeImaginePrompt(img, look);
              return (
                <PromptCard
                  key={img.id}
                  id={img.id}
                  kind="image"
                  kicker={img.kind}
                  title={img.title}
                  meta={img.notes}
                  positive={composeImaginePrompt(img, look)}
                  negative={composeImageNegative(look)}
                  imagineUrl={imagineUrl(imagine)}
                  agentUrl={imagineAgentUrl(imagine, ratio)}
                />
              );
            })}
          </TabsContent>
          <TabsContent value="video" className="mt-5 space-y-4">
            {videos?.map((v) => {
              const imagine = composeImagineVideoPrompt(v, look);
              return (
                <PromptCard
                  key={v.id}
                  id={v.id}
                  kind="video"
                  durationSec={v.durationSec}
                  kicker={v.shotId}
                  title={v.title}
                  meta={`${v.durationSec}s · ${v.cameraMove}`}
                  positive={composeImagineVideoPrompt(v, look)}
                  negative={composeVideoNegative(look)}
                  imagineUrl={imagineUrl(imagine)}
                  agentUrl={imagineVideoAgentUrl(imagine, ratio, v.durationSec)}
                />
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-secondary px-5 py-8 text-sm leading-relaxed text-muted-foreground">
      {text}
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: "worth" | "borderline" | "skip" }) {
  const map = {
    worth: { label: "值得拆", variant: "sage" as const },
    borderline: { label: "边缘", variant: "paper" as const },
    skip: { label: "建议跳过", variant: "rust" as const },
  };
  const v = map[verdict];
  return <Badge variant={v.variant}>{v.label}</Badge>;
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "sage" | "rust";
}) {
  return (
    <section className="rounded-2xl bg-secondary p-4">
      <p className={cn("text-xs tracking-wide", tone === "sage" ? "text-sage" : "text-destructive")}>
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function NoteCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl bg-secondary p-4">
      <p className="text-xs tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{body}</p>
    </section>
  );
}

function AssetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-serif text-lg">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}
