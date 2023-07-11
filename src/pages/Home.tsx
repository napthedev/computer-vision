import { A } from "@solidjs/router";
import type { Component } from "solid-js";

const Home: Component = () => {
  return (
    <div class="m-4">
      <div class="mx-auto w-full max-w-[900px] grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] gap-4">
        <A
          href="/app/face-detection"
          class="flex flex-col items-start shadow-md rounded-md"
        >
          <img
            class="w-full aspect-video object-cover"
            src="/face-detection.png"
            alt=""
          />
          <p class="my-2 mx-3 text-lg font-medium">Face Detection</p>
        </A>
        <A
          href="/app/hand-landmark-detection"
          class="flex flex-col items-start shadow-md rounded-md"
        >
          <img
            class="w-full aspect-video object-cover"
            src="/hand-landmark-detection.png"
            alt=""
          />
          <p class="my-2 mx-3 text-lg font-medium">Hand Landmark Detection</p>
        </A>
        <A
          href="/app/pose-landmark-detection"
          class="flex flex-col items-start shadow-md rounded-md"
        >
          <img
            class="w-full aspect-video object-cover"
            src="/pose-landmark-detection.png"
            alt=""
          />
          <p class="my-2 mx-3 text-lg font-medium">Pose Landmark Detection</p>
        </A>
        <A
          href="/app/object-detection"
          class="flex flex-col items-start shadow-md rounded-md"
        >
          <img
            class="w-full aspect-video object-cover"
            src="/object-detection.png"
            alt=""
          />
          <p class="my-2 mx-3 text-lg font-medium">Object Detection</p>
        </A>
      </div>
    </div>
  );
};

export default Home;
