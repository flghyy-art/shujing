export type StepId =
  | "manuscript"
  | "triage"
  | "episodes"
  | "look"
  | "script"
  | "assets"
  | "storyboard"
  | "prompts";

export type LookSettings = {
  styleId: string;
  cameraId: string;
  ratioId: string;
  qualityWords: string[];
  negativeWords: string[];
  customQuality: string[];
  customNegative: string[];
};

export type Chapter = {
  sequence: number;
  title: string;
  text: string;
};

export type Novel = {
  title: string;
  text: string;
  chapters: Chapter[];
};

export type TriageResult = {
  verdict: "worth" | "borderline" | "skip";
  densityNote: string;
  screenReady: string[];
  proseOnly: string[];
  openingReplace: string;
  productionLoad: string;
  recommendation: string;
};

export type EpisodeBrief = {
  id: string;
  number: number;
  title: string;
  logline: string;
  dramaticResult: string;
  sourceSpan: string;
  hook: string;
};

export type DevelopmentResult = {
  engine: string;
  directorNote: string;
  genre: string;
  episodes: EpisodeBrief[];
};

export type ScriptScene = {
  id: string;
  heading: string;
  time: string;
  location: string;
  action: string;
  dialogue: { character: string; line: string; parenthetical?: string }[];
};

export type Script = {
  episodeId: string;
  title: string;
  durationHint: string;
  scenes: ScriptScene[];
};

export type CharacterAsset = {
  id: string;
  name: string;
  age: string;
  identity: string;
  look: string;
  wardrobe: string;
  continuityLock: string;
};

export type LocationAsset = {
  id: string;
  name: string;
  description: string;
  lighting: string;
  views: string[];
  continuityLock: string;
};

export type PropAsset = {
  id: string;
  name: string;
  description: string;
  state: string;
  continuityLock: string;
};

export type Assets = {
  characters: CharacterAsset[];
  locations: LocationAsset[];
  props: PropAsset[];
};

export type Shot = {
  id: string;
  sceneId: string;
  title: string;
  scale: string;
  camera: string;
  durationSec: number;
  purpose: string;
  startFrame: string;
  endFrame: string;
  action: string;
  dialogue?: string;
};

export type ImagePromptFields = {
  id: string;
  kind: "lookdev" | "character" | "location" | "prop" | "keyframe";
  title: string;
  subject: string;
  wardrobe: string;
  setting: string;
  lighting: string;
  composition: string;
  notes: string;
};

export type VideoPromptFields = {
  id: string;
  shotId: string;
  title: string;
  durationSec: number;
  cameraMove: string;
  subject: string;
  action: string;
  setting: string;
  lighting: string;
  startState: string;
  endState: string;
  dialogue?: string;
  audio: string;
};

export type EpisodeWork = {
  brief: EpisodeBrief;
  script: Script | null;
  assets: Assets | null;
  storyboard: Shot[] | null;
  imagePrompts: ImagePromptFields[] | null;
  videoPrompts: VideoPromptFields[] | null;
};

export type Project = {
  id: string;
  createdAt: number;
  updatedAt: number;
  isSample: boolean;
  novel: Novel;
  look: LookSettings;
  triage: TriageResult | null;
  development: DevelopmentResult | null;
  currentEpisodeId: string | null;
  episodeWork: Record<string, EpisodeWork>;
  currentStep: StepId;
  renders?: Record<string, string>;
  clips?: Record<string, string>;
};

export type GenerateStep =
  | "triage"
  | "episodes"
  | "script"
  | "assets"
  | "storyboard"
  | "prompts";
