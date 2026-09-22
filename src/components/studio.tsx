import { Download, ExternalLink, FastForward, LoaderCircle, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LookBar, LookStudio } from "@/components/look-studio";
import { PipelineNav } from "@/components/pipeline-nav";
import { StepViews } from "@/components/step-views";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ASSET_KIND_LABEL, buildAssetLibrary, buildImagineBatchLaunch } from "@/lib/asset-library";
import { buildPackageMarkdown, downloadMarkdown } from "@/lib/export-package";
import { copyPromptQuietly } from "@/lib/imagine-link";
import { getRatio } from "@/lib/look";
import { isStepComplete, progressCount } from "@/lib/pipeline";
import { useStudio } from "@/lib/store";
import { useAiAvailable, useGenerate, useImagineStill, WORKING_LABEL } from "@/lib/use-generate";

export function Studio() {
  const project = useStudio((s) => s.active());
  const closeProject = useStudio((s) => s.closeProject);
  const lookOpen = useStudio((s) => s.lookOpen);
  const setLookOpen = useStudio((s) => s.setLookOpen);
  const error = useStudio((s) => s.error);
  const setError = useStudio((s) => s.setError);
  const { generateRemaining, generating } = useGenerate();
  const ai = useAiAvailable();
  const { busyId, generateMany } = useImagineStill();
  const [imagineOpen, setImagineOpen] = useState(false);

  if (!project) return null;
  const progress = progressCount(project);
  const allDone = progress.done === progress.total;
  const imagineBatch = buildImagineBatchLaunch(project);
  const ratio = getRatio(project.look.ratioId);
  const autoTargets = buildAssetLibrary(project).filter(
    (a) =>
      a.kind === "lookdev" ||
      a.kind === "character" ||
      a.kind === "location" ||
      a.kind === "scene",
  );

  function exportPack() {
    if (!project) return;
    downloadMarkdown(`${project.novel.title}-拍摄包.md`, buildPackageMarkdown(project));
  }

  function openImagineSheet() {
    copyPromptQuietly(imagineBatch.clipboard);
    setImagineOpen(true);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={closeProject}
            className="min-w-0 text-left"
          >
            <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">竖镜</p>
            <p className="truncate font-serif text-lg leading-tight">{project.novel.title}</p>
          </button>
          <p className="hidden text-xs tabular-nums text-muted-foreground sm:block">
            {progress.done}/{progress.total}
          </p>
          <div className="ml-auto flex items-center gap-2">
            {ai && autoTargets.length ? (
              <Button
                type="button"
                size="sm"
                disabled={Boolean(busyId)}
                onClick={() => void generateMany(autoTargets, ratio.label, 6)}
              >
                {busyId ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                <span className="hidden sm:inline">{busyId ? "生成中" : "自动生成"}</span>
                <span className="sm:hidden">{busyId ? "…" : "生成"}</span>
              </Button>
            ) : null}
            {imagineBatch.count ? (
              <Button type="button" size="sm" variant={ai ? "paper" : "default"} onClick={openImagineSheet}>
                <Sparkles />
                <span className="hidden sm:inline">Imagine 代理</span>
                <span className="sm:hidden">Imagine</span>
              </Button>
            ) : null}
            {ai && !allDone ? (
              <Button
                type="button"
                size="sm"
                variant="paper"
                disabled={Boolean(generating)}
                onClick={() => void generateRemaining()}
              >
                <FastForward />
                <span className="hidden md:inline">连续生成</span>
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={exportPack}
              disabled={!isStepComplete(project, "assets") && !isStepComplete(project, "prompts")}
            >
              <Download />
              导出
            </Button>
            <Button type="button" size="icon-sm" variant="ghost" onClick={closeProject} aria-label="关闭项目">
              <X />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <aside className="border-b border-border px-3 py-3 lg:min-h-[calc(100dvh-4.25rem)] lg:border-r lg:border-b-0 lg:px-3 lg:py-6">
          <PipelineNav />
          <div className="mt-4 hidden lg:block">
            <LookBar />
          </div>
        </aside>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-5 lg:hidden">
            <LookBar />
          </div>
          {error ? (
            <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <p>{error}</p>
              <button type="button" className="shrink-0 text-xs" onClick={() => setError(null)}>
                关闭
              </button>
            </div>
          ) : null}
          <StepViews />
        </main>
      </div>

      <Sheet open={lookOpen} onOpenChange={setLookOpen}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>视觉方向</SheetTitle>
            <SheetDescription>
              风格、相机、画幅、质量词与负面词。改动会立刻重写提示词，不必重跑模型。
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-5 pb-8">
            <LookStudio compact />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={imagineOpen} onOpenChange={setImagineOpen}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Imagine 代理</SheetTitle>
            <SheetDescription>
              浏览器会拦截一次弹出多页。请逐条点开，每条都是你自己点的，不会被拦。提示词已复制。
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-5 pb-8">
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              若仍被拦：Chrome 点地址栏右侧「弹窗被拦截」→ 始终允许；Safari 设置 → 网站 → 弹出式窗口。
            </p>
            <ul className="space-y-2">
              {imagineBatch.pages.map((page) => (
                <li key={page.id}>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => toast.success(`已打开 ${page.name}`)}
                    className="flex items-center gap-3 rounded-2xl bg-secondary px-3 py-3 hover:bg-accent"
                  >
                    <span className="w-12 shrink-0 text-[11px] tracking-wide text-muted-foreground">
                      {ASSET_KIND_LABEL[page.kind]}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-serif">{page.name}</span>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {generating ? (
        <div className="fixed inset-x-0 bottom-5 z-40 mx-auto flex w-[min(92%,28rem)] items-center gap-3 rounded-2xl bg-paper px-4 py-3 text-paper-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          <p className="shimmer-text font-serif text-sm">{WORKING_LABEL[generating]}</p>
        </div>
      ) : null}
    </div>
  );
}
