import { lazy, type Component } from "solid-js";

import { Route, Routes } from "@solidjs/router";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/" component={lazy(() => import("./pages/Home"))}></Route>
      <Route
        path="/app/face-detection"
        component={lazy(() => import("./pages/FaceDetection"))}
      ></Route>
      <Route
        path="/app/hand-landmark-detection"
        component={lazy(() => import("./pages/HandLandmarkDetection"))}
      ></Route>
    </Routes>
  );
};

export default App;
