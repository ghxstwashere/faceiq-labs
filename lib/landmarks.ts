import type { LandmarkPoint } from "@/lib/store";

type RawPoint = { x: number; y: number };

const average = (points: RawPoint[]) => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});

function pick(points: RawPoint[], index: number) {
  return points[index] ?? { x: 0, y: 0 };
}

export function buildFrontLandmarks(points: RawPoint[]): LandmarkPoint[] {
  const leftPupil = average([pick(points, 36), pick(points, 37), pick(points, 38), pick(points, 39), pick(points, 40), pick(points, 41)]);
  const rightPupil = average([pick(points, 42), pick(points, 43), pick(points, 44), pick(points, 45), pick(points, 46), pick(points, 47)]);

  return [
    { key: "left_medial_canthus", label: "1", ...pick(points, 39) },
    { key: "left_lateral_canthus", label: "2", ...pick(points, 36) },
    { key: "right_medial_canthus", label: "3", ...pick(points, 42) },
    { key: "right_lateral_canthus", label: "4", ...pick(points, 45) },
    { key: "left_pupil", label: "5", ...leftPupil },
    { key: "right_pupil", label: "6", ...rightPupil },
    { key: "left_nose_wing", label: "7", ...pick(points, 31) },
    { key: "right_nose_wing", label: "8", ...pick(points, 35) },
    { key: "philtrum_top", label: "9", ...pick(points, 33) },
    { key: "philtrum_bottom", label: "10", ...pick(points, 51) },
    { key: "left_mouth_corner", label: "11", ...pick(points, 48) },
    { key: "right_mouth_corner", label: "12", ...pick(points, 54) },
    { key: "chin_bottom", label: "13", ...pick(points, 8) },
    { key: "left_gonion", label: "14", ...pick(points, 4) },
    { key: "right_gonion", label: "15", ...pick(points, 12) },
    { key: "left_zygion", label: "16", ...pick(points, 1) },
    { key: "right_zygion", label: "17", ...pick(points, 15) },
    { key: "left_brow_peak", label: "18", ...pick(points, 19) },
    { key: "right_brow_peak", label: "19", ...pick(points, 24) },
    { key: "upper_lip_center", label: "20", ...pick(points, 62) },
    { key: "lower_lip_center", label: "21", ...pick(points, 66) },
    { key: "nasion", label: "22", ...pick(points, 27) },
  ];
}

export function buildSideLandmarks(points: RawPoint[]): LandmarkPoint[] {
  return [
    { key: "glabella", label: "1", ...pick(points, 27) },
    { key: "nasion", label: "2", ...pick(points, 28) },
    { key: "pronasale", label: "3", ...pick(points, 30) },
    { key: "subnasale", label: "4", ...pick(points, 33) },
    { key: "labrale_superior", label: "5", ...pick(points, 51) },
    { key: "labrale_inferior", label: "6", ...pick(points, 57) },
    { key: "soft_tissue_pogonion", label: "7", ...pick(points, 8) },
    { key: "gonion", label: "8", ...pick(points, 4) },
    { key: "tragion", label: "9", ...pick(points, 2) },
    { key: "orbitale", label: "10", ...pick(points, 37) },
    { key: "upper_lip", label: "11", ...pick(points, 62) },
    { key: "lower_lip", label: "12", ...pick(points, 66) },
  ];
}

export function buildFallbackSideLandmarks(width: number, height: number): LandmarkPoint[] {
  const cx = width * 0.52;
  const top = height * 0.26;

  return [
    { key: "glabella", label: "1", x: cx - width * 0.06, y: top },
    { key: "nasion", label: "2", x: cx - width * 0.045, y: top + height * 0.045 },
    { key: "pronasale", label: "3", x: cx + width * 0.055, y: top + height * 0.10 },
    { key: "subnasale", label: "4", x: cx + width * 0.03, y: top + height * 0.16 },
    { key: "labrale_superior", label: "5", x: cx + width * 0.015, y: top + height * 0.205 },
    { key: "labrale_inferior", label: "6", x: cx + width * 0.01, y: top + height * 0.245 },
    { key: "soft_tissue_pogonion", label: "7", x: cx + width * 0.04, y: top + height * 0.34 },
    { key: "gonion", label: "8", x: cx - width * 0.02, y: top + height * 0.365 },
    { key: "tragion", label: "9", x: cx - width * 0.12, y: top + height * 0.19 },
    { key: "orbitale", label: "10", x: cx - width * 0.01, y: top + height * 0.09 },
    { key: "upper_lip", label: "11", x: cx + width * 0.012, y: top + height * 0.208 },
    { key: "lower_lip", label: "12", x: cx + width * 0.01, y: top + height * 0.25 },
  ];
}
