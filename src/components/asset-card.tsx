import { Check, Copy, ExternalLink, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ASSET_KIND_LABEL, type ProductionAsset, type SceneGroup } from "@/lib/asset-library";
import { copyPromptQuietly, copyToClipboard } from "@/lib/imagine-link";
import { getRatio } from "@/lib/look";
import { useStudio } from "@/lib/store";
import type { LookSettings } from "@/lib/types";
import { useImagineStill } from "@/lib/use-generate";

async function copyText(label: string, text: string) {
  const ok = await copyToClipboard(text);
  if (ok) toast.success(`已复制${label}`);
  else toast.error("复制失败，请手动选中文本");
}

function ImagineAnchor({
  href,
  copy,
  children,
  variant = "default",
}: {
  href: string;
  copy?: string;
  children: React.ReactNode;
  variant?: "default" | "paper" | "secondary";
}) {
  return (
    <Button asChild size="sm" variant={variant}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => copyPromptQuietly(copy)}
      >
        {children}
      </a>
    </Button>
  );
}

export function AssetCard({
  asset,
  look,
}: {
  asset: ProductionAsset;
  look: LookSettings;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const ratio = getRatio(look.ratioId);
  const { ai, busyId, generateStill } = useImagineStill();
  const renderUrl = useStudio((s) => s.active()?.renders?.[asset.id]);
  const busy = busyId === asset.id;

  async function copy(kind: string, text: string, label: string) {
    await copyText(label, text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <article className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl bg-rail shadow-[var(--shadow-border)]">
          <div className="relative w-full" style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}>
            {renderUrl ? (
              <img
                src={renderUrl}
                alt={asset.name}
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3">
                <span className="text-xs tracking-[0.18em] text-muted-foreground">
                  {ASSET_KIND_LABEL[asset.kind]}
                </span>
                <span className="text-center font-serif text-lg leading-tight text-balance">{asset.name}</span>
                <span className="text-xs text-muted-foreground">{ratio.label}</span>
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs tracking-wide text-muted-foreground">{asset.kicker}</p>
              <h3 className="mt-1 font-serif text-xl leading-snug text-balance">{asset.name}</h3>
            </div>
            <Badge variant="paper">{ASSET_KIND_LABEL[asset.kind]}</Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-pretty">{asset.summary}</p>
          {asset.facts.map((f) => (
            <p key={f.label} className="mt-1 text-sm text-muted-foreground">
              {f.label}：{f.value}
            </p>
          ))}
          {asset.sceneIds.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">场次 {asset.sceneIds.join(" · ")}</p>
          ) : null}
          {asset.continuityLock ? (
            <p className="mt-2 text-xs text-sage">锁：{asset.continuityLock}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CopyBtn
          label="提示词"
          done={copied === "prompt"}
          onClick={() => copy("prompt", asset.imaginePrompt, "Imagine 提示词")}
        />
        <CopyBtn
          label="负面"
          done={copied === "neg"}
          onClick={() => copy("neg", asset.negative, "负面词")}
        />
        <CopyBtn
          label="链接"
          done={copied === "url"}
          onClick={() => copy("url", asset.imagineUrl, "Imagine 链接")}
        />
        {ai ? (
          <Button
            type="button"
            size="sm"
            disabled={Boolean(busyId)}
            onClick={() => void generateStill(asset, ratio.label)}
          >
            {busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
            {busy ? "生成中" : renderUrl ? "再生成" : "生成"}
          </Button>
        ) : null}
        <ImagineAnchor href={asset.imagineUrl} copy={asset.imaginePrompt} variant="secondary">
          <ExternalLink />
          Imagine 代理
        </ImagineAnchor>
      </div>

      <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-secondary p-3 font-mono text-xs leading-relaxed text-foreground/85">
        {asset.imaginePrompt}
      </pre>
      <p className="mt-3 text-xs text-muted-foreground">
        点「生成」会直接出图。Imagine 代理会带上提示词；若没自动开画，提示词已复制。
      </p>
    </article>
  );
}

export function SceneShootCard({
  group,
  look,
}: {
  group: SceneGroup;
  look: LookSettings;
}) {
  return (
    <section className="space-y-4 rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <header>
        <p className="text-xs tracking-wide text-muted-foreground">
          {group.id} · {group.time}
        </p>
        <h3 className="mt-1 font-serif text-2xl leading-snug text-balance">{group.heading}</h3>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{group.action}</p>
        {group.characters.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {group.characters.map((c) => (
              <ImagineAnchor key={c.id} href={c.agentUrl} copy={c.imaginePrompt} variant="secondary">
                {c.name}
                <ExternalLink />
              </ImagineAnchor>
            ))}
          </div>
        ) : null}
      </header>
      <AssetCard asset={group.sceneStill} look={look} />
      {group.shots.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs tracking-wide text-muted-foreground">本场分镜帧</p>
          {group.shots.map((sh) => (
            <ShotImagineRow key={sh.id} asset={sh} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ShotImagineRow({ asset }: { asset: ProductionAsset }) {
  const [copied, setCopied] = useState(false);
  const look = useStudio((s) => s.active()?.look);
  const ratio = getRatio(look?.ratioId ?? "16-9");
  const { ai, busyId, generateStill, generateClip } = useImagineStill();
  const renderUrl = useStudio((s) => s.active()?.renders?.[asset.id]);
  const clipUrl = useStudio((s) => s.active()?.clips?.[asset.id]);
  const busy = busyId === asset.id;
  return (
    <div className="space-y-2 rounded-xl bg-secondary px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {renderUrl ? (
          <img src={renderUrl} alt="" className="size-10 rounded-md object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-sm">{asset.name}</p>
          <p className="truncate text-xs text-muted-foreground">{asset.kicker}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={async () => {
            await copyText("提示词", asset.videoPrompt ?? asset.imaginePrompt);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "已复制" : "提示词"}
        </Button>
        {ai ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={Boolean(busyId)}
            onClick={() => void generateStill(asset, ratio.label)}
          >
            {busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
            {busy ? "生成中" : "静帧"}
          </Button>
        ) : null}
        {ai ? (
          <Button
            type="button"
            size="sm"
            disabled={Boolean(busyId)}
            onClick={() => void generateClip(asset, ratio.label)}
          >
            {busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
            {busy ? "生成中" : "视频"}
          </Button>
        ) : null}
        <ImagineAnchor href={asset.imagineUrl} copy={asset.videoPrompt ?? asset.imaginePrompt} variant="secondary">
          Imagine 代理
        </ImagineAnchor>
      </div>
      {clipUrl ? (
        <video src={clipUrl} controls playsInline className="w-full rounded-lg bg-rail" />
      ) : null}
    </div>
  );
}

function CopyBtn({
  label,
  done,
  onClick,
}: {
  label: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <Button type="button" size="sm" variant="secondary" onClick={onClick}>
      {done ? <Check /> : <Copy />}
      {label}
    </Button>
  );
}
