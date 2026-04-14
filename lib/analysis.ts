import type { AnalysisSummary, Gender, LandmarkPoint, MetricResult } from "@/lib/store";

type P = { x: number; y: number };

const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a: P, b: P, c: P) => {
  const ab = Math.atan2(a.y - b.y, a.x - b.x);
  const cb = Math.atan2(c.y - b.y, c.x - b.x);
  let deg = Math.abs(((cb - ab) * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
};

function pointMap(points: LandmarkPoint[]) {
  return Object.fromEntries(points.map((p) => [p.key, p]));
}

function clampScore(score: number) {
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

function scoreFromRange(value: number, idealMin: number, idealMax: number, spread = 0.2) {
  if (value >= idealMin && value <= idealMax) return 9;
  const target = value < idealMin ? idealMin : idealMax;
  const delta = Math.abs(value - target);
  const score = 9 - (delta / spread) * 2.5;
  return clampScore(score);
}

function harsh(metric: string, valueText: string, avgText: string, score: number) {
  if (score >= 8) return `Your ${metric} is ${valueText}. This is one of the few things carrying your face. Average is ${avgText}.`;
  if (score >= 6) return `Your ${metric} is ${valueText}. Barely competitive. Average target is ${avgText}.`;
  if (score >= 4) return `Your ${metric} is ${valueText}. This reads painfully average and forgettable. Better faces sit near ${avgText}.`;
  if (score >= 2) return `Your ${metric} is ${valueText}. This is weak and drags your entire look down. Attractive faces cluster around ${avgText}.`;
  return `Your ${metric} is ${valueText}. This is a hard flaw, not a subtle one. Elite range is ${avgText}.`;
}

function metric(key: string, label: string, value: number, unit: string, avg: string, score: number): MetricResult {
  return {
    key,
    label,
    value: Math.round(value * 100) / 100,
    unit,
    average: avg,
    score: clampScore(score),
    message: harsh(label.toLowerCase(), `${Math.round(value * 100) / 100}${unit}`, avg, score),
  };
}

export function runAnalysis(front: LandmarkPoint[], side: LandmarkPoint[], gender: Gender): AnalysisSummary {
  const f = pointMap(front) as Record<string, P>;
  const s = pointMap(side) as Record<string, P>;

  const ipd = Math.max(dist(f.left_pupil, f.right_pupil), 1);
  const bizy = Math.max(dist(f.left_zygion, f.right_zygion), 1);
  const faceHeight = Math.max(dist(f.nasion, f.chin_bottom), 1);

  const fwhr = bizy / dist(f.upper_lip_center, f.nasion);
  const bigonialRatio = dist(f.left_gonion, f.right_gonion) / bizy;
  const leftTilt = Math.atan2(f.left_lateral_canthus.y - f.left_medial_canthus.y, f.left_lateral_canthus.x - f.left_medial_canthus.x) * (180 / Math.PI);
  const rightTilt = Math.atan2(f.right_lateral_canthus.y - f.right_medial_canthus.y, f.right_lateral_canthus.x - f.right_medial_canthus.x) * (180 / Math.PI);
  const canthalTilt = -(leftTilt + rightTilt) / 2;
  const noseWidthHeight = dist(f.left_nose_wing, f.right_nose_wing) / dist(f.nasion, f.philtrum_top);
  const chinPhiltrum = dist(f.philtrum_bottom, f.chin_bottom) / Math.max(dist(f.philtrum_top, f.philtrum_bottom), 1);
  const eyeSpacing = ipd / bizy;
  const lowerThird = dist(f.philtrum_bottom, f.chin_bottom) / faceHeight;

  const gonialAngle = angle(s.tragion, s.gonion, s.soft_tissue_pogonion);
  const nasolabialAngle = angle(s.columella ?? s.pronasale, s.subnasale, s.labrale_superior);
  const eLineX = (s.pronasale.x + s.soft_tissue_pogonion.x) / 2;
  const chinProjection = (s.soft_tissue_pogonion.x - eLineX) / Math.max(dist(s.nasion, s.subnasale), 1);
  const facialConvexity = angle(s.glabella, s.subnasale, s.soft_tissue_pogonion);

  const metrics: MetricResult[] = [];

  metrics.push(metric("fwhr", "FWHR", fwhr, "", gender === "male" ? "1.85-2.00" : "1.75-1.90", scoreFromRange(fwhr, gender === "male" ? 1.85 : 1.75, gender === "male" ? 2.0 : 1.9, 0.3)));
  metrics.push(metric("bigonial", "Bigonial/Bizygomatic Ratio", bigonialRatio, "", "0.70-0.75", scoreFromRange(bigonialRatio, 0.7, 0.75, 0.08)));
  metrics.push(metric("canthal", "Canthal Tilt", canthalTilt, "deg", "+5 to +8", scoreFromRange(canthalTilt, 5, 8, 5)));
  metrics.push(metric("nasal", "Nasal Width/Height", noseWidthHeight, "", "0.65-0.75", scoreFromRange(noseWidthHeight, 0.65, 0.75, 0.15)));
  metrics.push(metric("chinphil", "Chin:Philtrum Ratio", chinPhiltrum, "", "2.2-2.5", scoreFromRange(chinPhiltrum, 2.2, 2.5, 0.5)));
  metrics.push(metric("eyeSpacing", "Eye Spacing Ratio", eyeSpacing, "", "0.42-0.48", scoreFromRange(eyeSpacing, 0.42, 0.48, 0.08)));
  metrics.push(metric("lowerThird", "Lower Facial Third", lowerThird, "", "0.52-0.56", scoreFromRange(lowerThird, 0.52, 0.56, 0.08)));

  metrics.push(metric("gonialAngle", "Gonial Angle", gonialAngle, "deg", gender === "male" ? "118-128" : "122-132", scoreFromRange(gonialAngle, gender === "male" ? 118 : 122, gender === "male" ? 128 : 132, 12)));
  metrics.push(metric("nasolabial", "Nasolabial Angle", nasolabialAngle, "deg", gender === "male" ? "90-105" : "95-110", scoreFromRange(nasolabialAngle, gender === "male" ? 90 : 95, gender === "male" ? 105 : 110, 15)));
  metrics.push(metric("chinProjection", "Chin Projection", chinProjection, "", "0.05-0.15", scoreFromRange(chinProjection, 0.05, 0.15, 0.15)));
  metrics.push(metric("convexity", "Facial Convexity", facialConvexity, "deg", "160-168", scoreFromRange(facialConvexity, 160, 168, 20)));

  const angularitySet = ["fwhr", "bigonial", "gonialAngle", "chinProjection", "convexity"];
  const dimorphismSet = ["canthal", "chinphil", "bigonial", "nasolabial", "fwhr"];

  const angularity = clampScore(metrics.filter((m) => angularitySet.includes(m.key)).reduce((s, m) => s + m.score, 0) / angularitySet.length);
  const dimorphism = clampScore(metrics.filter((m) => dimorphismSet.includes(m.key)).reduce((s, m) => s + m.score, 0) / dimorphismSet.length);
  const overall = clampScore(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);

  return { overall, angularity, dimorphism, metrics };
}
