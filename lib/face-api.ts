type FaceApiModule = typeof import("face-api.js");
type DetectionCandidate = {
  detection: { score: number };
  landmarks?: unknown;
};

let faceapi: FaceApiModule | null = null;
let loaded = false;
let fullModelsLoaded = false;

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

  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    ]);
    fullModelsLoaded = true;
  } catch {
    fullModelsLoaded = false;
  }

  loaded = true;
}

export async function detectLandmarks(image: HTMLImageElement, mode: "front" | "side" = "front") {
  if (!faceapi) {
    faceapi = await import("face-api.js");
  }
  if (!faceapi) return null;

  const variants = [
    image,
    enhanceForDetection(image),
    enhanceForDetection(image, true),
    createMirroredVariant(image),
    createCroppedVariant(image, mode),
    ...(mode === "side" ? [createRotatedVariant(image, -10), createRotatedVariant(image, 10)] : []),
  ];

  const tinyAttempts = [
    { inputSize: 608, scoreThreshold: mode === "side" ? 0.1 : 0.18 },
    { inputSize: 512, scoreThreshold: mode === "side" ? 0.08 : 0.15 },
    { inputSize: 416, scoreThreshold: mode === "side" ? 0.08 : 0.15 },
    { inputSize: 320, scoreThreshold: 0.05 },
  ];

  let best: DetectionCandidate | null = null;

  for (const source of variants) {
    for (const options of tinyAttempts) {
      const result = await faceapi
        .detectSingleFace(source, new faceapi.TinyFaceDetectorOptions(options))
        .withFaceLandmarks(true);

      best = pickBetter(best, result);
      if (result?.detection.score && result.detection.score > 0.62) return result;
    }

    if (fullModelsLoaded) {
      const result = await faceapi
        .detectSingleFace(source, new faceapi.SsdMobilenetv1Options({ minConfidence: mode === "side" ? 0.08 : 0.15 }))
        .withFaceLandmarks(false);

      best = pickBetter(best, result);
      if (result?.detection.score && result.detection.score > 0.62) return result;
    }
  }

  return best;
}

function pickBetter(current: DetectionCandidate | null, next: DetectionCandidate | null | undefined) {
  if (!next?.landmarks) return current;
  if (!current) return next;
  return next.detection.score > current.detection.score ? next : current;
}

function enhanceForDetection(image: HTMLImageElement, heavy = false) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return image;

  ctx.filter = heavy ? "grayscale(1) contrast(1.45) brightness(1.22)" : "contrast(1.18) brightness(1.08) saturate(1.05)";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function createMirroredVariant(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return image;

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function createCroppedVariant(image: HTMLImageElement, mode: "front" | "side") {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return image;

  const cropX = mode === "side" ? image.width * 0.15 : image.width * 0.08;
  const cropY = image.height * 0.05;
  const cropW = mode === "side" ? image.width * 0.7 : image.width * 0.84;
  const cropH = image.height * 0.9;

  ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function createRotatedVariant(image: HTMLImageElement, degrees: number) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return image;

  const radians = (degrees * Math.PI) / 180;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  return canvas;
}
