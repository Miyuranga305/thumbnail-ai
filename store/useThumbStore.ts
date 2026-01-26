import { create } from "zustand";

type Settings = {
  resolution: string;
  stylePreset: string;
  guidanceScale: number;
  steps: number;
  seed: number | null;
};

type State = {
  file: File | null;
  originalImageUrl: string;
  prompt: string;
  settings: Settings;
  generatedImageUrl: string;
  loading: boolean;
  setFile: (f: File | null) => void;
  setPrompt: (p: string) => void;
  setSettings: (s: Partial<Settings>) => void;
  setGeneratedImageUrl: (u: string) => void;
  setOriginalImageUrl: (u: string) => void;
  setLoading: (v: boolean) => void;
};

export const useThumbStore = create<State>((set) => ({
  file: null,
  originalImageUrl: "",
  prompt: "",
  settings: {
    resolution: "1024x1024",
    stylePreset: "realistic",
    guidanceScale: 7,
    steps: 30,
    seed: null,
  },
  generatedImageUrl: "",
  loading: false,

  setFile: (file) => set({ file }),
  setPrompt: (prompt) => set({ prompt }),
  setSettings: (settings) =>
    set((st) => ({ settings: { ...st.settings, ...settings } })),
  setGeneratedImageUrl: (generatedImageUrl) => set({ generatedImageUrl }),
  setOriginalImageUrl: (originalImageUrl) => set({ originalImageUrl }),
  setLoading: (loading) => set({ loading }),
}));
