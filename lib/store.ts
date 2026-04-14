import { create } from "zustand";

export type Gender = "male" | "female";

export type LandmarkPoint = {
  key: string;
  x: number;
  y: number;
  label: string;
};

export type MetricResult = {
  key: string;
  label: string;
  value: number;
  unit: string;
  score: number;
  average: string;
  message: string;
};

export type AnalysisSummary = {
  overall: number;
  angularity: number;
  dimorphism: number;
  metrics: MetricResult[];
};

type FaceIqState = {
  gender: Gender | null;
  frontPhoto: string | null;
  sidePhoto: string | null;
  frontLandmarks: LandmarkPoint[];
  sideLandmarks: LandmarkPoint[];
  frontConfirmed: boolean;
  sideConfirmed: boolean;
  analysis: AnalysisSummary | null;
  setGender: (gender: Gender) => void;
  setPhoto: (type: "front" | "side", dataUrl: string | null) => void;
  setLandmarks: (type: "front" | "side", landmarks: LandmarkPoint[]) => void;
  setConfirmed: (type: "front" | "side", confirmed: boolean) => void;
  setAnalysis: (analysis: AnalysisSummary) => void;
  resetLandmarks: () => void;
  resetAll: () => void;
};

const initialState = {
  gender: null,
  frontPhoto: null,
  sidePhoto: null,
  frontLandmarks: [],
  sideLandmarks: [],
  frontConfirmed: false,
  sideConfirmed: false,
  analysis: null,
};

export const useFaceIqStore = create<FaceIqState>((set) => ({
  ...initialState,
  setGender: (gender) => set({ gender }),
  setPhoto: (type, dataUrl) =>
    set((state) => ({
      ...state,
      [type === "front" ? "frontPhoto" : "sidePhoto"]: dataUrl,
    })),
  setLandmarks: (type, landmarks) =>
    set((state) => ({
      ...state,
      [type === "front" ? "frontLandmarks" : "sideLandmarks"]: landmarks,
      [type === "front" ? "frontConfirmed" : "sideConfirmed"]: false,
    })),
  setConfirmed: (type, confirmed) =>
    set((state) => ({
      ...state,
      [type === "front" ? "frontConfirmed" : "sideConfirmed"]: confirmed,
    })),
  setAnalysis: (analysis) => set({ analysis }),
  resetLandmarks: () => set({ frontLandmarks: [], sideLandmarks: [], frontConfirmed: false, sideConfirmed: false }),
  resetAll: () => set({ ...initialState }),
}));
