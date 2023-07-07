import { onMount, type Component, createSignal } from "solid-js";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

const HandLandmarkDetection: Component = () => {
  const [isLoading, setIsLoading] = createSignal(true);
  const [isCameraError, setIsCameraError] = createSignal(false);
  const [isModelError, setIsModelError] = createSignal(false);

  onMount(async () => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    document.querySelector("#main")?.appendChild(canvas);

    video.setAttribute("autoplay", "true");

    let stream: MediaStream;

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
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        numHands: 2,
        runningMode: "VIDEO",
      });

      setIsLoading(false);

      let lastVideoTime = -1;
      function renderLoop(): void {
        if (video.currentTime !== lastVideoTime) {
          let time = performance.now();
          const result = handLandmarker.detectForVideo(video, time);

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (result.landmarks.length > 0) {
            for (const landmarks of result.landmarks) {
              drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5,
              });
              drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 });
            }
          }

          ctx.restore();

          lastVideoTime = video.currentTime;
        }

        requestAnimationFrame(() => renderLoop());
      }

      renderLoop();
    } catch (error) {
      setIsModelError(true);
    }
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

export default HandLandmarkDetection;
