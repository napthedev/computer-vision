import { onMount, type Component, createSignal, onCleanup } from "solid-js";
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const PoseLandmarkDetection: Component = () => {
  const [isLoading, setIsLoading] = createSignal(true);
  const [isCameraError, setIsCameraError] = createSignal(false);
  const [isModelError, setIsModelError] = createSignal(false);

  let stream: MediaStream;
  let myAnimationFrame: ReturnType<typeof requestAnimationFrame>;

  onMount(async () => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const drawingUtils = new DrawingUtils(ctx);

    document.querySelector("#main")?.appendChild(canvas);

    video.setAttribute("autoplay", "true");

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });

      video.srcObject = stream;

      const stream_settings = stream.getVideoTracks()[0].getSettings();
      const width = stream_settings.width;
      const height = stream_settings.height;

      if (width) canvas.width = width;
      if (height) canvas.height = height;
    } catch (error) {
      setIsCameraError(true);
      return;
    }

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const faceDetector = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 2,
      });

      setIsLoading(false);

      let lastVideoTime = -1;
      function renderLoop(): void {
        if (video.currentTime !== lastVideoTime) {
          let time = performance.now();
          const { landmarks } = faceDetector.detectForVideo(video, time);
          lastVideoTime = video.currentTime;

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          for (const landmark of landmarks) {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) =>
                DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(
              landmark,
              PoseLandmarker.POSE_CONNECTIONS
            );
          }

          ctx.restore();
        }

        myAnimationFrame = requestAnimationFrame(() => renderLoop());
      }

      renderLoop();
    } catch (error) {
      setIsModelError(true);
    }
  });

  onCleanup(() => {
    stream.getTracks().forEach((track) => track.stop());
    cancelAnimationFrame(myAnimationFrame);
  });

  return (
    <div>
      {isCameraError() ? (
        <div>Please allow camera permission</div>
      ) : isModelError() ? (
        <div>Something went wrong with the AI model</div>
      ) : isLoading() ? (
        <div>Loading...</div>
      ) : (
        <></>
      )}
      <div id="main"></div>
    </div>
  );
};

export default PoseLandmarkDetection;
