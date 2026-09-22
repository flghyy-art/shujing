import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexChapters } from "./chapter-index";
import { applyStyleDefaults, defaultLook } from "./look";
import { createSampleProject } from "./sample-project";
import type {
  Assets,
  DevelopmentResult,
  GenerateStep,
  ImagePromptFields,
  LookSettings,
  Project,
  Script,
  Shot,
  StepId,
  TriageResult,
  VideoPromptFields,
} from "./types";

type StudioState = {
  projects: Project[];
  activeId: string | null;
  lookOpen: boolean;
  generating: GenerateStep | null;
  error: string | null;
  active: () => Project | null;
  openSample: () => void;
  createFromText: (title: string, text: string) => void;
  closeProject: () => void;
  openProject: (id: string) => void;
  setStep: (step: StepId) => void;
  updateNovel: (title: string, text: string) => void;
  patchLook: (patch: Partial<LookSettings>) => void;
  setStyle: (styleId: string) => void;
  toggleQuality: (word: string) => void;
  toggleNegative: (word: string) => void;
  addCustomWord: (kind: "quality" | "negative", word: string) => void;
  removeCustomWord: (kind: "quality" | "negative", word: string) => void;
  setEpisode: (id: string) => void;
  applyTriage: (triage: TriageResult) => void;
  applyDevelopment: (development: DevelopmentResult) => void;
  applyScript: (script: Script) => void;
  applyAssets: (assets: Assets) => void;
  applyStoryboard: (shots: Shot[]) => void;
  applyPrompts: (image: ImagePromptFields[], video: VideoPromptFields[]) => void;
  setGenerating: (step: GenerateStep | null) => void;
  setError: (error: string | null) => void;
  setLookOpen: (open: boolean) => void;
  setRender: (assetId: string, url: string) => void;
  setClip: (assetId: string, url: string) => void;
  stillBusyId: string | null;
  setStillBusyId: (id: string | null) => void;
  deleteProject: (id: string) => void;
};

function touch(p: Project): Project {
  return { ...p, updatedAt: Date.now() };
}

function mapActive(projects: Project[], activeId: string | null, fn: (p: Project) => Project) {
  return projects.map((p) => (p.id === activeId ? touch(fn(p)) : p));
}

function newId() {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeId: null,
      lookOpen: false,
      generating: null,
      error: null,
      stillBusyId: null,
      active: () => get().projects.find((p) => p.id === get().activeId) ?? null,
      openSample: () => {
        const sample = createSampleProject();
        set((s) => {
          const rest = s.projects.filter((p) => p.id !== sample.id);
          return { projects: [sample, ...rest], activeId: sample.id, error: null };
        });
      },
      createFromText: (title, text) => {
        const id = newId();
        const chapters = indexChapters(text);
        const project: Project = {
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isSample: false,
          novel: { title: title.trim() || "未命名原著", text, chapters },
          look: defaultLook(),
          triage: null,
          development: null,
          currentEpisodeId: null,
          episodeWork: {},
          currentStep: "manuscript",
        };
        set((s) => ({ projects: [project, ...s.projects], activeId: id, error: null }));
      },
      closeProject: () => set({ activeId: null, lookOpen: false, generating: null, error: null }),
      openProject: (id) => set({ activeId: id, lookOpen: false, generating: null, error: null }),
      setStep: (step) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({ ...p, currentStep: step })),
        })),
      updateNovel: (title, text) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({
            ...p,
            novel: { title, text, chapters: indexChapters(text) },
          })),
        })),
      patchLook: (patch) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({
            ...p,
            look: { ...p.look, ...patch },
          })),
        })),
      setStyle: (styleId) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({
            ...p,
            look: applyStyleDefaults(p.look, styleId),
          })),
        })),
      toggleQuality: (word) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const inList = p.look.qualityWords.includes(word);
            const inCustom = p.look.customQuality.includes(word);
            if (inList || inCustom) {
              return {
                ...p,
                look: {
                  ...p.look,
                  qualityWords: p.look.qualityWords.filter((w) => w !== word),
                  customQuality: p.look.customQuality.filter((w) => w !== word),
                },
              };
            }
            return {
              ...p,
              look: { ...p.look, qualityWords: [...p.look.qualityWords, word] },
            };
          }),
        })),
      toggleNegative: (word) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const inList = p.look.negativeWords.includes(word);
            const inCustom = p.look.customNegative.includes(word);
            if (inList || inCustom) {
              return {
                ...p,
                look: {
                  ...p.look,
                  negativeWords: p.look.negativeWords.filter((w) => w !== word),
                  customNegative: p.look.customNegative.filter((w) => w !== word),
                },
              };
            }
            return {
              ...p,
              look: { ...p.look, negativeWords: [...p.look.negativeWords, word] },
            };
          }),
        })),
      addCustomWord: (kind, word) => {
        const w = word.trim();
        if (!w) return;
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const key = kind === "quality" ? "customQuality" : "customNegative";
            if (p.look[key].includes(w)) return p;
            return { ...p, look: { ...p.look, [key]: [...p.look[key], w] } };
          }),
        }));
      },
      removeCustomWord: (kind, word) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const key = kind === "quality" ? "customQuality" : "customNegative";
            return {
              ...p,
              look: { ...p.look, [key]: p.look[key].filter((x) => x !== word) },
            };
          }),
        })),
      setEpisode: (id) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({
            ...p,
            currentEpisodeId: id,
          })),
        })),
      applyTriage: (triage) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({
            ...p,
            triage,
            currentStep: "triage",
          })),
        })),
      applyDevelopment: (development) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const first = development.episodes[0];
            const work = { ...p.episodeWork };
            for (const ep of development.episodes) {
              work[ep.id] = work[ep.id] ?? {
                brief: ep,
                script: null,
                assets: null,
                storyboard: null,
                imagePrompts: null,
                videoPrompts: null,
              };
              work[ep.id] = { ...work[ep.id], brief: ep };
            }
            return {
              ...p,
              development,
              currentEpisodeId: p.currentEpisodeId ?? first?.id ?? null,
              episodeWork: work,
              currentStep: "episodes",
            };
          }),
        })),
      applyScript: (script) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const id = p.currentEpisodeId;
            if (!id || !p.episodeWork[id]) return p;
            return {
              ...p,
              episodeWork: {
                ...p.episodeWork,
                [id]: { ...p.episodeWork[id], script },
              },
              currentStep: "script",
            };
          }),
        })),
      applyAssets: (assets) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const id = p.currentEpisodeId;
            if (!id || !p.episodeWork[id]) return p;
            return {
              ...p,
              episodeWork: {
                ...p.episodeWork,
                [id]: { ...p.episodeWork[id], assets },
              },
              currentStep: "assets",
            };
          }),
        })),
      applyStoryboard: (shots) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const id = p.currentEpisodeId;
            if (!id || !p.episodeWork[id]) return p;
            return {
              ...p,
              episodeWork: {
                ...p.episodeWork,
                [id]: { ...p.episodeWork[id], storyboard: shots },
              },
              currentStep: "storyboard",
            };
          }),
        })),
      applyPrompts: (image, video) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => {
            const id = p.currentEpisodeId;
            if (!id || !p.episodeWork[id]) return p;
            return {
              ...p,
              episodeWork: {
                ...p.episodeWork,
                [id]: {
                  ...p.episodeWork[id],
                  imagePrompts: image,
                  videoPrompts: video,
                },
              },
              currentStep: "prompts",
            };
          }),
        })),
      setGenerating: (generating) => set({ generating }),
      setError: (error) => set({ error }),
      setLookOpen: (lookOpen) => set({ lookOpen }),
      setStillBusyId: (id) => set({ stillBusyId: id }),
      setRender: (assetId, url) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({
            ...p,
            renders: { ...p.renders, [assetId]: url },
          })),
        })),
      setClip: (assetId, url) =>
        set((s) => ({
          projects: mapActive(s.projects, s.activeId, (p) => ({
            ...p,
            clips: { ...p.clips, [assetId]: url },
          })),
        })),
      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
    }),
    {
      name: "shujing-studio",
      version: 2,
      partialize: (s) => ({ projects: s.projects, activeId: s.activeId }),
      migrate: (persisted, version) => {
        const s = persisted as { projects: Project[]; activeId: string | null };
        if (version < 2) {
          s.projects = (s.projects ?? []).map((p) => {
            if (p.isSample || p.id === "sample-garage") return createSampleProject();
            const isOldDefault =
              p.look?.styleId === "urban-drama" &&
              p.look?.ratioId === "9-16" &&
              p.look?.cameraId === "handheld-close";
            return isOldDefault ? { ...p, look: defaultLook() } : p;
          });
        }
        return s;
      },
    },
  ),
);
