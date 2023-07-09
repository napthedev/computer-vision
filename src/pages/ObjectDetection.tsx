import { onMount, type Component, createSignal, onCleanup } from "solid-js";
import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";

const ObjectDetection: Component = () => {
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
      const objectDetector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        scoreThreshold: 0.5,
      });

      setIsLoading(false);

      let lastVideoTime = -1;
      function renderLoop(): void {
        if (video.currentTime !== lastVideoTime) {
          let time = performance.now();
          const { detections } = objectDetector.detectForVideo(video, time);
          lastVideoTime = video.currentTime;

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = "#5DBEDC";
          ctx.lineWidth = 4;

          if (detections.length > 0) {
            for (let i = 0; i < detections.length; i++) {
              const { originX, originY, width, height } =
                detections[i].boundingBox!;
              ctx.strokeRect(originX, originY, width, height);

              if (detections[i].categories?.[0]?.score) {
                ctx.font = "25px Arial";

                const text = `${
                  detections[i].categories?.[0]?.categoryName
                }: ${Math.round(detections[i].categories?.[0]?.score * 100)}%`;

                const textWidth = ctx.measureText(text).width;

                ctx.fillStyle = "#5DBEDC";
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

export default ObjectDetection;