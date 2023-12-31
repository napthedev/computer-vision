import { onMount, type Component, createSignal, onCleanup } from "solid-js";
import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";
import { A } from "@solidjs/router";
import Overlay from "../components/Overlay";

const FaceDetection: Component = () => {
  const [isLoading, setIsLoading] = createSignal(true);
  const [isCameraError, setIsCameraError] = createSignal(false);
  const [isModelError, setIsModelError] = createSignal(false);

  let stream: MediaStream;
  let myAnimationFrame: ReturnType<typeof requestAnimationFrame>;

  onMount(async () => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

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
                ctx.font = "25px Arial";

                const text = `${Math.round(
                  detections[i].categories?.[0]?.score * 100
                )}%`;

                const textWidth = ctx.measureText(text).width;

                ctx.fillStyle = "#5383EC";
                ctx.fillRect(originX, originY, textWidth + 20, 35);

                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(text, originX + 10, originY + 25);
              }
            }
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
        <Overlay>Please allow camera permission</Overlay>
      ) : isModelError() ? (
        <Overlay>Something went wrong with the AI model</Overlay>
      ) : isLoading() ? (
        <Overlay>
          <img src="/spinner.svg" alt="" />
        </Overlay>
      ) : (
        <></>
      )}
      <div class="min-h-screen flex flex-col items-center">
        <div class="flex-1">
          <A href="/" class="inline-flex items-center my-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"
            >
              <path d="M21 11H6.414l5.293-5.293-1.414-1.414L2.586 12l7.707 7.707 1.414-1.414L6.414 13H21z"></path>
            </svg>
            <span>Back</span>
          </A>
        </div>
        <div class="flex-1" id="main"></div>
        <div class="flex-1"></div>
      </div>
    </div>
  );
};

export default FaceDetection;
