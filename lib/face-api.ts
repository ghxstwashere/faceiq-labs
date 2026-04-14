type FaceApiModule = typeof import("face-api.js");
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

  const detection = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.45 }))
    .withFaceLandmarks(true);

  return detection;
}
