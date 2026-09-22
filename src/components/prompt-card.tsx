import { Check, Copy, ExternalLink, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyPromptQuietly, copyToClipboard } from "@/lib/imagine-link";
import { getRatio } from "@/lib/look";
import { useStudio } from "@/lib/store";
import { useImagineStill } from "@/lib/use-generate";

async function copyText(label: string, text: string) {
  const ok = await copyToClipboard(text);
  if (ok) toast.success(`已复制${label}`);
  else toast.error("复制失败，请手动选中文本");
}

export function PromptCard({
  id,
  kind = "image",
  durationSec = 6,
  kicker,
  title,
  meta,
  positive,
  negative,
  imagineUrl,
}: {
  id: string;
  kind?: "image" | "video";
  durationSec?: number;
  kicker?: string;
  title: string;
  meta?: string;
  positive: string;
  negative: string;
  imagineUrl?: string;
  agentUrl?: string;
}) {
  const [copied, setCopied] = useState<"pos" | "neg" | "both" | "url" | null>(null);
  const look = useStudio((s) => s.active()?.look);
  const ratio = getRatio(look?.ratioId ?? "16-9");
  const { ai, busyId, generateStillFromPrompt, generateClipFromPrompt } = useImagineStill();
  const still = useStudio((s) => s.active()?.renders?.[id]);
  const clip = useStudio((s) => s.active()?.clips?.[id]);
  const busy = busyId === id;

  async function copy(kindKey: "pos" | "neg" | "both") {
    const text =
      kindKey === "pos" ? positive : kindKey === "neg" ? negative : `${positive}\n\nNegative: ${negative}`;
    const label = kindKey === "pos" ? "提示词" : kindKey === "neg" ? "负面词" : "提示词与负面词";
    await copyText(label, text);
    setCopied(kindKey);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <article className="rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {kicker ? (
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{kicker}</p>
          ) : null}
          <h3 className="font-serif text-lg leading-snug">{title}</h3>
          {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyBtn
            label="提示词"
            done={copied === "pos"}
            onClick={() => copy("pos")}
          />
          <CopyBtn
            label="负面"
            done={copied === "neg"}
            onClick={() => copy("neg")}
          />
          <CopyBtn
            label="全部"
            done={copied === "both"}
            onClick={() => copy("both")}
          />
          {imagineUrl ? (
            <CopyBtn
              label="链接"
              done={copied === "url"}
              onClick={async () => {
                await copyText("Imagine 链接", imagineUrl);
                setCopied("url");
                window.setTimeout(() => setCopied(null), 1400);
              }}
            />
          ) : null}
          {ai ? (
            <Button
              type="button"
              size="sm"
              disabled={Boolean(busyId)}
              onClick={() => {
                if (kind === "video") {
                  void generateClipFromPrompt(id, title, positive, ratio.label, durationSec, still);
                } else {
                  void generateStillFromPrompt(id, title, positive, ratio.label);
                }
              }}
            >
              {busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              {busy ? "生成中" : kind === "video" ? "生成视频" : "生成"}
            </Button>
          ) : null}
          {imagineUrl ? (
            <Button asChild size="sm" variant="secondary">
              <a
                href={imagineUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => copyPromptQuietly(positive)}
              >
                <ExternalLink />
                Imagine 代理
              </a>
            </Button>
          ) : null}
        </div>
      </header>
      {still && kind === "image" ? (
        <img src={still} alt={title} className="mb-3 w-full rounded-xl object-cover" />
      ) : null}
      {clip && kind === "video" ? (
        <video src={clip} controls playsInline className="mb-3 w-full rounded-xl bg-rail" />
      ) : null}
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-secondary p-3 font-mono text-xs leading-relaxed text-foreground/85">
        {positive}
      </pre>
      <p className="mt-3 text-xs tracking-wide text-destructive">Negative</p>
      <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap rounded-xl bg-secondary p-3 font-mono text-xs leading-relaxed text-muted-foreground">
        {negative}
      </pre>
      {imagineUrl ? (
        <p className="mt-3 text-xs text-muted-foreground">点生成会直接在本页出片。Imagine 代理会带上提示词；若没自动开画，提示词已复制。</p>
      ) : null}
    </article>
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
