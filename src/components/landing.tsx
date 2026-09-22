import { ArrowRight, Clapperboard, FileText } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudio } from "@/lib/store";

export function Landing() {
  const createFromText = useStudio((s) => s.createFromText);
  const openSample = useStudio((s) => s.openSample);
  const openProject = useStudio((s) => s.openProject);
  const deleteProject = useStudio((s) => s.deleteProject);
  const projects = useStudio((s) => s.projects);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  function start() {
    if (text.trim().length < 40) return;
    createFromText(title, text);
  }

  async function onFile(file: File) {
    const body = await file.text();
    const nextTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");
    setTitle(nextTitle);
    setText(body);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex min-h-dvh">
        <aside className="sprocket hidden w-10 shrink-0 bg-rail lg:block" aria-hidden />
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:px-8 lg:py-12">
          <header className="stagger-in">
            <p className="text-xs tracking-[0.28em] text-muted-foreground">
              Cinematic drama studio
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-none tracking-tight sm:text-6xl">
              竖镜
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              默认横屏 16:9、电影感写实。把小说一步步拆成可拍准备包：快评、分集、剧本、资产、分镜，以及带质量词与负面词的提示词。
            </p>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <h2 className="font-serif text-xl">粘贴原著</h2>
              </div>
              <Label htmlFor="novel-title">书名</Label>
              <Input
                id="novel-title"
                className="mt-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="未命名原著"
              />
              <Label htmlFor="novel-body" className="mt-4 block">
                正文
              </Label>
              <Textarea
                id="novel-body"
                className="mt-2 min-h-48"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="至少四十个字。有章节标题会自动建索引。"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="button" onClick={start} disabled={text.trim().length < 40}>
                  开始拆解
                  <ArrowRight />
                </Button>
                <label className="text-sm text-muted-foreground">
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onFile(file);
                    }}
                  />
                  <span className="cursor-pointer underline-offset-4 hover:text-foreground hover:underline">
                    打开文本文件
                  </span>
                </label>
                <span className="text-xs text-muted-foreground">{text.trim().length} 字</span>
              </div>
            </section>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={openSample}
                className="group rain-panel relative overflow-hidden rounded-3xl p-6 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
              >
                <Badge variant="paper">样章 · 完整拍摄包</Badge>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-wide text-muted-foreground">
                      16:9 · 电影感写实
                    </p>
                    <h2 className="mt-1 font-serif text-2xl">修车铺</h2>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                      少东家雨夜进店羞辱女修理工，直到助理进门叫她林总。横屏一集、十个镜头，可直接翻看提示词。
                    </p>
                  </div>
                  <span className="hidden h-16 w-28 shrink-0 rounded-lg bg-foreground/8 shadow-[var(--shadow-border)] sm:block" />
                </div>
                <p className="mt-5 inline-flex items-center gap-2 text-sm text-foreground">
                  <Clapperboard className="size-4" />
                  打开并逐步查看
                </p>
              </button>

              {projects.filter((p) => !p.isSample).length > 0 ? (
                <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-border)]">
                  <h2 className="font-serif text-lg">最近项目</h2>
                  <ul className="mt-3 space-y-2">
                    {projects
                      .filter((p) => !p.isSample)
                      .slice(0, 6)
                      .map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2"
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => openProject(p.id)}
                          >
                            <p className="truncate text-sm">{p.novel.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.novel.chapters.length} 章 · {p.novel.text.trim().length} 字
                            </p>
                          </button>
                          <button
                            type="button"
                            className="h-11 px-2 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => deleteProject(p.id)}
                          >
                            删除
                          </button>
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>

          <footer className="mt-auto pt-12 text-xs text-muted-foreground">
            分析只提取可拍功能，不把原文成段复制进下游产物。风格、相机、画幅与词表随时可改。
          </footer>
        </div>
      </div>
    </div>
  );
}

export function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background text-foreground">
      <p className="font-serif text-4xl tracking-tight">竖镜</p>
      <p className="mt-2 text-sm text-muted-foreground">从小说到拍摄准备</p>
    </div>
  );
}
