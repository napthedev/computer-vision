import { A } from "@solidjs/router";
import type { Component } from "solid-js";

const Home: Component = () => {
  return (
    <div>
      <A href="/app/face-detection">Face detection</A>
      <A href="/app/hand-landmark-detection">Hand landmark detection</A>
      <A href="/app/pose-landmark-detection">Pose landmark detection</A>
    </div>
  );
};

export default Home;
