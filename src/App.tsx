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
      <Route
        path="/app/pose-landmark-detection"
        component={lazy(() => import("./pages/PoseLandmarkDetection"))}
      ></Route>
      <Route
        path="/app/object-detection"
        component={lazy(() => import("./pages/ObjectDetection"))}
      ></Route>
      <Route path="*" element={<div>404</div>}></Route>
    </Routes>
  );
};

export default App;
