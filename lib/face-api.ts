type FaceApiModule = typeof import("face-api.js");
type DetectionCandidate = {
  detection: { score: number };
  landmarks?: unknown;
};

let faceapi: FaceApiModule | null = null;
let loaded = false;

export async function loadFaceApiModels() {
  if (loaded) return;
  if (!faceapi) {
    faceapi = await import("face-api.js");
  }
  if (!faceapi) return;

  const modelPath = "/models";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath),
  ]);
  loaded = true;
}

export async function detectLandmarks(image: HTMLImageElement) {
  if (!faceapi) {
    faceapi = await import("face-api.js");
  }
  if (!faceapi) return null;

  const variants = [image, enhanceForDetection(image), enhanceForDetection(image, true)];
  const attempts = [
    { inputSize: 512, scoreThreshold: 0.2 },
    { inputSize: 416, scoreThreshold: 0.2 },
    { inputSize: 320, scoreThreshold: 0.15 },
  ];

  let best: DetectionCandidate | null = null;

  for (const source of variants) {
    for (const options of attempts) {
      const result = await faceapi
        .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions(options))
        .withFaceLandmarks(true);

      if (!result?.landmarks) continue;
      if (!best || result.detection.score > best.detection.score) {
        best = result;
      }
      if (result.detection.score > 0.55) {
        return result;
      }
    }
  }

  return best;
}

function enhanceForDetection(image: HTMLImageElement, invert = false) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return image;

  // Mild contrast/luminance normalization helps side profiles and dark skin under harsh backlight.
  ctx.filter = invert ? "grayscale(1) contrast(1.25) brightness(1.18)" : "contrast(1.2) brightness(1.1) saturate(1.05)";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}
