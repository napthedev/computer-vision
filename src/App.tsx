import { type Component } from "solid-js";

import { Route, Routes } from "@solidjs/router";
import Home from "./pages/Home";
import FaceDetection from "./pages/FaceDetection";
import HandLandmarkDetection from "./pages/HandLandmarkDetection";
import PoseLandmarkDetection from "./pages/PoseLandmarkDetection";
import ObjectDetection from "./pages/ObjectDetection";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/" component={Home}></Route>
      <Route path="/app/face-detection" component={FaceDetection}></Route>
      <Route
        path="/app/hand-landmark-detection"
        component={HandLandmarkDetection}
      ></Route>
      <Route
        path="/app/pose-landmark-detection"
        component={PoseLandmarkDetection}
      ></Route>
      <Route path="/app/object-detection" component={ObjectDetection}></Route>
      <Route path="*" element={<div>404</div>}></Route>
    </Routes>
  );
};

export default App;
