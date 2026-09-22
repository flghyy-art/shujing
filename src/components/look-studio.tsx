import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CAMERAS,
  NEGATIVE_CATALOG,
  QUALITY_CATALOG,
  RATIOS,
  STYLES,
  allNegativeWords,
  allQualityWords,
  catalogNegativeSet,
  catalogQualitySet,
} from "@/lib/look";
import { composeImageNegative, composeImagePrompt } from "@/lib/compose-prompt";
import { useStudio } from "@/lib/store";
import type { LookSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

function WordChip({
  word,
  active,
  tone,
  onToggle,
}: {
  word: string;
  active: boolean;
  tone: "sage" | "rust";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "h-9 rounded-full px-3 text-[13px] transition-[background-color,color,box-shadow] duration-150",
        active && tone === "sage" && "bg-sage text-sage-foreground",
        active && tone === "rust" && "bg-destructive text-destructive-foreground",
        !active && "text-muted-foreground shadow-[var(--shadow-border)] hover:text-foreground",
      )}
    >
      {word}
    </button>
  );
}

function AddWord({
  onAdd,
  placeholder,
}: {
  onAdd: (w: string) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(value);
        setValue("");
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
      <Button type="submit" size="icon-sm" variant="secondary" aria-label="添加">
        <Plus />
      </Button>
    </form>
  );
}

export function RatioFrame({ look, className }: { look: LookSettings; className?: string }) {
  const ratio = RATIOS.find((r) => r.id === look.ratioId) ?? RATIOS[0];
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className="rain-panel relative overflow-hidden rounded-lg shadow-[var(--shadow-border)] transition-[width,height] duration-250 ease-out"
        style={{
          width: `${Math.min(160, 28 * (ratio.w / Math.max(ratio.h, ratio.w)) * 8 + 40)}px`,
          aspectRatio: `${ratio.w} / ${ratio.h}`,
          maxHeight: 220,
          minWidth: 64,
        }}
      >
        <div className="absolute inset-x-3 top-1/3 h-px bg-foreground/20" />
        <div className="absolute inset-y-4 left-1/2 w-px bg-foreground/15" />
        <span className="absolute bottom-2 left-0 right-0 text-center font-serif text-xs tracking-widest text-foreground/70">
          {ratio.label}
        </span>
      </div>
    </div>
  );
}

export function LookStudio({ compact = false }: { compact?: boolean }) {
  const project = useStudio((s) => s.active());
  const setStyle = useStudio((s) => s.setStyle);
  const patchLook = useStudio((s) => s.patchLook);
  const toggleQuality = useStudio((s) => s.toggleQuality);
  const toggleNegative = useStudio((s) => s.toggleNegative);
  const addCustomWord = useStudio((s) => s.addCustomWord);
  const removeCustomWord = useStudio((s) => s.removeCustomWord);

  if (!project) return null;
  const look = project.look;
  const quality = new Set(allQualityWords(look));
  const negative = new Set(allNegativeWords(look));

  return (
    <div className="space-y-8">
      <section>
        <Label>画幅</Label>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {RATIOS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => patchLook({ ratioId: r.id })}
              className={cn(
                "flex h-16 flex-col items-center justify-center rounded-xl text-xs transition-colors duration-150",
                look.ratioId === r.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="font-serif text-sm">{r.label}</span>
              <span className="mt-1 opacity-70">{r.name.replace(r.label, "").trim()}</span>
            </button>
          ))}
        </div>
        {!compact ? <RatioFrame look={look} className="mt-6" /> : null}
      </section>

      <section>
        <Label>风格</Label>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STYLES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStyle(st.id)}
              className={cn(
                "rounded-2xl p-4 text-left transition-[box-shadow,background-color] duration-150",
                look.styleId === st.id
                  ? "bg-paper text-paper-foreground"
                  : "bg-secondary text-foreground hover:bg-accent",
              )}
            >
              <p className="font-serif text-base">{st.name}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  look.styleId === st.id ? "text-paper-foreground/65" : "text-muted-foreground",
                )}
              >
                {st.blurb}
              </p>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">选定风格会套用推荐质量词与负面词，仍可逐条改。</p>
      </section>

      <section>
        <Label>相机语言</Label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CAMERAS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => patchLook({ cameraId: c.id })}
              className={cn(
                "rounded-xl px-3 py-3 text-left transition-colors duration-150",
                look.cameraId === c.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <p className="text-sm font-medium">{c.name}</p>
              <p className="mt-0.5 text-[11px] opacity-70">{c.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <Label>质量词</Label>
          <Badge variant="sage">{quality.size} 选用</Badge>
        </div>
        {QUALITY_CATALOG.map((g) => (
          <div key={g.group} className="mb-3">
            <p className="mb-2 text-[11px] tracking-wider text-muted-foreground uppercase">{g.group}</p>
            <div className="flex flex-wrap gap-2">
              {g.words.map((w) => (
                <WordChip
                  key={w}
                  word={w}
                  tone="sage"
                  active={quality.has(w)}
                  onToggle={() => toggleQuality(w)}
                />
              ))}
            </div>
          </div>
        ))}
        {look.customQuality.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {look.customQuality.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => removeCustomWord("quality", w)}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-sage px-3 text-[13px] text-sage-foreground"
              >
                {w}
                <X className="size-3" />
              </button>
            ))}
          </div>
        ) : null}
        <AddWord placeholder="自定义质量词" onAdd={(w) => addCustomWord("quality", w)} />
        <ExtraWords
          words={look.qualityWords.filter((w) => !catalogQualitySet().has(w))}
          tone="sage"
          onToggle={toggleQuality}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <Label>负面词</Label>
          <Badge variant="rust">{negative.size} 排除</Badge>
        </div>
        {NEGATIVE_CATALOG.map((g) => (
          <div key={g.group} className="mb-3">
            <p className="mb-2 text-[11px] tracking-wider text-muted-foreground uppercase">{g.group}</p>
            <div className="flex flex-wrap gap-2">
              {g.words.map((w) => (
                <WordChip
                  key={w}
                  word={w}
                  tone="rust"
                  active={negative.has(w)}
                  onToggle={() => toggleNegative(w)}
                />
              ))}
            </div>
          </div>
        ))}
        {look.customNegative.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {look.customNegative.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => removeCustomWord("negative", w)}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-destructive px-3 text-[13px] text-destructive-foreground"
              >
                {w}
                <X className="size-3" />
              </button>
            ))}
          </div>
        ) : null}
        <AddWord placeholder="自定义负面词" onAdd={(w) => addCustomWord("negative", w)} />
        <ExtraWords
          words={look.negativeWords.filter((w) => !catalogNegativeSet().has(w))}
          tone="rust"
          onToggle={toggleNegative}
        />
      </section>

      <LookPromptPreview />
    </div>
  );
}

export function LookBar() {
  const project = useStudio((s) => s.active());
  const setLookOpen = useStudio((s) => s.setLookOpen);
  if (!project) return null;
  const look = project.look;
  const style = STYLES.find((s) => s.id === look.styleId);
  const camera = CAMERAS.find((c) => c.id === look.cameraId);
  const ratio = RATIOS.find((r) => r.id === look.ratioId);
  return (
    <button
      type="button"
      onClick={() => setLookOpen(true)}
      className="flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-secondary px-4 py-3 text-left transition-colors duration-150 hover:bg-accent"
    >
      <RatioFrame look={look} className="hidden sm:flex" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">
          {style?.name} · {camera?.name} · {ratio?.label}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          质量 {allQualityWords(look).length} · 负面 {allNegativeWords(look).length} · 改词即时重写提示词
        </p>
      </div>
    </button>
  );
}

function ExtraWords({
  words,
  tone,
  onToggle,
}: {
  words: string[];
  tone: "sage" | "rust";
  onToggle: (word: string) => void;
}) {
  if (words.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {words.map((w) => (
        <WordChip key={w} word={w} tone={tone} active onToggle={() => onToggle(w)} />
      ))}
    </div>
  );
}

function LookPromptPreview() {
  const project = useStudio((s) => s.active());
  if (!project) return null;
  const look = project.look;
  const positive = composeImagePrompt(
    {
      id: "preview",
      kind: "lookdev",
      title: "预览",
      subject: "production still of the selected look",
      wardrobe: "",
      setting: "cinematic set",
      lighting: "motivated practicals",
      composition: "subject readable in the chosen aspect ratio",
      notes: "",
    },
    look,
  );
  const negative = composeImageNegative(look);
  return (
    <section className="rounded-2xl bg-secondary p-4">
      <Label>合成预览</Label>
      <p className="mt-1 text-xs text-muted-foreground">改风格、相机、画幅或词表，下面会马上重写。</p>
      <pre className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/80">
        {positive}
      </pre>
      <p className="mt-3 text-xs tracking-wide text-destructive">Negative</p>
      <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
        {negative}
      </pre>
    </section>
  );
}
