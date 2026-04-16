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
  // "Brutal" calibration: being in the ideal range is only slightly above average.
  // High scores should be rare; most humans should land ~4-6 overall unless multiple metrics are elite.
  const peak = 6.2;
  if (value >= idealMin && value <= idealMax) return clampScore(peak);
  const target = value < idealMin ? idealMin : idealMax;
  const delta = Math.abs(value - target);
  const score = peak - (delta / spread) * 4.25;
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

  const safe = (p: P | undefined, fallback: P): P => (p && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : fallback);
  const SF = (key: keyof typeof f, fallback: P): P => safe(f[key as string], fallback);
  const SS = (key: keyof typeof s, fallback: P): P => safe(s[key as string], fallback);

  const ipd = Math.max(dist(SF("left_pupil", { x: 0, y: 0 }), SF("right_pupil", { x: 1, y: 0 })), 1);
  const bizy = Math.max(dist(SF("left_zygion", { x: 0, y: 0 }), SF("right_zygion", { x: 1, y: 0 })), 1);
  const faceHeight = Math.max(dist(SF("nasion", { x: 0, y: 0 }), SF("chin_bottom", { x: 0, y: 1 })), 1);

  const fwhr = bizy / Math.max(dist(SF("upper_lip_center", { x: 0, y: 1 }), SF("nasion", { x: 0, y: 0 })), 1);
  const bigonialRatio = Math.max(dist(SF("left_gonion", { x: 0, y: 0 }), SF("right_gonion", { x: 1, y: 0 })), 1) / bizy;
  const leftTilt =
    (Math.atan2(
      SF("left_lateral_canthus", { x: 0, y: 0 }).y - SF("left_medial_canthus", { x: 0, y: 0 }).y,
      SF("left_lateral_canthus", { x: 0, y: 0 }).x - SF("left_medial_canthus", { x: 0, y: 0 }).x,
    ) *
      180) /
    Math.PI;
  const rightTilt =
    (Math.atan2(
      SF("right_lateral_canthus", { x: 0, y: 0 }).y - SF("right_medial_canthus", { x: 0, y: 0 }).y,
      SF("right_lateral_canthus", { x: 0, y: 0 }).x - SF("right_medial_canthus", { x: 0, y: 0 }).x,
    ) *
      180) /
    Math.PI;
  const canthalTilt = -(leftTilt + rightTilt) / 2;
  const noseWidthHeight =
    Math.max(dist(SF("left_nose_wing", { x: 0, y: 0 }), SF("right_nose_wing", { x: 1, y: 0 })), 1) /
    Math.max(dist(SF("nasion", { x: 0, y: 0 }), SF("philtrum_top", { x: 0, y: 1 })), 1);
  const chinPhiltrum =
    Math.max(dist(SF("philtrum_bottom", { x: 0, y: 0 }), SF("chin_bottom", { x: 0, y: 1 })), 1) /
    Math.max(dist(SF("philtrum_top", { x: 0, y: 0 }), SF("philtrum_bottom", { x: 0, y: 1 })), 1);
  const eyeSpacing = ipd / bizy;
  const lowerThird = Math.max(dist(SF("philtrum_bottom", { x: 0, y: 0 }), SF("chin_bottom", { x: 0, y: 1 })), 1) / faceHeight;

  const gonialAngle = angle(
    SS("tragion", { x: 0, y: 0 }),
    SS("gonion", { x: 1, y: 0 }),
    SS("soft_tissue_pogonion", { x: 2, y: 0 }),
  );
  // Columella isn't currently captured by our side-landmark set; use pronasale as the anterior nasal point.
  const nasolabialAngle = angle(
    SS("pronasale", { x: 0, y: 0 }),
    SS("subnasale", { x: 1, y: 0 }),
    SS("labrale_superior", { x: 2, y: 0 }),
  );
  const eLineX = (SS("pronasale", { x: 0, y: 0 }).x + SS("soft_tissue_pogonion", { x: 1, y: 0 }).x) / 2;
  const chinProjection = (SS("soft_tissue_pogonion", { x: 0, y: 0 }).x - eLineX) / Math.max(dist(SS("nasion", { x: 0, y: 0 }), SS("subnasale", { x: 0, y: 1 })), 1);
  const facialConvexity = angle(SS("glabella", { x: 0, y: 0 }), SS("subnasale", { x: 1, y: 0 }), SS("soft_tissue_pogonion", { x: 2, y: 0 }));

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
