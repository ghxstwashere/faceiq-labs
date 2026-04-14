import type { LandmarkPoint } from "@/lib/store";

type RawPoint = { x: number; y: number };

const average = (points: RawPoint[]) => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});

function pick(points: RawPoint[], index: number) {
  return points[index] ?? { x: 0, y: 0 };
}

function mk(key: string, name: string, label: string, point: RawPoint): LandmarkPoint {
  return { key, name, label, x: point.x, y: point.y };
}

export function buildFrontLandmarks(points: RawPoint[]): LandmarkPoint[] {
  const leftPupil = average([pick(points, 36), pick(points, 37), pick(points, 38), pick(points, 39), pick(points, 40), pick(points, 41)]);
  const rightPupil = average([pick(points, 42), pick(points, 43), pick(points, 44), pick(points, 45), pick(points, 46), pick(points, 47)]);

  return [
    mk("left_medial_canthus", "Left medial canthus", "1", pick(points, 39)),
    mk("left_lateral_canthus", "Left lateral canthus", "2", pick(points, 36)),
    mk("right_medial_canthus", "Right medial canthus", "3", pick(points, 42)),
    mk("right_lateral_canthus", "Right lateral canthus", "4", pick(points, 45)),
    mk("left_pupil", "Left pupil center", "5", leftPupil),
    mk("right_pupil", "Right pupil center", "6", rightPupil),
    mk("left_nose_wing", "Left alar base", "7", pick(points, 31)),
    mk("right_nose_wing", "Right alar base", "8", pick(points, 35)),
    mk("nasion", "Nasion", "9", pick(points, 27)),
    mk("nose_tip", "Nose tip", "10", pick(points, 30)),
    mk("philtrum_top", "Philtrum top", "11", pick(points, 33)),
    mk("philtrum_bottom", "Philtrum bottom", "12", pick(points, 51)),
    mk("upper_lip_center", "Upper lip center", "13", pick(points, 62)),
    mk("lower_lip_center", "Lower lip center", "14", pick(points, 66)),
    mk("left_mouth_corner", "Left mouth corner", "15", pick(points, 48)),
    mk("right_mouth_corner", "Right mouth corner", "16", pick(points, 54)),
    mk("chin_bottom", "Menton (chin bottom)", "17", pick(points, 8)),
    mk("left_gonion", "Left gonion", "18", pick(points, 4)),
    mk("right_gonion", "Right gonion", "19", pick(points, 12)),
    mk("left_zygion", "Left zygion", "20", pick(points, 1)),
    mk("right_zygion", "Right zygion", "21", pick(points, 15)),
    mk("left_brow_peak", "Left brow peak", "22", pick(points, 19)),
    mk("right_brow_peak", "Right brow peak", "23", pick(points, 24)),
    mk("left_inner_brow", "Left inner brow", "24", pick(points, 21)),
    mk("right_inner_brow", "Right inner brow", "25", pick(points, 22)),
    mk("left_outer_brow", "Left outer brow", "26", pick(points, 17)),
    mk("right_outer_brow", "Right outer brow", "27", pick(points, 26)),
    mk("left_orbitale", "Left orbitale", "28", pick(points, 37)),
    mk("right_orbitale", "Right orbitale", "29", pick(points, 44)),
    mk("subnasale", "Subnasale", "30", pick(points, 33)),
  ];
}

export function buildSideLandmarks(points: RawPoint[]): LandmarkPoint[] {
  return [
    mk("glabella", "Glabella", "1", pick(points, 27)),
    mk("nasion", "Nasion", "2", pick(points, 28)),
    mk("pronasale", "Pronasale", "3", pick(points, 30)),
    mk("subnasale", "Subnasale", "4", pick(points, 33)),
    mk("labrale_superior", "Labrale superior", "5", pick(points, 51)),
    mk("labrale_inferior", "Labrale inferior", "6", pick(points, 57)),
    mk("soft_tissue_pogonion", "Pogonion", "7", pick(points, 8)),
    mk("gonion", "Gonion", "8", pick(points, 4)),
    mk("tragion", "Tragion", "9", pick(points, 2)),
    mk("orbitale", "Orbitale", "10", pick(points, 37)),
    mk("upper_lip", "Upper lip", "11", pick(points, 62)),
    mk("lower_lip", "Lower lip", "12", pick(points, 66)),
    mk("brow_ridge", "Brow ridge", "13", pick(points, 21)),
    mk("cervical_point", "Cervical point", "14", pick(points, 6)),
  ];
}

export function buildFallbackSideLandmarks(width: number, height: number): LandmarkPoint[] {
  const cx = width * 0.52;
  const top = height * 0.26;

  return [
    mk("glabella", "Glabella", "1", { x: cx - width * 0.06, y: top }),
    mk("nasion", "Nasion", "2", { x: cx - width * 0.045, y: top + height * 0.045 }),
    mk("pronasale", "Pronasale", "3", { x: cx + width * 0.055, y: top + height * 0.10 }),
    mk("subnasale", "Subnasale", "4", { x: cx + width * 0.03, y: top + height * 0.16 }),
    mk("labrale_superior", "Labrale superior", "5", { x: cx + width * 0.015, y: top + height * 0.205 }),
    mk("labrale_inferior", "Labrale inferior", "6", { x: cx + width * 0.01, y: top + height * 0.245 }),
    mk("soft_tissue_pogonion", "Pogonion", "7", { x: cx + width * 0.04, y: top + height * 0.34 }),
    mk("gonion", "Gonion", "8", { x: cx - width * 0.02, y: top + height * 0.365 }),
    mk("tragion", "Tragion", "9", { x: cx - width * 0.12, y: top + height * 0.19 }),
    mk("orbitale", "Orbitale", "10", { x: cx - width * 0.01, y: top + height * 0.09 }),
    mk("upper_lip", "Upper lip", "11", { x: cx + width * 0.012, y: top + height * 0.208 }),
    mk("lower_lip", "Lower lip", "12", { x: cx + width * 0.01, y: top + height * 0.25 }),
    mk("brow_ridge", "Brow ridge", "13", { x: cx - width * 0.03, y: top + height * 0.03 }),
    mk("cervical_point", "Cervical point", "14", { x: cx - width * 0.06, y: top + height * 0.44 }),
  ];
}
