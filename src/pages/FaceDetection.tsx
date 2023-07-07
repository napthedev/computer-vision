import { onMount, type Component, createSignal } from "solid-js";
import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";

const FaceDetection: Component = () => {
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
      const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
      });

      setIsLoading(false);

      let lastVideoTime = -1;
      function renderLoop(): void {
        if (video.currentTime !== lastVideoTime) {
          let time = performance.now();
          const { detections } = faceDetector.detectForVideo(video, time);
          lastVideoTime = video.currentTime;

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = "#5383EC";
          ctx.lineWidth = 4;

          if (detections.length > 0) {
            for (let i = 0; i < detections.length; i++) {
              const { originX, originY, width, height } =
                detections[i].boundingBox!;
              ctx.strokeRect(originX, originY, width, height);

              if (detections[i].categories?.[0]?.score) {
                ctx.fillStyle = "#5383EC";
                ctx.fillRect(originX, originY, 70, 35);

                ctx.fillStyle = "#FFFFFF";
                ctx.font = "25px Arial";
                ctx.fillText(
                  `${Math.round(detections[i].categories?.[0]?.score * 100)}%`,
                  originX + 10,
                  originY + 25
                );
              }
            }
          }

          ctx.restore();
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

export default FaceDetection;
